import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { AuthorizationModule } from 'src/authorization/authorization.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSpot]), AuthorizationModule],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
