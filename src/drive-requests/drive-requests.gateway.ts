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
import { Socket, Server } from 'socket.io';
import { DriveRequestsService } from './drive-requests.service';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { Logger } from '@nestjs/common';
import { Auth0JwtService } from 'src/authorization/providers/auth0/auth0-jwt.service';
import { auth0JwtSocketIoMiddleware } from 'src/authorization/providers/auth0/auth0-jwt.middleware';
import { UsersService } from 'src/users/users.service';
import { UserIdentificationType } from 'src/users/dtos/find-one-user-query.dto';
import { ConfigService } from '@nestjs/config';
import { AdditionalDriverDto } from 'src/externals/drivers-mockup-api/dtos/driver.dto';
import { ServiceSpotsService } from 'src/service-spots/service-spots.service';

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
      origin.lat,
      origin.lng,
      2000,
    );

    if (nearbyServiceSpots.length <= 0) {
      throw new WsException('No nearby service spot found');
    }

    for (const nearbyServiceSpot of nearbyServiceSpots) {
      const driverSockets = await this.server
        .in(`service-spots:${nearbyServiceSpot.id}`)
        .fetchSockets();
      if (driverSockets.length > 0) {
        const rnd = crypto.getRandomValues(new Uint32Array(1))[0];
        const driverSocket = driverSockets[rnd % driverSockets.length];
        const newDriveRequest = await this.driveRequestsService.create(createDriveRequestDto);

        driverSocket.emit('drive-requests:new', newDriveRequest);
        return newDriveRequest;
      }
    }
  }

  // @SubscribeMessage('drive-requests:update')
  // update(@MessageBody() updateDriveRequestDto: UpdateDriveRequestDto) {
  //   return this.driveRequestsService.update(updateDriveRequestDto.id, updateDriveRequestDto);
  // }

  // @SubscribeMessage('drive-requests:cancel')
  // remove(@MessageBody() id: number) {
  //   return this.driveRequestsService.remove(id);
  // }

  private async handleDriverConnection(socket: Socket) {
    this.logger.debug(`Driver connected: ${socket.data.user.user_id}`);
    let driver: AdditionalDriverDto | null = null;

    try {
      driver = await this.driversService.getDriverInfoWithAdditionalData(
        socket.data.user.phone_number,
      );
    } catch (error: any) {
      throw this.rejectUnauthorizedClient(socket, 'An error occurred getting driver info');
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
