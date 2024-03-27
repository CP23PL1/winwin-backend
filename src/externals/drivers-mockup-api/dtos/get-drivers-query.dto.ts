import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsPositive, IsOptional, IsString } from 'class-validator';

export class GetDriversQuery {
  @ApiProperty({
    required: false,
  })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  page?: number;

  @ApiProperty({
    required: false,
  })
  @IsPositive()
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  limit?: number;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  $in_field?: string;

  @ApiProperty({
    required: false,
  })
  @IsString()
  @IsOptional()
  $in?: string;
}
