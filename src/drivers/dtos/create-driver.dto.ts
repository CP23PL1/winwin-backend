import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, MaxLength, Min, MinLength } from 'class-validator';
import { DriverRole } from '../entities/driver.entity';

export class CreateDriverDto {
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
    example: '+66812345678',
    required: true,
  })
  @MinLength(12)
  @MaxLength(12)
  phoneNumber: string;

  @ApiProperty({
    example: '1990-01-01',
  })
  @IsDateString({
    strict: true,
  })
  dateOfBirth: string;

  @ApiProperty({
    example: '1234567890123',
  })
  @MinLength(13)
  @MaxLength(13)
  nationalId: string;

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
