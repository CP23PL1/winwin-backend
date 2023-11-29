import { ApiProperty } from '@nestjs/swagger';
import { ServiceSpot } from 'src/service-spots/entities/service-spot.entity';

export class DriverDto {
  @ApiProperty()
  uid: string;

  @ApiProperty()
  firstName: string;

  @ApiProperty()
  lastName: string;

  @ApiProperty()
  approved: boolean;

  @ApiProperty()
  serviceSpot: ServiceSpot;
}
