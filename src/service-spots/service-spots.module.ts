import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { DriversModule } from 'src/drivers/drivers.module';
import { AddressesModule } from 'src/addresses/addresses.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSpot]), DriversModule, AddressesModule],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
