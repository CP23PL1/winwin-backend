import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsOptional, IsPositive } from 'class-validator';
import { Point } from 'typeorm';
import { Coordinate } from '../../shared/dtos/coordinate.dto';
import { Trim } from 'src/shared/decorators/trim.decorator';
import { MemoryStorageFile } from '@blazity/nest-file-fastify';

export class CreateServiceSpot {
  @ApiProperty({
    example: 'วินปากซอยประชาอุทิศ 45',
  })
  @Trim()
  @IsNotEmpty()
  name: string;

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
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsNotEmpty()
  subDistrictId: number;

  @ApiProperty({
    type: () => Coordinate,
  })
  @IsNotEmpty()
  @Transform(
    ({ value }) => {
      const { lat, lng } = JSON.parse(value);
      return { type: 'Point', coordinates: [lng, lat] };
    },
    { toClassOnly: true },
  )
  coords: Point;

  @ApiProperty({
    example: 1,
    description: 'Driver ID of the service spot owner',
  })
  @Transform(({ value }) => parseInt(value))
  @IsPositive()
  @IsNotEmpty()
  serviceSpotOwnerId: number;

  @ApiProperty({ format: 'binary' })
  priceRateImage: string;

  @ApiProperty({ format: 'binary' })
  serviceSpotImages: string[];
}

export class CreateServiceSpotFiles {
  priceRateImage: MemoryStorageFile[];
  serviceSpotImages: MemoryStorageFile[];
}
