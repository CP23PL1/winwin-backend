import { ApiProperty } from '@nestjs/swagger';
import { IsPositive, IsString } from 'class-validator';

export class ServiceSpotInviteDto {
  @ApiProperty({
    description: 'Invite code to join the service spot',
    example: '123AE6',
  })
  @IsString()
  code: string;

  @ApiProperty({
    description: 'Time in seconds when the invite code expires',
    example: 900,
  })
  @IsPositive()
  ttl: number;
}
