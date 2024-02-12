import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';

export class DriverVerifyDto {
  @ApiProperty()
  @IsNotEmpty()
  phoneNumber: string;
}
