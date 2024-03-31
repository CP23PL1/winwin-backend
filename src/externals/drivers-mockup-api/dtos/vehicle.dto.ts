import { ApiProperty } from '@nestjs/swagger';

export class VehicleDto {
  @ApiProperty({
    description: 'The identifier of the vehicle from the external API',
  })
  id: number;

  @ApiProperty({
    description: 'The vehicle license plate',
  })
  plate: string;

  @ApiProperty({
    description: 'The province of the vehicle license plate',
  })
  province: string;

  @ApiProperty({
    description: 'The vehicle model',
  })
  model: string;

  @ApiProperty({
    description: 'The vehicle manufactor',
  })
  manufactor: string;
}
