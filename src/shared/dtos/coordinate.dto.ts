import { ApiProperty } from '@nestjs/swagger';
import { IsLatitude, IsLongitude } from 'class-validator';

export class Coordinate {
  @ApiProperty({
    example: 13.7303,
  })
  @IsLatitude({ message: 'Latitude must be a number between -90 and 90' })
  lat: number;

  @ApiProperty({
    example: 100.5231,
  })
  @IsLongitude({ message: 'Longitude must be a number between -180 and 180' })
  lng: number;
}
