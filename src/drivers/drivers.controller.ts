import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { DriversService } from './drivers.service';
import { DriverVerifyDto } from './dtos/driver-verify.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Public } from 'src/authorization/decorators/public.decorator';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly driversMockupApiService: DriversMockupApiService,
  ) {}

  @Post('verify')
  @HttpCode(HttpStatus.OK)
  @Public()
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
}
