import { Module } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversMockupApiModule } from 'src/externals/drivers-mockup-api/drivers-mockup-api.module';

@Module({
  imports: [DriversMockupApiModule],
  controllers: [DriversController],
  providers: [DriversService],
})
export class DriversModule {}
