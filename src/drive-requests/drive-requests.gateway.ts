import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  OnGatewayInit,
  ConnectedSocket,
  WsException,
  BaseWsExceptionFilter,
} from '@nestjs/websockets';
import { Socket, RemoteSocket, Namespace } from 'socket.io';
import { RequestDriveDto } from './dto/request-drive.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { Logger, UseFilters } from '@nestjs/common';
import { Auth0JwtService } from 'src/authorization/providers/auth0/auth0-jwt.service';
import { auth0JwtSocketIoMiddleware } from 'src/authorization/providers/auth0/auth0-jwt.middleware';
import { UsersService } from 'src/users/users.service';
import { UserIdentificationType } from 'src/users/dtos/find-one-user-query.dto';
import { ConfigService } from '@nestjs/config';
import { ServiceSpotsService } from 'src/service-spots/service-spots.service';
import * as moment from 'moment';
import { CreateDriveRequestChatDto } from './dto/create-drive-request-chat.dto';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { UpdateDriveRequestStatusDto } from './dto/update-drive-request-status.dto';
import { customAlphabet, nanoid } from 'nanoid';
import { RedisDriveRequestStore } from './stores/redis-drive-request.store';
import {
  DriveRequestSession,
  DriveRequestSessionStatus,
} from './stores/dto/drive-request-session.dto';
import { DriveRequestsService } from './drive-requests.service';
import { DriveRequestStatus } from './entities/drive-request.entity';
import { InjectRedis } from '@nestjs-modules/ioredis';
import Redis from 'ioredis';
import { Driver } from 'src/drivers/entities/driver.entity';
import { AddressType, Language, ReverseGeocodeRequest } from '@googlemaps/google-maps-services-js';
import { GoogleMapsService } from 'src/externals/google-maps/google-maps.service';

