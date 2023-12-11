import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { DriversModule } from 'src/drivers/drivers.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSpot]), DriversModule],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
