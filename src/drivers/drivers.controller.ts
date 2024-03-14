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
  async verify(@Req() req: FastifyRequest) {
    const driverInfo = await this.driversMockupApiService.getDriver(
      req.user.phone_number,
      'phone_number',
    );
    if (!driverInfo) {
      throw new BadRequestException('This phone number is not registered as a driver');
    }

    const driver = await this.driversService.findOneBy({ phoneNumber: req.user.phone_number });

    if (!driver) {
      await this.driversService.create({
        id: req.user.user_id,
        phoneNumber: req.user.phone_number,
      });
    }
  }

  @Get('me')
  getMyDriverInfo(@Req() req: FastifyRequest) {
    return this.driversService.findOne(req.user.user_id);
  }
}
