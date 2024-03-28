import { Module, forwardRef } from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriversController } from './drivers.controller';
import { DriversMockupApiModule } from 'src/externals/drivers-mockup-api/drivers-mockup-api.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { ServiceSpotsModule } from 'src/service-spots/service-spots.module';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { DriverRating } from './entities/driver-rating.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Driver, DriverRating, DriveRequest]),
    forwardRef(() => ServiceSpotsModule),
    DriversMockupApiModule,
  ],
  controllers: [DriversController],
  providers: [DriversService],
  exports: [DriversService],
})
export class DriversModule {}
