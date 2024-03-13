import { Module } from '@nestjs/common';
import { DriveRequestsService } from './drive-requests.service';
import { DriveRequestsGateway } from './drive-requests.gateway';
import { DriversModule } from 'src/drivers/drivers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UsersModule } from 'src/users/users.module';
import { ServiceSpotsModule } from 'src/service-spots/service-spots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriveRequest]),
    ServiceSpotsModule,
    AuthorizationModule,
    PassportModule,
    UsersModule,
    DriversModule,
  ],
  providers: [DriveRequestsGateway, DriveRequestsService],
})
export class DriveRequestsModule {}
