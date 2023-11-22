import { ApiProperty } from '@nestjs/swagger';
import { Point } from 'typeorm';

export class ServiceSpotDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  placeId: string;
  @ApiProperty({
    example: {
      type: 'Point',
      coordinates: [123.123, 13.123],
    },
  })
  coords: Point;
  @ApiProperty()
  approved: boolean;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
  @ApiProperty()
  distance: number;
}
