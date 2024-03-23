import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  Post,
  Req,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriverVerifyDto } from './dtos/driver-verify.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiNoContentResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Public } from 'src/authorization/decorators/public.decorator';
import { ServiceSpotsService } from 'src/service-spots/service-spots.service';
import { JoinServiceSpot } from 'src/service-spots/dto/join-service-spot.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly driversMockupApiService: DriversMockupApiService,
    private readonly serviceSpotsService: ServiceSpotsService,
  ) {}

  @HttpCode(HttpStatus.OK)
  @Public()
  @Post('verify')
  async verify(@Body() driverVerifyDto: DriverVerifyDto) {
    const driverInfo = await this.driversMockupApiService.getDriver(
      driverVerifyDto.phoneNumber,
      'phone_number',
    );

    if (!driverInfo) {
      throw new BadRequestException('This phone number is not registered as a driver');
    }

    return driverInfo;
  }

  @Get('me')
  async getMyDriverInfo(@Req() req: FastifyRequest) {
    let driver = await this.driversService.findOne(req.user.user_id);

    if (!driver) {
      driver = await this.driversService.create({
        id: req.user.user_id,
        phoneNumber: req.user.phone_number,
      });
    }

    return driver;
  }

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Driver successfully joined service spot.',
  })
  @ApiBadRequestResponse({
    description: 'Invite code is invalid or expired.',
  })
  @Patch('service-spot/join')
  async joinServiceSpot(@Req() req: FastifyRequest, @Body() data: JoinServiceSpot) {
    const serviceSpotId = await this.serviceSpotsService.findServiceSpotByInviteCode(data.code);

    if (!serviceSpotId) {
      throw new BadRequestException('Invite code is invalid or expired');
    }

    await this.driversService.update(req.user.user_id, {
      serviceSpot: {
        id: parseInt(serviceSpotId),
      },
    });
  }
}
