import { Transform } from 'class-transformer';
import { IsLatitude, IsLongitude, Max, Min, IsInt } from 'class-validator';

export class ServiceSpotQueryDto {
  @IsLatitude({ message: 'Latitude must be a number between -90 and 90' })
  lat: number;
  @IsLongitude({ message: 'Longitude must be a number between -180 and 180' })
  lng: number;

  @IsInt({ message: 'Radius must be an integer' })
  @Min(1, { message: 'Radius must be greater than 0' })
  @Max(100000, { message: 'Radius must be less than 100000' })
  @Transform(({ value }) => parseInt(value))
  radius: number;
}
