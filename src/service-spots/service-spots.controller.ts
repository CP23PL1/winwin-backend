import {
  Controller,
  Get,
  Post,
  Param,
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
  Delete,
  NotFoundException,
  Put,
} from '@nestjs/common';
import { ServiceSpotsService } from './service-spots.service';
import { CreateServiceSpot, CreateServiceSpotFiles } from './dto/create-service-spot.dto';
import { UpdateServiceSpot, UpdateServiceSpotFiles } from './dto/update-service-spot.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiNoContentResponse,
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
import { ServiceSpotException } from './constants/exceptions';
import { DriverException } from 'src/drivers/constants/exceptions';

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
    const driverHasServiceSpot = await this.driversService.IsDriverHasServiceSpot(req.user.user_id);

    if (driverHasServiceSpot) {
      throw new BadRequestException(DriverException.DriverAlreadyInServiceSpot);
    }

    try {
      const newServiceSpot = await this.serviceSpotsService.create(req.user.user_id, data, files);
      return this.serviceSpotsService.mapToDto(newServiceSpot);
    } catch (error: any) {
      console.error(error);
      switch (error.code) {
        case '23505':
          throw new ConflictException(ServiceSpotException.AlreadyExist(data.name));
        case '23503':
          throw new BadRequestException(
            ServiceSpotException.SubDistrictNotFound(data.subDistrictId),
          );
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
    const serviceSpot = await this.serviceSpotsService.findOne(id, {
      relations: {
        subDistrict: {
          district: {
            province: true,
          },
        },
      },
    });
    return this.serviceSpotsService.mapToDto(serviceSpot);
  }

  @Auth0Roles(Role.Driver)
  @HttpCode(HttpStatus.OK)
  @Get(':id/drivers')
  findDrivers(@Param('id', ParseIntPipe) id: number) {
    return this.driversService.findAllDriversInServiceSpot(id);
  }

  @Auth0Roles(Role.Driver)
  @HttpCode(HttpStatus.OK)
  @ApiBody({
    type: () => UpdateServiceSpot,
  })
  @ApiNoContentResponse({
    description: 'Service spot updated successfully.',
  })
  @ApiNotFoundResponse({
    description: 'Service spot not found.',
  })
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FileFieldsInterceptor([{ name: 'priceRateImage', maxCount: 1 }]))
  @Put(':id')
  async update(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFiles()
    files: UpdateServiceSpotFiles,
  ) {
    const serviceSpot = await this.serviceSpotsService.findOne(id);

    if (!serviceSpot) {
      throw new NotFoundException(ServiceSpotException.NotFound(id));
    }

    const isOwner = await this.driversService.isOwnedServiceSpot(req.user.user_id, id);

    if (!isOwner) {
      throw new ForbiddenException({
        code: 'not_owner',
        message: 'You are not the owner of this service spot',
      });
    }

    return this.serviceSpotsService.saveImage(id, files.priceRateImage[0]);
  }

  @ApiOkResponse({
    description: 'Remove driver from service spot.',
  })
  @ApiBadRequestResponse({
    description: 'Driver not found or not in service spot.',
  })
  @Auth0Roles(Role.Driver)
  @Delete(':id/drivers/:driverId')
  async removeDriverFromServiceSpot(
    @Req() req: FastifyRequest,
    @Param('id', ParseIntPipe) id: number,
    @Param('driverId') driverId: string,
  ) {
    const isOwner = await this.driversService.isOwnedServiceSpot(req.user.user_id, id);

    if (!isOwner) {
      throw new ForbiddenException(ServiceSpotException.NotOwned);
    }

    if (driverId === req.user.user_id) {
      throw new BadRequestException(ServiceSpotException.SelfRemove);
    }

    try {
      await this.serviceSpotsService.removeDriverFromServiceSpot(driverId, id);
    } catch (error: any) {
      switch (error.message) {
        case 'driver_not_found':
          throw new NotFoundException(DriverException.NotFound);
        case 'not_in_service_spot':
          throw new BadRequestException(ServiceSpotException.DriverNotInServiceSpot);
        default:
          throw error;
      }
    }
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
    const isOwner = await this.driversService.isOwnedServiceSpot(req.user.user_id, id);

    if (!isOwner) {
      throw new ForbiddenException({
        code: 'not_owner',
        message: 'You are not the owner of this service spot',
      });
    }

    return this.serviceSpotsService.getInviteCode(id);
  }
}
