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
import { Socket, Server } from 'socket.io';
import { DriveRequestsService } from './drive-requests.service';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
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

  @UseFilters(new BaseWsExceptionFilter())
  @SubscribeMessage('drive-requests:create')
  async create(
    @ConnectedSocket() client: Socket,
    @MessageBody() createDriveRequestDto: CreateDriveRequestDto,
  ) {
    const user = await this.usersService.findOne(
      client.data.user.user_id,
      UserIdentificationType.ID,
    );

    if (!user) {
      throw new WsException('User not found');
    }

    const { origin } = createDriveRequestDto;

    const nearbyServiceSpots = await this.serviceSpotsService.findAllByDistance(
      origin.geometry.location.lat,
      origin.geometry.location.lng,
      2000,
    );

    if (nearbyServiceSpots.length <= 0) {
      throw new WsException('No nearby service spot found');
    }

    for (const nearbyServiceSpot of nearbyServiceSpots) {
      const driverSockets = await this.server
        .in(`service-spots:${nearbyServiceSpot.id}`)
        .fetchSockets();
      if (driverSockets.length <= 0) {
        throw new WsException('No driver available');
      }
      const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
      const driverSocket = driverSockets[rnd % driverSockets.length];

      if (driverSocket.data.user.phone_number === user.phoneNumber) {
        continue;
      }

      const driver = await this.driversService.findOne(driverSocket.data.user.user_id);
      const date = moment();
      const newDriveRequest = await this.driveRequestsService.create({
        user,
        driver,
        origin: createDriveRequestDto.origin.geometry.location,
        destination: createDriveRequestDto.destination.geometry.location,
        refCode: `DR${date.format('YYYYMMDDHHmmss')}`,
      });

      driverSocket.join(`drive-requests:${newDriveRequest.id}`);
      client.join(`drive-requests:${newDriveRequest.id}`);

      driverSocket.emit('drive-requests:requested', {
        ...newDriveRequest,
        route: createDriveRequestDto.route,
      });
      return newDriveRequest;
    }
  }

  @SubscribeMessage('drive-requests:update')
  async updateStatus(@MessageBody() data: UpdateDriveRequestDto) {
    const updatedDriveRequest = await this.driveRequestsService.update(data.id, {
      status: data.status,
    });
    this.server.in(`drive-requests:${data.id}`).emit('drive-requests:updated', updatedDriveRequest);
    return;
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
