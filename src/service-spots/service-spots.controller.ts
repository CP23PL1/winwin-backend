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
  Request,
  UseInterceptors,
  BadRequestException,
  ConflictException,
  Req,
  ForbiddenException,
} from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot, CreateServiceSpotFiles } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import {
  ApiBearerAuth,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { Public } from 'src/authorization/decorators/public.decorator';
import { ServiceSpotQueryDto } from './dto/service-spot-query.dto';
import { FileFieldsInterceptor, UploadedFiles } from '@blazity/nest-file-fastify';
import { FastifyRequest } from 'fastify';

import { ServiceSpotInviteDto } from './dto/service-spot-invite.dto';

@ApiTags('Service Spots')
@ApiBearerAuth()
@Controller('service-spots')
export class ServiceSpotsController {
  constructor(private readonly serviceSpotsService: ServiceSpotsService) {}

  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateServiceSpot,
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'priceRateImage', maxCount: 1 }]))
  @Post()
  async create(
    @Request() req: FastifyRequest,
    @Body() data: CreateServiceSpot,
    @UploadedFiles()
    files: CreateServiceSpotFiles,
  ) {
    if (req.user.user_id !== data.serviceSpotOwnerId) {
      throw new BadRequestException('You can only create service spot for yourself');
    }

    try {
      const newServiceSpot = await this.serviceSpotsService.create(data, files);
      return this.serviceSpotsService.mapToDto(newServiceSpot);
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException(`Service spot with name ${data.name}  already exists`);
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

  @ApiOkResponse({
    description: 'Generate invite code for service spot.',
    type: ServiceSpotInviteDto,
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Get(':id/invite-code')
  async getInviteCode(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
  ): Promise<ServiceSpotInviteDto> {
    const isOwned = await this.serviceSpotsService.isOwnedServiceSpot(req.user.user_id, id);

    if (!isOwned) {
      throw new ForbiddenException('You are not the owner of this service spot');
    }

    return this.serviceSpotsService.getInviteCode(id);
  }
}
