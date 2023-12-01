import { ApiProperty } from '@nestjs/swagger';
import { Coordinate } from './coordinate.dto';

export class ServiceSpotDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  placeId: string;
  @ApiProperty({
    type: () => Coordinate,
  })
  coords: Coordinate;
  @ApiProperty()
  approved: boolean;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
  @ApiProperty({
    required: false,
  })
  distance?: number;
}
