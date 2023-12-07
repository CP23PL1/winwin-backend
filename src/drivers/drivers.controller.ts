import {
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { ApiBearerAuth, ApiCreatedResponse, ApiTags } from '@nestjs/swagger';
import { DriverDto } from './dtos/driver.dto';

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
  create(@Body() createDriverDto: CreateDriverDto) {
    return this.driversService.create(createDriverDto);
  }

  @ApiCreatedResponse({
    type: DriverDto,
    description: 'Get individual driver by uid.',
  })
  @Get(':uid')
  async findOne(
    @Param('uid')
    uid: string,
  ) {
    const driver = await this.driversService.findOne(uid);
    if (!driver) {
      throw new NotFoundException(`Driver #${uid} not found`);
    }

    const driverDto = new DriverDto();

    driverDto.uid = driver.uid;
    driverDto.firstName = driver.firstName;
    driverDto.lastName = driver.lastName;
    driverDto.approved = driver.approved;
    driverDto.serviceSpot = driver.serviceSpot;

    return driverDto;
  }
}
