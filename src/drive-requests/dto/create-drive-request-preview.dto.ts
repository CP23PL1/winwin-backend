import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty } from 'class-validator';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';

export class CreateDriveRequestPreviewDto {
  @ApiProperty({
    description: 'Origin coordinates',
    type: () => Coordinate,
    example: {
      lat: 13.6505308,
      lng: 100.4963892,
    },
  })
  @IsNotEmpty()
  origin: Coordinate;

  @ApiProperty({
    description: 'Destination coordinates',
    type: () => Coordinate,
    example: {
      lat: 13.649645,
      lng: 100.4978666,
    },
  })
  @IsNotEmpty()
  destination: Coordinate;
}
