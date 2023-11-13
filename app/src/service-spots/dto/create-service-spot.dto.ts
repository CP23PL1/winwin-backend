import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Point } from 'typeorm';

export class CreateServiceSpot {
  @ApiProperty({
    example: 'Service Spot 1',
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'ChIJ0wZrj0K3lzMRQOYHfT8WV5k',
    description: 'Google Place ID',
  })
  @Transform(({ value }) => value.trim())
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    description: 'Latitude and longitude of the service spot',
    example: {
      lat: 13.123,
      lng: 123.123,
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
