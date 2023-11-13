import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Point } from 'typeorm';

export class CreateServiceSpot {
  @ApiProperty({
    example: 'Service Spot 1',
  })
  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    description: 'Latitude and longitude of the service spot',
    example: {
      lat: 13.123,
      lng: 123.123,
    },
  })
  @Transform(({ value }) => ({
    type: 'Point',
    coordinates: [value.lng, value.lat],
  }))
  location: Point;
}
