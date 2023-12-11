import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateDriverDto {
  @ApiProperty({
    example: '1230203004',
  })
  @IsNotEmpty()
  uid: string;

  @ApiProperty({
    example: 'John',
    required: true,
    maxLength: 50,
  })
  @IsNotEmpty()
  @MaxLength(50)
  firstName: string;

  @ApiProperty({
    example: 'Doe',
    required: true,
    maxLength: 50,
  })
  @IsNotEmpty()
  @MaxLength(50)
  lastName: string;

  @ApiProperty({
    example: '+66812345678',
    required: true,
  })
  @IsNotEmpty()
  @MinLength(12)
  @MaxLength(12)
  phoneNumber: string;

  @ApiProperty({
    example: '1990-01-01',
  })
  @IsNotEmpty()
  @IsDateString({
    strict: true,
  })
  dateOfBirth: string;

  @ApiProperty({
    example: '1234567890123',
  })
  @IsNotEmpty()
  @MinLength(13)
  @MaxLength(13)
  nationalId: string;
}
