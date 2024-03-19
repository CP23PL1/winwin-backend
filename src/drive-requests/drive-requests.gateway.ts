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
import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { DriveRequestChatDto } from './dto/drive-request-chat.dto';
import { AllExceptionsFilter } from 'src/shared/filters/all-ws-exception.filter';

import { DriveRequestStatus } from './entities/drive-request.entity';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
import { User } from 'src/users/entities/user.entity';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';

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

    if (!user) {
      throw new WsException('You are not authorized to perform this action');
    }

    const hostRoom = this.getDriveRequestHostRoom(user);

    if (!passengerSocket.rooms.has(hostRoom)) {
      passengerSocket.join(hostRoom);
    }

    const { origin, destination, route } = requestDriveDto;

    const driverSocket = await this.findDriverSocketToOfferJob(user, origin.geometry.location);

    const payload: CreateDriveRequestDto = {
      user,
      origin: origin.geometry.location,
      destination: destination.geometry.location,
      route,
    };

    this.server.to(driverSocket.data.user.user_id).emit('job-offer', payload);
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
    const hostRoom = this.getDriveRequestHostRoom(user);
    driverSocket.join(hostRoom);

    this.server.to(hostRoom).emit('drive-request-created', {
      ...newDriveRequest,
      route: data.route,
    });
  }

  @SubscribeMessage('reject-drive-request')
  async rejectRequest(
    @ConnectedSocket() driverSocket: Socket,
    @MessageBody() data: CreateDriveRequestDto,
  ) {
    // Cooldown driver for 5 minutes before they can get another job offer
    driverSocket.data.cooldown = moment().add(5, 'minutes').toISOString();

    try {
      const newDriverSocket = await this.findDriverSocketToOfferJob(data.user, data.origin);
      this.server.to(newDriverSocket.id).emit('job-offer', data);
    } catch (error: unknown) {
      const hostRoom = this.getDriveRequestHostRoom(data.user);
      this.server.to(hostRoom).emit('drive-request-rejected', data);
    }
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

  private async findDriverSocketToOfferJob(user: User, origin: Coordinate) {
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

    return driverSocket;
  }

  private getDriveRequestHostRoom(user: User) {
    return `/users/${user.id}/drive-request`;
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
