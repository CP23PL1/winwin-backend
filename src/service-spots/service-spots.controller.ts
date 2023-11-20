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
  ParseFloatPipe,
  NotFoundException,
  UseGuards,
} from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { ApiCreatedResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags } from '@nestjs/swagger';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { ServiceSpot } from './entities/service-spot.entity';
import { JwtGuard } from 'src/authorization/jwt.guard';

@ApiTags('Service Spots')
@UseGuards(JwtGuard)
@Controller('service-spots')
export class ServiceSpotsController {
  constructor(private readonly serviceSpotsService: ServiceSpotsService) {}

  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateServiceSpot,
  })
  @Post()
  create(@Body() data: CreateServiceSpot) {
    return this.serviceSpotsService.create(data);
  }

  @ApiOkResponse({
    type: ServiceSpotDto,
    description: 'List of service spots with distance from given location.',
    isArray: true,
  })
  @Get()
  findAll(
    @Query('lat', ParseFloatPipe) lat?: number,
    @Query('lng', ParseFloatPipe) lng?: number,
    @Query('radius', ParseIntPipe) radius?: number,
  ) {
    return this.serviceSpotsService.findAllByDistance(lat, lng, radius);
  }

  @ApiOkResponse({
    type: ServiceSpot,
    description: 'Get service spot detail by service spot id.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);

    if (!serviceSpot) {
      throw new NotFoundException(`Service Spot #${id} not found`);
    }

    return serviceSpot;
  }

  @ApiOkResponse({
    type: ServiceSpot,
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

    const updatedServiceSpot = await this.serviceSpotsService.update(id, data);

    return {
      ...serviceSpot,
      ...updatedServiceSpot,
    };
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
