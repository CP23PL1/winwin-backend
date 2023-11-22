import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Point } from 'typeorm';

export class CreateServiceSpot {
  @ApiProperty({
    example: 'วินปากซอยประชาอุทิศ 45',
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'MF2W+HQ2',
    description: 'Google Place ID or Plus Code',
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    description: 'Latitude and longitude of the service spot',
    example: {
      lat: 13.65139,
      lng: 100.4969,
    },
  })
  @Transform(
    ({ value }) => ({
      type: 'Point',
      coordinates: [value.lng, value.lat],
    }),
    { toClassOnly: true },
  )
  coords: Point;
}
