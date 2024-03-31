import { ApiProperty } from '@nestjs/swagger';

export class DriverServiceSpotDto {
  @ApiProperty({
    description: 'The identifier of the service spot',
  })
  id: number;

  @ApiProperty({
    description: 'The name of the service spot',
  })
  name: string;

  @ApiProperty({
    description: 'The owner of the service spot',
  })
  serviceSpotOwnerId: string;
}
