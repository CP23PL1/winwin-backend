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
import { DriverDto } from 'src/drivers/dtos/driver.dto';
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
import { GoogleApiService } from 'src/externals/google-api/google-api.service';

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
    private readonly googleApiService: GoogleApiService,
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

    const customId = customAlphabet('1234567890', 6);
    const refCode = `DR-${moment().format('YYMMDD')}-${customId()}`;
    const createdAt = moment().toISOString();

    const [originDetail, destinationDetail] = await Promise.all([
      this.googleApiService.getReverseGeocode(origin),
      this.googleApiService.getReverseGeocode(destination),
    ]);

    const payload: DriveRequestSession = {
      ...route,
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
      refCode,
      createdAt,
    };

    const sid = nanoid();

    await this.redisDriveRequestStore.saveDriveRequest(sid, payload);

    const driver = await this.driversService.findOne(driverSocket.data.user.user_id);

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
    // Cooldown driver for 5 minutes before they can get another job offer
    driverSocket.data.cooldown = moment().add(5, 'minutes').toISOString();

    try {
      const newDriverSocket = await this.findDriverSocketToOfferJob(
        data.userId,
        data.origin.location,
      );
      this.server.to(newDriverSocket.id).emit('job-offer', data);
    } catch (error: unknown) {
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
        id: driveRequest.refCode,
        userId: driveRequest.userId,
        driverId: driveRequest.driverId,
        origin: driveRequest.origin,
        destination: driveRequest.destination,
        distanceMeters: driveRequest.distanceMeters,
        paidAmount: driveRequest.total,
        status: DriveRequestStatus.COMPLETED,
      });
      this.server.to(driveRequest.userId).emit('drive-request-completed');
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
        if (!socket.data.cooldown) {
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
    let driver: DriverDto | null = null;
    try {
      driver = await this.driversService.findOne(socket.data.user.user_id);
    } catch (error: any) {
      throw this.rejectUnauthorizedClient(socket, 'An error occurred getting driver info');
    }
    if (!driver.serviceSpot) {
      throw this.rejectUnauthorizedClient(socket, 'Driver does not have a service spot');
    }
    const serviceSpotRoom = this.getServiceSpotRoom(driver.serviceSpot.id);
    socket.join(serviceSpotRoom);
    this.logger.debug(
      `Driver connected: ${socket.data.user.user_id} and joined ${serviceSpotRoom}`,
    );
  }

  private handlePassengerConnection(socket: Socket) {
    this.logger.debug(`Passenger connected: ${socket.data.user.user_id}`);
  }

  private rejectUnauthorizedClient(socket: Socket, reason: string) {
    socket.disconnect();
    throw new WsException(reason);
  }
}