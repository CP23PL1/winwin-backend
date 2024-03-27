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
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FastifyRequest } from 'fastify';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Public } from 'src/authorization/decorators/public.decorator';
import { ServiceSpotsService } from 'src/service-spots/service-spots.service';
import { JoinServiceSpot } from 'src/service-spots/dto/join-service-spot.dto';
import { Role } from 'src/authorization/dto/user-info.dto';
import { Auth0Roles } from 'src/authorization/decorators/auth0-roles.decorator';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Drivers')
@ApiBearerAuth()
@Auth0Roles([Role.Driver])
@Controller('drivers')
export class DriversController {
  constructor(
    private readonly driversService: DriversService,
    private readonly driversMockupApiService: DriversMockupApiService,
    private readonly serviceSpotsService: ServiceSpotsService,
  ) {}

  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiNoContentResponse({
    description: 'Driver successfully verified.',
  })
  @ApiBadRequestResponse({
    description: 'This phone number is not registered as a driver',
  })
  @Public()
  @Post('verify')
  async verify(@Body() driverVerifyDto: DriverVerifyDto) {
    const driverInfo = await this.driversMockupApiService.getDriver(
      driverVerifyDto.phoneNumber,
      'phone_number',
    );

    if (!driverInfo) {
      throw new BadRequestException({
        code: 'unregistered_driver',
        message: 'This phone number is not registered as a driver',
      });
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Driver information successfully retrieved.',
    type: DriverVerifyDto,
  })
  @ApiBadRequestResponse({
    description: 'This phone number is not registered as a driver',
  })
  @Get('me')
  async getMyDriverInfo(@Req() req: FastifyRequest) {
    const driverInfo = await this.driversMockupApiService.getDriver(
      req.user.phone_number,
      'phone_number',
    );

    if (!driverInfo) {
      throw new BadRequestException({
        code: 'unregistered_driver',
        message: 'This phone number is not registered as a driver',
      });
    }

    const driver = await this.driversService.findOne(req.user.user_id);

    if (driver) {
      return driver;
    }

    return this.driversService.create({
      id: req.user.user_id,
      phoneNumber: req.user.phone_number,
    });
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

  @HttpCode(HttpStatus.OK)
  @Get('me/drive-requests')
  async getDriveRequests(@Paginate() query: PaginateQuery, @Req() req: FastifyRequest) {
    return this.driversService.findAllDriveRequestsByDriverId(req.user.user_id, query);
  }
}
