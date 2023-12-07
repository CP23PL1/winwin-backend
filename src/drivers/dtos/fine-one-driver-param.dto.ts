import { ApiProperty } from '@nestjs/swagger';

export class FindOneDriverParam {
  @ApiProperty({
    example: 'sms|1230203004',
    description: 'Identifier to use for finding driver. Default is identify by uid.',
  })
  identifier: string;
}
