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
} from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { ApiCreatedResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Service Spots')
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

  @Get()
  findAll(
    @Query('lat', ParseFloatPipe) lat?: number,
    @Query('lng', ParseFloatPipe) lng?: number,
    @Query('radius', ParseIntPipe) radius?: number,
  ) {
    return this.serviceSpotsService.findAllByDistance(lat, lng, radius);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);
    if (!serviceSpot) {
      throw new NotFoundException(`Service Spot #${id} not found`);
    }
    return serviceSpot;
  }

  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() data: UpdateServiceSpot) {
    return this.serviceSpotsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSpotsService.remove(id);
  }
}
