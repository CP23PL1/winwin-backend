import { Controller, Get, Post, Patch, Param, Delete, Body, HttpException } from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('Service Spots API')
@Controller('service-spots')
export class ServiceSpotsController {
  constructor(private readonly serviceSpotsService: ServiceSpotsService) {}

  @Post()
  create(@Body() data: CreateServiceSpot) {
    if (!data) {
      throw new HttpException('No data provided', 400);
    }

    return this.serviceSpotsService.create(data);
  }

  @Get()
  findAll() {
    return this.serviceSpotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.serviceSpotsService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() data: UpdateServiceSpot) {
    return this.serviceSpotsService.update(id, data);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.serviceSpotsService.remove(id);
  }
}
