import { ApiProperty } from '@nestjs/swagger';

export class CreateServiceSpot {
  @ApiProperty()
  name: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  latitude: number;

  @ApiProperty()
  longitude: number;
}
