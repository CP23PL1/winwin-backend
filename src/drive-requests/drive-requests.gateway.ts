import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
} from '@nestjs/websockets';
import { Socket, Server } from 'socket.io';
import { DriveRequestsService } from './drive-requests.service';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
import { UpdateDriveRequestDto } from './dto/update-drive-request.dto';
import { DriversService } from 'src/drivers/drivers.service';
import { Logger } from '@nestjs/common';

@WebSocketGateway(80, {
  namespace: 'drive-requests',
  transports: ['websocket'],
})
export class DriveRequestsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  private readonly logger = new Logger(DriveRequestsGateway.name);
  constructor(
    private readonly driveRequestsService: DriveRequestsService,
    private readonly driversService: DriversService,
  ) {}

  @WebSocketServer()
  server: Server;

  async handleConnection(socket: Socket) {
    this.logger.debug(`Client connected: ${socket.id}`);
    // const user = socket.data.user;
    // if (user.role === 'driver') {
    //   const driver = await this.driversService.getDriverInfoWithAdditionalData(user.phoneNumber);
    //   socket.join(`service-spot:${driver.serviceSpot.id}`);
    // }
  }

  handleDisconnect(socket: Socket) {
    this.logger.debug(`Client disconnected: ${socket.id}`);
    // const user = socket.data.user;
    // if (user.role === 'driver') {
    //   socket.leave(`service-spot:${user.serviceSpot.id}`);
    // }
  }

  @SubscribeMessage('drive-requests:create')
  create(@MessageBody() createDriveRequestDto: CreateDriveRequestDto) {
    // return this.driveRequestsService.create(createDriveRequestDto);
    console.log('requested');
    this.server.emit('requested');
  }

  @SubscribeMessage('drive-requests:update')
  update(@MessageBody() updateDriveRequestDto: UpdateDriveRequestDto) {
    return this.driveRequestsService.update(updateDriveRequestDto.id, updateDriveRequestDto);
  }

  @SubscribeMessage('drive-requests:cancel')
  remove(@MessageBody() id: number) {
    return this.driveRequestsService.remove(id);
  }
}
