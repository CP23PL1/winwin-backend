import { PartialType } from '@nestjs/mapped-types';
import { CreateServiceSpotFiles } from './create-service-spot.dto';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateServiceSpot {
  @ApiProperty({ format: 'binary' })
  priceRateImage: string;
}

export class UpdateServiceSpotFiles extends PartialType(CreateServiceSpotFiles) {}
