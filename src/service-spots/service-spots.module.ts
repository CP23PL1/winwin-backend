import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSpot])],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
