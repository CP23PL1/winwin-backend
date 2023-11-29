import { ApiProperty } from '@nestjs/swagger';
import { MaxLength } from 'class-validator';
import { DriverRole } from '../entities/driver.entity';

export class CreateDriverDto {
  @ApiProperty({
    example: '1234567890',
    required: true,
  })
  uid: string;

  @ApiProperty({
    example: 'John',
    required: true,
    maxLength: 50,
  })
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
    maxLength: 50,
  })
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: 1,
    required: true,
  })
  serviceSpotId: number;

  @ApiProperty({
    example: DriverRole.Member,
    enum: DriverRole,
    required: true,
  })
  role: DriverRole;
}