@UseFilters(new BaseWsExceptionFilter())
@WebSocketGateway({
  namespace: 'drive-request',
  path: process.env.SOCKET_IO_PATH,
})
export class DriveRequestsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(DriveRequestsGateway.name);

  constructor(
    private readonly configService: ConfigService,
    private readonly auth0JwtService: Auth0JwtService,
    private readonly serviceSpotsService: ServiceSpotsService,
    private readonly driversService: DriversService,
    private readonly usersService: UsersService,
    private readonly redisDriveRequestStore: RedisDriveRequestStore,
    private readonly driveRequestsService: DriveRequestsService,
    private readonly googleMapsService: GoogleMapsService,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  @WebSocketServer()
  server: Namespace;

  afterInit() {
    this.server.use(auth0JwtSocketIoMiddleware(this.auth0JwtService));
  }

  handleConnection(socket: Socket) {
    socket.leave(socket.id);
    socket.join(socket.data.user.user_id);
    switch (socket.data.decodedToken.azp) {
      case this.configService.get('DRIVER_APP_AUTH0_CLIENT_ID'):
        this.handleDriverConnection(socket);
        break;
      case this.configService.get('PASSENGER_APP_AUTH0_CLIENT_ID'):
        this.handlePassengerConnection(socket);
        break;
      default:
        throw this.rejectUnauthorizedClient(
          socket,
          'Invalid client. Please use the driver or passenger app to connect to the server.',
        );
    }
  }

  handleDisconnect(socket: Socket) {
    this.logger.debug(`Client disconnected: ${socket.data.user.user_id}`);
  }

  @SubscribeMessage('request-drive')
  async create(
    @ConnectedSocket() passengerSocket: Socket,
    @MessageBody() requestDriveDto: RequestDriveDto,
  ) {
    const user = await this.usersService.findOne(
      passengerSocket.data.user.user_id,
      UserIdentificationType.ID,
    );

    if (!user) {
      throw new WsException('You are not authorized to perform this action');
    }

    const { origin, destination, route } = requestDriveDto;

    const driverSocket = await this.findDriverSocketToOfferJob(user.id, origin);

    const reverseGeocodeParams: ReverseGeocodeRequest['params'] = {
      language: Language.th,
      result_type: [AddressType.street_address, AddressType.route],
      key: this.googleMapsService.placesApiKey,
    };

    const [originDetail, destinationDetail] = await Promise.all([
      this.googleMapsService
        .reverseGeocode({
          params: {
            ...reverseGeocodeParams,
            latlng: {
              lat: origin.lat,
              lng: origin.lng,
            },
          },
        })
        .then((res) => res.data.results[0]),
      this.googleMapsService
        .reverseGeocode({
          params: {
            ...reverseGeocodeParams,
            latlng: {
              lat: destination.lat,
              lng: destination.lng,
            },
          },
        })
        .then((res) => res.data.results[0]),
    ]);
    const customId = customAlphabet('1234567890', 6);
    const id = `DR-${moment().format('YYMMDD')}-${customId()}`;
    const createdAt = moment().toISOString();

    const payload: DriveRequestSession = {
      ...route,
      id,
      userId: user.id,
      origin: {
        name: originDetail.formatted_address,
        location: origin,
      },
      destination: {
        name: destinationDetail.formatted_address,
        location: destination,
      },
      status: DriveRequestSessionStatus.PENDING,
      createdAt,
    };

    const sid = nanoid();
    await this.redisDriveRequestStore.saveDriveRequest(sid, payload);
    const driver = await this.driversService.findOneWithInfo({
      where: { id: driverSocket.data.user.user_id },
    });

    this.server.to(driverSocket.data.user.user_id).emit('job-offer', {
      ...payload,
      sid,
      user,
      driver,
    });
  }

  @SubscribeMessage('accept-drive-request')
  async acceptedRequest(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() data: DriveRequestSession,
  ) {
    const driveRequestExists = await this.redisDriveRequestStore.exists(data.sid);
    if (!driveRequestExists) {
      throw new WsException('Drive request not found');
    }

    const canTransition = this.redisDriveRequestStore.canTransitionTo(
      data.status,
      DriveRequestSessionStatus.ON_GOING,
    );

    if (!canTransition) {
      throw new WsException('Invalid drive request status transition');
    }

    const payload = {
      status: DriveRequestSessionStatus.ON_GOING,
      driverId: driverSocket.data.user.user_id,
    };
    await this.redisDriveRequestStore.saveDriveRequest(data.sid, payload);
    this.redis.set(`drivers:${driverSocket.data.user.user_id}:drive-request-session`, data.sid);
    this.redis.set(`users:${data.userId}:drive-request-session`, data.sid);
    this.server
      .to(data.userId)
      .to(driverSocket.data.user.user_id)
      .emit('drive-request-created', {
        ...data,
        ...payload,
      });
  }

  @SubscribeMessage('reject-drive-request')
  async rejectRequest(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() data: DriveRequestSession,
  ) {
    // Cooldown driver for 1 minutes before they can get another job offer
    if (this.configService.get('NODE_ENV') === 'production') {
      driverSocket.data.cooldown = moment().add(1, 'minutes').toISOString();
    }

    try {
      const newDriverSocket = await this.findDriverSocketToOfferJob(
        data.userId,
        data.origin.location,
      );
      const driver = await this.driversService.findOneWithInfo({
        where: { id: newDriverSocket.data.user.user_id },
      });
      this.server.to(newDriverSocket.data.user.user_id).emit('job-offer', {
        ...data,
        driver,
      });
    } catch (error: unknown) {
      this.redisDriveRequestStore.removeDriveRequest(data.sid);
      this.server.to(data.userId).emit('drive-request-rejected', data);
    }
  }

  @SubscribeMessage('update-drive-request-status')
  async updateDriveRequestStatus(@MessageBody() data: UpdateDriveRequestStatusDto) {
    const driveRequest = await this.redisDriveRequestStore.findDriveRequest(data.driveRequestSid);
    if (!driveRequest) {
      throw new WsException('Drive request not found');
    }

    const canTransition = this.redisDriveRequestStore.canTransitionTo(
      driveRequest.status,
      data.status,
    );

    if (!canTransition) {
      throw new WsException('Invalid drive request status transition');
    }

    const payload = {
      status: data.status,
    };

    if (payload.status === DriveRequestSessionStatus.COMPLETED) {
      await this.redisDriveRequestStore.removeDriveRequest(data.driveRequestSid);
      await this.driveRequestsService.create({
        id: driveRequest.id,
        userId: driveRequest.userId,
        driverId: driveRequest.driverId,
        origin: driveRequest.origin,
        destination: driveRequest.destination,
        distanceMeters: driveRequest.distanceMeters,
        paidAmount: driveRequest.total,
        status: DriveRequestStatus.COMPLETED,
      });
      this.redis.del(`drivers:${driveRequest.driverId}:drive-request-session`);
      this.redis.del(`users:${driveRequest.userId}:drive-request-session`);
      this.server.to(driveRequest.userId).to(driveRequest.driverId).emit('drive-request-completed');
      return;
    } else {
      await this.redisDriveRequestStore.saveDriveRequest(data.driveRequestSid, payload);
    }

    this.server
      .to(driveRequest.userId)
      .to(driveRequest.driverId)
      .emit('drive-request-updated', payload);
  }

  @SubscribeMessage('get-chat-messages')
  async getChatMessages(@MessageBody() driveRequestSid: string) {
    const messages = await this.redisDriveRequestStore.findMessages(driveRequestSid);
    return messages;
  }

  @SubscribeMessage('chat-message')
  async chatMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: CreateDriveRequestChatDto,
  ) {
    const from = client.data.user.user_id;
    const payload = {
      from,
      to: data.to,
      content: data.message,
      timestamp: new Date().toISOString(),
    };
    client.to(data.to).emit('chat-message-received', payload);
    this.redisDriveRequestStore.saveMessage(data.driveRequestSid, payload);
  }

  @SubscribeMessage('update-driver-status')
  async updateDriverStatus(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() onlineStatus: boolean,
  ) {
    driverSocket.data.online = onlineStatus;
    driverSocket.emit('sync-driver-status', onlineStatus);
  }

  private async findDriverSocketToOfferJob(userId: string, origin: Coordinate) {
    const nearbyServiceSpots = await this.serviceSpotsService.findAllByDistance(
      origin.lat,
      origin.lng,
      2000,
    );

    if (nearbyServiceSpots.length <= 0) {
      throw new WsException('No nearby service spots found');
    }

    let driverSocket: RemoteSocket<any, any> | null = null;

    for (const nearbyServiceSpot of nearbyServiceSpots) {
      const serviceSpotRoom = this.getServiceSpotRoom(nearbyServiceSpot.id);
      let driverSockets = await this.server.in(serviceSpotRoom).fetchSockets();

      driverSockets = driverSockets.filter((socket) => {
        if (!socket.data.cooldown && socket.data.online) {
          return true;
        }
        return moment(socket.data.cooldown).isBefore(moment());
      });

      if (driverSockets.length <= 0) {
        continue;
      }

      const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
      const rndDriverSocket = driverSockets[rnd % driverSockets.length];

      if (rndDriverSocket.data.user.user_id === userId) {
        continue;
      }

      driverSocket = rndDriverSocket;
    }

    if (!driverSocket) {
      this.logger.error('No driver available at the moment');
      throw new WsException('No drive available at the moment. Please try again later.');
    }

    return driverSocket;
  }

  private getServiceSpotRoom(serviceSpotId: number) {
    return `service-spots:${serviceSpotId}`;
  }

  private async handleDriverConnection(socket: Socket) {
    let driver: Driver | null = null;
    try {
      driver = await this.driversService.findOneById(socket.data.user.user_id, {
        loadEagerRelations: false,
        select: {
          id: true,
          serviceSpot: {
            id: true,
          },
        },
        relations: {
          serviceSpot: true,
        },
      });
    } catch (error: any) {
      this.rejectUnauthorizedClient(socket, 'An error occurred getting driver info');
    }
    if (!driver.serviceSpot) {
      this.rejectUnauthorizedClient(socket, 'Driver does not have a service spot');
    }
    const serviceSpotRoom = this.getServiceSpotRoom(driver.serviceSpot.id);
    socket.join(serviceSpotRoom);

    const currentDriveRequestSid = await this.redis.get(
      `drivers:${socket.data.user.user_id}:drive-request-session`,
    );

    if (currentDriveRequestSid) {
      const driveRequest = await this.redisDriveRequestStore.findDriveRequest(
        currentDriveRequestSid,
      );
      const driverWithInfo = await this.driversService.findOneWithInfo({
        where: {
          id: socket.data.user.user_id,
        },
      });
      const user = await this.usersService.findOne(driveRequest.userId, UserIdentificationType.ID);
      if (driveRequest) {
        socket.emit('job-offer', {
          ...driveRequest,
          sid: currentDriveRequestSid,
          user,
          driver: driverWithInfo,
        });
      }
    }
    socket.data.online = false;
    socket.emit('sync-driver-status', socket.data.online);
    this.logger.debug(
      `Driver connected: ${socket.data.user.user_id} and joined ${serviceSpotRoom}`,
    );
  }

  private async handlePassengerConnection(socket: Socket) {
    this.logger.debug(`Passenger connected: ${socket.data.user.user_id}`);

    const currentDriveRequestSid = await this.redis.get(
      `users:${socket.data.user.user_id}:drive-request-session`,
    );
    if (currentDriveRequestSid) {
      const driveRequest = await this.redisDriveRequestStore.findDriveRequest(
        currentDriveRequestSid,
      );
      if (driveRequest) {
        const user = await this.usersService.findOne(
          driveRequest.userId,
          UserIdentificationType.ID,
        );
        const driver = await this.driversService.findOneWithInfo({
          where: { id: driveRequest.driverId },
        });
        socket.emit('drive-request-created', {
          ...driveRequest,
          sid: currentDriveRequestSid,
          user,
          driver,
        });
      }
    }
  }

  private rejectUnauthorizedClient(socket: Socket, reason: string) {
    socket.disconnect();
    throw new WsException(reason);
  }
}
