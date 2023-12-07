import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';

export enum IdentifierType {
  Uid = 'uid',
  PhoneNumber = 'phone_number',
}

export class FindOneDriverQuery {
  @ApiProperty({
    enum: IdentifierType,
    default: IdentifierType.Uid,
    description: 'Identifier type to use for finding driver. Default is identify by uid.',
  })
  @IsEnum(IdentifierType, {
    message: `identifierType must be one of the following values: ${Object.values(
      IdentifierType,
    ).join(', ')}`,
  })
  @IsOptional()
  identifier_type: IdentifierType = IdentifierType.Uid;
}
