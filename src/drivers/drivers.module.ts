import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversMockupApiModule } from 'src/externals/drivers-mockup-api/drivers-mockup-api.module';
import { ServiceSpotsModule } from 'src/service-spots/service-spots.module';

@Module({
  imports: [DriversMockupApiModule, ServiceSpotsModule],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
