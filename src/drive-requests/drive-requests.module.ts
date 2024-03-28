import { Module, forwardRef } from '@nestjs/common';
import { DriveRequestsService } from './drive-requests.service';
import { DriveRequestsGateway } from './drive-requests.gateway';
import { DriversModule } from 'src/drivers/drivers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { PassportModule } from '@nestjs/passport';
import { AuthorizationModule } from 'src/authorization/authorization.module';
import { UsersModule } from 'src/users/users.module';
import { ServiceSpotsModule } from 'src/service-spots/service-spots.module';
import { RedisDriveRequestStore } from './stores/redis-drive-request.store';
import { DriveRequestsController } from './drive-requests.controller';
import { GoogleApiModule } from 'src/externals/google-api/google-api.module';
import { DriveRequestFeedback } from './entities/drive-request-feedback.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([DriveRequest, DriveRequestFeedback]),
    GoogleApiModule,
    DriversModule,
    ServiceSpotsModule,
    AuthorizationModule,
    PassportModule,
    UsersModule,
  ],
  controllers: [DriveRequestsController],
  providers: [DriveRequestsGateway, RedisDriveRequestStore, DriveRequestsService],
  exports: [DriveRequestsService],
})
export class DriveRequestsModule {}
