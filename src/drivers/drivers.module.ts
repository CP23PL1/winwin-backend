import { Module, forwardRef } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversMockupApiModule } from 'src/externals/drivers-mockup-api/drivers-mockup-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { ServiceSpotsModule } from 'src/service-spots/service-spots.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver]),
    forwardRef(() => ServiceSpotsModule),
    DriversMockupApiModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
