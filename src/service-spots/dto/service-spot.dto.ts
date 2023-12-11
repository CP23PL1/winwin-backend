import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordinate } from '../../shared/dtos/coordinate.dto';
import { SubDistrict } from 'src/addresses/entities/sub-district.entity';

export class ServiceSpotDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

  @ApiProperty()
  placeId: string;

  @ApiProperty({
    type: () => Coordinate,
  })
  coords: Coordinate;

  @ApiProperty()
  approved: boolean;

  @ApiProperty()
  addressLine1: string;

  @ApiPropertyOptional()
  addressLine2: string;

  @ApiProperty()
  address: SubDistrict;

  @ApiProperty()
  serviceSpotOwnerUid: string;

  @ApiPropertyOptional()
  distance?: number;
}
