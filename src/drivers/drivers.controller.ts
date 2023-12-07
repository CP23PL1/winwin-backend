import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DriverDto } from './dtos/driver.dto';
import { FindOneDriverQuery, IdentifierType } from './dtos/find-one-driver-query.dto';
import { FindOneDriverParam } from './dtos/fine-one-driver-param.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(private readonly driversService: DriversService) {}

  @ApiCreatedResponse({
    type: CreateDriverDto,
    description: 'The record has been successfully created.',
  })
  @Post()
  async create(@Body() createDriverDto: CreateDriverDto) {
    try {
      return await this.driversService.create(createDriverDto);
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException(
            `Driver with phone number ${createDriverDto.phoneNumber} already exists`,
          );
        case '23503':
          throw new BadRequestException(
            `Service spot with id ${createDriverDto.serviceSpotId} not found`,
          );
        default:
          throw error;
      }
    }
  }

  @ApiOkResponse({
    type: DriverDto,
    description: 'Get individual driver by identifier,',
  })
  @Get(':identifier')
  async findOneByUid(
    @Param()
    params: FindOneDriverParam,
    @Query() query: FindOneDriverQuery,
  ) {
    let driver = null;

    if (query.identifier_type === IdentifierType.PhoneNumber) {
      driver = await this.driversService.findOneByPhoneNumber(params.identifier);
    } else {
      driver = await this.driversService.findOne(params.identifier);
    }

    if (!driver) {
      throw new NotFoundException(
        `Driver (${query.identifier_type}) ${params.identifier} not found`,
      );
    }

    return this.driversService.mapToDto(driver);
  }
}
