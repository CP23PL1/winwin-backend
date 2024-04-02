import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
} from '@nestjs/common';
import { GoogleApiService } from 'src/externals/google-api/google-api.service';
import { DriveRequestsService } from './drive-requests.service';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { CreateDriveRequestPreviewDto } from './dto/create-drive-request-preview.dto';
import { DriveRequestPreviewDto } from './dto/drive-request-preview.dto';
import { CreateDriveRequestFeedbackDto } from './dto/create-drive-request-feedback.dto';

@ApiTags('Drive Requests')
@ApiBearerAuth()
@Controller('drive-requests')
export class DriveRequestsController {
  private DRIVE_SERVICE_CHARGE: number;
  constructor(
    private readonly configService: ConfigService,
    private readonly googleApiService: GoogleApiService,
    private readonly driveRequestsService: DriveRequestsService,
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

  @Post('__test__/compute-feedback')
  async computeFeedback() {
    return this.driveRequestsService.computeFeedback();
  }
}
