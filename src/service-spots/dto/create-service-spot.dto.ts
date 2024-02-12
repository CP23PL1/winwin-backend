import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive, IsString } from 'class-validator';
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
    example: 'ซอยประชาอุทิศ 45',
  })
  @Trim()
  @IsNotEmpty()
  addressLine1: string;

  @ApiPropertyOptional()
  @IsOptional()
  addressLine2: string;

  @ApiProperty({
    example: 103503,
    description: 'District ID',
  })
  @IsPositive()
  @IsNotEmpty()
  subDistrictId: number;

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

  @ApiProperty({
    example: 1,
    description: 'Driver ID of the service spot owner',
  })
  @IsPositive()
  @IsNotEmpty()
  serviceSpotOwnerId: number;
}
