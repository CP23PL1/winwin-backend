import { ApiProperty } from '@nestjs/swagger';

export class Coordinate {
  @ApiProperty({
    example: 13.7303,
  })
  lat: number;

  @ApiProperty({
    example: 100.5231,
  })
  lng: number;
}
