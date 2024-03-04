import { Module } from '@nestjs/common';
import { DriveRequestsService } from './drive-requests.service';
import { DriveRequestsGateway } from './drive-requests.gateway';
import { DriversModule } from 'src/drivers/drivers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';

@Module({
  imports: [TypeOrmModule.forFeature([DriveRequest]), DriversModule],
  providers: [DriveRequestsGateway, DriveRequestsService],
})
export class DriveRequestsModule {}
