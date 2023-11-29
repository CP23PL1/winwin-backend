import { ApiProperty } from '@nestjs/swagger';

type Coordinates = {
  lat: number;
  lng: number;
};

export class ServiceSpotDto {
  @ApiProperty()
  id: number;
  @ApiProperty()
  name: string;
  @ApiProperty()
  placeId: string;
  @ApiProperty({
    example: {
      lat: 0,
      lng: 0,
    },
  })
  coords: Coordinates;
  @ApiProperty()
  approved: boolean;
  @ApiProperty()
  createdAt: string;
  @ApiProperty()
  updatedAt: string;
  @ApiProperty()
  distance?: number;
}
