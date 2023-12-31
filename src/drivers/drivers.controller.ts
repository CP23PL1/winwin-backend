import {
  Body,
  ConflictException,
  Controller,
  Get,
  NotFoundException,
  Param,
  Post,
  Query,
  Request,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { DriverDto } from './dtos/driver.dto';
import { FindOneDriverQuery, IdentifierType } from './dtos/find-one-driver-query.dto';
import { Public } from 'src/authorization/public.decorator';

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
  async create(@Request() req, @Body() createDriverDto: CreateDriverDto) {
    try {
      return await this.driversService.create(req.user.sub, createDriverDto);
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException(
            `Driver with phone number ${createDriverDto.phoneNumber} already exists`,
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
  @Public()
  @Get(':identifier')
  async findOne(@Param('identifier') identifier: string, @Query() query: FindOneDriverQuery) {
    let driver = null;

    if (query.identifier_type === IdentifierType.PhoneNumber) {
      driver = await this.driversService.findOneByPhoneNumber(identifier);
    } else {
      driver = await this.driversService.findOne(identifier);
    }

    if (!driver) {
      throw new NotFoundException(`Driver (${query.identifier_type}) ${identifier} not found`);
    }

    return this.driversService.mapToDto(driver);
  }
}
