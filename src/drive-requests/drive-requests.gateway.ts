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
} from '@nestjs/websockets';
import { Socket, RemoteSocket, Server } from 'socket.io';
import { DriveRequestsService } from './drive-requests.service';
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
import { UpdateDriveRequestDto } from './dto/update-drive-request.dto';
import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { DriveRequestChatDto } from './dto/drive-request-chat.dto';
import { AllExceptionsFilter } from 'src/shared/filters/all-ws-exception.filter';
import { WsAck } from 'src/shared/dtos/ws-ack.dto';
import { WsErrorAck } from 'src/shared/dtos/ws-error-ack.dt';
import { DriveRequest, DriveRequestStatus } from './entities/drive-request.entity';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';

@UseFilters(new AllExceptionsFilter())
@WebSocketGateway({
  namespace: 'drive-requests',
})
export class DriveRequestsGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  private readonly logger = new Logger(DriveRequestsGateway.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly auth0JwtService: Auth0JwtService,
    private readonly driveRequestsService: DriveRequestsService,
    private readonly serviceSpotsService: ServiceSpotsService,
    private readonly driversService: DriversService,
    private readonly usersService: UsersService,
  ) {}

  @WebSocketServer()
  server: Server;

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
    const { origin, destination, route } = requestDriveDto;

    const nearbyServiceSpots = await this.serviceSpotsService.findAllByDistance(
      origin.geometry.location.lat,
      origin.geometry.location.lng,
      2000,
    );

    if (nearbyServiceSpots.length <= 0) {
      throw new WsException('No nearby service spots found');
    }

    let driverSocket: RemoteSocket<any, any> | null = null;

    for (const nearbyServiceSpot of nearbyServiceSpots) {
      let driverSockets = await this.server
        .in(`service-spots:${nearbyServiceSpot.id}`)
        .fetchSockets();

      if (driverSockets.length <= 0) {
        continue;
      }

      driverSockets = driverSockets.filter((socket) => {
        if (!socket.data.cooldown) {
          return true;
        }
        return moment(socket.data.cooldown).isBefore(moment());
      });
      console.log(driverSockets.length);
      const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
      const rndDriverSocket = driverSockets[rnd % driverSockets.length];

      if (rndDriverSocket.data.user.phone_number === user.phoneNumber) {
        continue;
      }

      driverSocket = rndDriverSocket;
    }

    if (!driverSocket) {
      throw new WsException('No nearby driver found');
    }

    const payload: CreateDriveRequestDto = {
      user,
      origin: origin.geometry.location,
      destination: destination.geometry.location,
      route,
    };

    const room = `/users/${user.id}/drive-request`;

    if (!passengerSocket.rooms.has(room)) {
      passengerSocket.join(room);
    }

    this.server.to(room).to(driverSocket.data.user.user_id).emit('drive-requested', payload);
  }

  @SubscribeMessage('accept-drive-request')
  async acceptedRequest(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() data: CreateDriveRequestDto,
  ) {
    const driver = await this.driversService.findOne(driverSocket.data.user.user_id);
    const user = await this.usersService.findOne(data.user.id, UserIdentificationType.ID);
    const date = moment();
    const newDriveRequest = await this.driveRequestsService.create({
      user,
      driver,
      origin: data.origin,
      destination: data.destination,
      status: DriveRequestStatus.ACCEPTED,
      refCode: `DR${date.format('YYYYMMDDHHmmss')}`,
    });
    console.log(newDriveRequest);
    const room = `/users/${user.id}/drive-request`;
    driverSocket.join(room);

    this.server.to(room).emit('drive-requested', {
      ...newDriveRequest,
      route: data.route,
    });
  }

  @SubscribeMessage('reject-drive-request')
  async rejectRequest(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() data: CreateDriveRequestDto,
  ) {
    const room = `/users/${data.user.id}/drive-request`;
    driverSocket.leave(room);
    driverSocket.data.cooldown = moment().add(5, 'minutes').toISOString();
    const roomSockets = await this.server.in(room).fetchSockets();
    const passengerSocket = roomSockets[0];
    passengerSocket.emit('drive-request-rejected');
  }

  @SubscribeMessage('chat-message')
  async chat(@ConnectedSocket() client: Socket, @MessageBody() data: DriveRequestChatDto) {
    const room = `drive-requests:${data.driveRequestId}`;
    this.server.fetchSockets().then((sockets) => {
      sockets.forEach((socket) => {
        console.log(socket.rooms);
      });
    });
    this.server.to(room).except(client.id).emit('drive-requests:chat', {
      sender: client.data.user.user_id,
      message: data.message,
      timestamp: new Date(),
    });
  }

  // @SubscribeMessage('drive-requests:update')
  // async updateStatus(@MessageBody() data: UpdateDriveRequestDto) {
  //   const updatedDriveRequest = await this.driveRequestsService.update(data.id, {
  //     status: data.status,
  //   });
  //   this.server.in(`drive-requests:${data.id}`).emit('drive-requests:updated', updatedDriveRequest);
  //   return;
  // }

  private getDriveRequestRoom(driveRequest: DriveRequest) {
    return `drive-requests:${driveRequest.id}`;
  }

  private async handleDriverConnection(socket: Socket) {
    this.logger.debug(`Driver connected: ${socket.data.user.user_id}`);
    let driver: DriverDto | null = null;
    try {
      driver = await this.driversService.findOne(socket.data.user.user_id);
    } catch (error: any) {
      throw this.rejectUnauthorizedClient(socket, 'An error occurred getting driver info');
    }
    if (!driver.serviceSpot) {
      throw this.rejectUnauthorizedClient(socket, 'Driver does not have a service spot');
    }
    const serviceSpotRoom = `service-spots:${driver.serviceSpot.id}`;
    socket.join(serviceSpotRoom);
  }

  private handlePassengerConnection(socket: Socket) {
    this.logger.debug(`Passenger connected: ${socket.data.user.user_id}`);
  }

  private rejectUnauthorizedClient(socket: Socket, reason: string) {
    socket.disconnect();
    throw new WsException(reason);
  }
}
