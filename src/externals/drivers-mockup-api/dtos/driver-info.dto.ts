import { ApiProperty } from '@nestjs/swagger';
import { VehicleDto } from './vehicle.dto';

export class DriverInfoDto {
  @ApiProperty({
    description: 'The identifier of the driver from the external API',
  })
  id: number;

  @ApiProperty({
    description: 'The driver first name',
  })
  firstName: string;

  @ApiProperty({
    description: 'The driver last name',
  })
  lastName: string;

  @ApiProperty({
    description: 'The driver phone number',
  })
  phoneNumber: string;

  @ApiProperty({
    description: 'The driver date of birth',
  })
  dateOfBirth: string;

  @ApiProperty({
    description: 'The driver number',
  })
  no: string;

  @ApiProperty({
    description: 'Created at date from the external API',
  })
  createdAt: string;

  @ApiProperty({
    description: 'Updated at date from the external API',
  })
  updatedAt: string;

  @ApiProperty({
    description: 'The driver profile image url',
  })
  profileImage: string;

  @ApiProperty({
    type: () => VehicleDto,
    description: 'The driver vehicle',
  })
  vehicle: VehicleDto;
}
