import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, Max, Min, IsInt } from 'class-validator';

export class ServiceSpotQueryDto {
  @ApiProperty({
    description: 'Latitude of the location',
    example: 13.745721,
  })
  @IsLatitude({ message: 'Latitude must be a number between -90 and 90' })
  lat: number;

  @ApiProperty({
    description: 'Longitude of the location',
    example: 100.534966,
  })
  @IsLongitude({ message: 'Longitude must be a number between -180 and 180' })
  lng: number;

  @ApiProperty({
    description: 'Radius in meters',
    example: 1000,
  })
  @IsInt({ message: 'Radius must be an integer' })
  @Min(1, { message: 'Radius must be greater than 0' })
  @Max(100000, { message: 'Radius must be less than 100000' })
  @Transform(({ value }) => parseInt(value))
  radius: number;
}
