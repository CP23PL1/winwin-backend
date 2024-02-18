import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsIn, IsNotEmpty } from 'class-validator';

export enum UserIdentificationType {
  ID = 'id',
  EMAIL = 'email',
  PHONE_NUMBER = 'phoneNumber',
}

export class FindOneUserQueryDto {
  @ApiProperty({
    description: 'The type of identifier to use',
    enum: UserIdentificationType,
    default: 'id',
  })
  @IsEnum(UserIdentificationType)
  @IsNotEmpty()
  identify_by: UserIdentificationType;
}
