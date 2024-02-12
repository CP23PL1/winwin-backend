import { Module } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { ServiceSpotsController } from './service-spots.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { AddressesModule } from 'src/addresses/addresses.module';
import { DriversMockupApiModule } from 'src/externals/drivers-mockup-api/drivers-mockup-api.module';

@Module({
  imports: [TypeOrmModule.forFeature([ServiceSpot]), AddressesModule, DriversMockupApiModule],
  controllers: [ServiceSpotsController],
  providers: [ServiceSpotsService],
})
export class ServiceSpotsModule {}
