import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty } from 'class-validator';
import { Point } from 'typeorm';
import { Coordinate } from '../../shared/dtos/coordinate.dto';
import { Trim } from 'src/shared/decorators/trim.decorator';

export class CreateServiceSpot {
  @ApiProperty({
    example: 'วินปากซอยประชาอุทิศ 45',
  })
  @Trim()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'MF2W+HQ2',
    description: 'Google Place ID or Plus Code',
  })
  @Trim()
  @IsNotEmpty()
  placeId: string;

  @ApiProperty({
    type: () => Coordinate,
  })
  @IsNotEmpty()
  @Transform(
    ({ value }) => ({
      type: 'Point',
      coordinates: [value.lng, value.lat],
    }),
    { toClassOnly: true },
  )
  coords: Point;
}
