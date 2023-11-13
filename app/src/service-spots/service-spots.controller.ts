import {
  Controller,
  Get,
  Post,
  Patch,
  Param,
  Delete,
  Body,
  HttpException,
  Query,
  ParseIntPipe,
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
    if (!data) {
      throw new HttpException('No data provided', 400);
    }
    console.log(data);

    return this.serviceSpotsService.create(data);
  }

  @Get()
  findAll(
    @Query('lat') lat?: number,
    @Query('lng') lng?: number,
    @Query('radius') radius?: number,
  ) {
    if (lat && lng && radius) {
      return this.serviceSpotsService.findAllByDistance(lat, lng, radius);
    }

    return this.serviceSpotsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.serviceSpotsService.findOne(id);
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
