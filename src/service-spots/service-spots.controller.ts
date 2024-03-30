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
  HttpStatus,
  HttpCode,
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
import { Auth0Roles } from 'src/authorization/decorators/auth0-roles.decorator';
import { Role } from 'src/authorization/dto/user-info.dto';
import { DriversService } from 'src/drivers/drivers.service';

@ApiTags('Service Spots')
@ApiBearerAuth()
@Controller('service-spots')
export class ServiceSpotsController {
  constructor(
    private readonly serviceSpotsService: ServiceSpotsService,
    private readonly driversService: DriversService,
  ) {}

  @Auth0Roles(Role.Driver)
  @HttpCode(HttpStatus.CREATED)
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

  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.OK)
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

  @HttpCode(HttpStatus.OK)
  @Get(':id/drivers')
  async findDrivers(@Param('id', ParseIntPipe) id: number) {
    const drivers = await this.driversService.findAllInServiceSpot(id);
    return drivers;
  }

  @Auth0Roles(Role.Driver)
  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: ServiceSpotDto,
    description: 'Update service spot detail by service spot id.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @Patch(':id')
  async update(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Body() data: UpdateServiceSpot,
  ) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);

    if (serviceSpot.serviceSpotOwnerId !== req.user.user_id) {
      throw new ForbiddenException({
        code: 'not_owner',
        message: 'You are not the owner of this service spot',
      });
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

  @Auth0Roles(Role.Driver)
  @HttpCode(HttpStatus.OK)
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
      throw new ForbiddenException({
        code: 'not_owner',
        message: 'You are not the owner of this service spot',
      });
    }

    return this.serviceSpotsService.getInviteCode(id);
  }
}
