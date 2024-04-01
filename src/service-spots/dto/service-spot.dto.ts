import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Coordinate } from '../../shared/dtos/coordinate.dto';
import { SubDistrict } from 'src/addresses/entities/sub-district.entity';
import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { Expose } from 'class-transformer';

export class ServiceSpotDto {
  private _addressLine1: string;
  private _addressLine2: string;
  private _address: SubDistrict;

  setAddress({
    addressLine1,
    addressLine2,
    subDistrict,
  }: {
    addressLine1: string;
    addressLine2: string;
    subDistrict: SubDistrict;
  }) {
    this._addressLine1 = addressLine1;
    this._addressLine2 = addressLine2;
    this._address = subDistrict;
  }

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

  @ApiProperty({
    type: () => String,
  })
  @Expose()
  get formattedAddress(): string {
    const addressComponents = [];
    addressComponents.push(this._addressLine1);
    if (this._addressLine2) addressComponents.push(this._addressLine2);
    addressComponents.push(this._address.nameTH);
    addressComponents.push(this._address.district.nameTH);
    addressComponents.push(this._address.district.province.nameTH);
    return addressComponents.join(' ');
  }

  @ApiProperty({
    type: () => DriverDto,
  })
  serviceSpotOwner: DriverDto;

  @ApiProperty()
  priceRateImageUrl: string;

  @ApiPropertyOptional()
  distance?: number;
}
