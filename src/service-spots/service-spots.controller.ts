import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  Query,
  ParseIntPipe,
  NotFoundException,
  ConflictException,
  BadRequestException,
  Request,
} from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { Public } from 'src/authorization/public.decorator';
import { ServiceSpotQueryDto } from './dto/service-spot-query.dto';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';

@ApiTags('Service Spots')
@ApiBearerAuth()
@Controller('service-spots')
export class ServiceSpotsController {
  constructor(
    private readonly serviceSpotsService: ServiceSpotsService,
    private readonly driversMockupApi: DriversMockupApiService,
  ) {}

  // TODO: Fix dept
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateServiceSpot,
  })
  @Post()
  async create(@Request() req, @Body() data: CreateServiceSpot) {
    const driver = await this.driversMockupApi.getDriver(req.user.name, 'phone_number');

    if (driver.id !== data.serviceSpotOwnerId) {
      throw new BadRequestException('You can only create service spot for yourself');
    }

    try {
      const newServiceSpot = await this.serviceSpotsService.create(data);
      return this.serviceSpotsService.mapToDto(newServiceSpot);
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException(
            `Service spot with name ${data.name} or place id ${data.placeId} already exists`,
          );
        case '23503':
          throw new BadRequestException(`Sub district with id ${data.subDistrictId} not found`);
        default:
          throw error;
      }
    }
  }

  @ApiOkResponse({
    type: ServiceSpotDto,
    description: 'List of service spots with distance from given location.',
    isArray: true,
  })
  @Public()
  @Get()
  findAll(@Query() { lat, lng, radius }: ServiceSpotQueryDto) {
    return this.serviceSpotsService.findAllByDistance(lat, lng, radius);
  }

  @ApiOkResponse({
    type: ServiceSpotDto,
    description: 'Get service spot detail by service spot id.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Public()
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);

    if (!serviceSpot) {
      throw new NotFoundException(`Service Spot #${id} not found`);
    }

    return this.serviceSpotsService.mapToDto(serviceSpot);
  }

  @ApiOkResponse({
    type: ServiceSpotDto,
    description: 'Update service spot detail by service spot id.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Patch(':id')
  async update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateServiceSpot) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);

    if (!serviceSpot) {
      throw new NotFoundException(`Service Spot #${id} not found`);
    }

    const updatedServiceSpot = await this.serviceSpotsService.update(id, {
      ...serviceSpot,
      ...data,
    });

    return this.serviceSpotsService.mapToDto(updatedServiceSpot);
  }

  @ApiOkResponse({
    description: 'Delete service spot by service spot id.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSpotsService.remove(id);
  }
}
