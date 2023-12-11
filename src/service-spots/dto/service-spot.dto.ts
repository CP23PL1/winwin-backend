import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordinate } from '../../shared/dtos/coordinate.dto';

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
  subDistrictId: number;

  @ApiProperty()
  serviceSpotOwnerUid: string;

  @ApiProperty({
    required: false,
  })
  distance?: number;
}
