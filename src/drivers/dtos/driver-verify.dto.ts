import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsPhoneNumber } from 'class-validator';

export class DriverVerifyDto {
  @ApiProperty()
  @IsPhoneNumber('TH', {
    message: (validationArguments) =>
      `Phone number must be a valid country phone number for (${validationArguments.constraints[0]})`,
  })
  @IsNotEmpty()
  phoneNumber: string;
}
