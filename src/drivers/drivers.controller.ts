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
import { Public } from 'src/authorization/public.decorator';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';

@ApiTags('Drivers')
@ApiBearerAuth()
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly driversMockupService: DriversMockupApiService,
  ) {}

  @Post('verify')
  @Public()
  @HttpCode(HttpStatus.OK)
  async verify(@Body() data: DriverVerifyDto) {
    const driver = await this.driversService.verify(data.phoneNumber);
    if (!driver) {
      throw new BadRequestException('This phone number is not registered as a driver');
    }
  }

  @Get('me')
  getMyDriverInfo(@Req() req) {
    return this.driversMockupService.getDriver(req.user.name, 'phone_number');
  }
}
