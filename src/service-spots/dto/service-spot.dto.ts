import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordinate } from '../../shared/dtos/coordinate.dto';
import { SubDistrict } from 'src/addresses/entities/sub-district.entity';
import { DriverDto } from 'src/drivers/dtos/driver.dto';

export class ServiceSpotDto {
  @ApiProperty()
  id: number;

  @ApiProperty()
  name: string;

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
  serviceSpotOwner: DriverDto;

  @ApiProperty()
  priceRateImageUrl: string;

  @ApiPropertyOptional()
  distance?: number;
}
