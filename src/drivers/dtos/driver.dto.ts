import { ApiProperty } from '@nestjs/swagger';
import { DriverInfoDto } from 'src/externals/drivers-mockup-api/dtos/driver-info.dto';
import { DriverServiceSpotDto } from './driver-service-spot.dto';

export class DriverDto {
  @ApiProperty({
    description: 'The driver identification (UUID) provided by auth0 (user_id)',
  })
  id: string;

  @ApiProperty({
    description: 'The driver phone number (TH)',
  })
  phoneNumber: string;

  @ApiProperty({
    type: () => DriverServiceSpotDto,
    description: 'The service spot that the driver is currently assigned to',
  })
  serviceSpot: DriverServiceSpotDto;

  @ApiProperty({
    type: () => DriverInfoDto,
    description: 'The driver information from the external API',
  })
  info: DriverInfoDto;

  @ApiProperty({
    description: 'The date the driver was created',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date the driver was last updated',
  })
  updatedAt: Date;
}
