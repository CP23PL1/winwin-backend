import { DriverInfoDto } from 'src/externals/drivers-mockup-api/dtos/driver-info.dto';
import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';

export class DriverDto {
  id: string;
  phoneNumber: string;
  serviceSpot: ServiceSpot;
  createdAt: Date;
  updatedAt: Date;
  info: DriverInfoDto;
}
