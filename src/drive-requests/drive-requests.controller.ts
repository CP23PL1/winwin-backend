import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Req,
} from '@nestjs/common';
import { GoogleApiService } from 'src/externals/google-api/google-api.service';
import { DriveRequestsService } from './drive-requests.service';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDriveRequestPreviewDto } from './dto/create-drive-request-preview.dto';
import { DriveRequestPreviewDto } from './dto/drive-request-preview.dto';
import { CreateDriveRequestFeedbackDto } from './dto/create-drive-request-feedback.dto';
import { DriveRequestException } from './constants/exceptions';
import { DriveRequestDto } from './dto/drive-request.dto';
import { FastifyRequest } from 'fastify';
import { DriversService } from 'src/drivers/drivers.service';
import { plainToInstance } from 'class-transformer';

@ApiTags('Drive Requests')
@ApiBearerAuth()
@Controller('drive-requests')
export class DriveRequestsController {
  private DRIVE_SERVICE_CHARGE: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly googleApiService: GoogleApiService,
    private readonly driveRequestsService: DriveRequestsService,
    private readonly driversService: DriversService,
  ) {
    this.DRIVE_SERVICE_CHARGE = parseInt(this.configService.get('DRIVE_SERVICE_CHARGE'), 10);
  }

  @HttpCode(HttpStatus.CREATED)
  @Post('preview')
  async previewRoutes(@Body() body: CreateDriveRequestPreviewDto): Promise<DriveRequestPreviewDto> {
    const { routes } = await this.googleApiService.getRoutes(body.origin, body.destination);
    const route = routes[0];

    const priceByDistance = this.driveRequestsService.calculatePriceByDistanceMeters(
      route.distanceMeters,
    );
    const total = Math.round(priceByDistance + this.DRIVE_SERVICE_CHARGE);

    const data: DriveRequestPreviewDto = {
      ...route,
      priceByDistance,
      total,
      serviceCharge: this.DRIVE_SERVICE_CHARGE,
    };

    return data;
  }

  @Get(':id')
  async findOne(@Req() req: FastifyRequest, @Param('id') id: string): Promise<DriveRequestDto> {
    const driveRequest = await this.driveRequestsService.findOneOwned(id, req.user.user_id);
    console.log(driveRequest);
    if (!driveRequest) {
      throw new NotFoundException(DriveRequestException.NotFound);
    }

    const driver = await this.driversService.findOneWithInfo(driveRequest.driverId, {
      loadEagerRelations: false,
      select: {
        id: true,
        serviceSpot: {
          id: true,
          name: true,
        },
      },
      relations: ['serviceSpot'],
    });

    return plainToInstance(DriveRequestDto, {
      ...driveRequest,
      driver,
    });
  }

  @Post(':id/feedback')
  async feedback(@Param('id') id: string, @Body() data: CreateDriveRequestFeedbackDto) {
    const driveRequestExists = await this.driveRequestsService.exists(id);

    if (!driveRequestExists) {
      throw new NotFoundException({
        code: 'drive_request_not_found',
        message: 'Drive request not found',
      });
    }

    return this.driveRequestsService.createFeedback(id, data);
  }
}
