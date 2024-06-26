import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
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
import { Paginate, PaginateQuery, PaginatedSwaggerDocs } from 'nestjs-paginate';
import { Auth0Roles } from 'src/authorization/decorators/auth0-roles.decorator';
import { Role } from 'src/authorization/dto/user-info.dto';
import { DriverException } from './constants/exceptions';
import { DriverDto } from './dtos/driver.dto';
import { plainToInstance } from 'class-transformer';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { driveRequestPaginateConfig } from 'src/drive-requests/config/paginate.config';
import { DriveRequestDto } from 'src/drive-requests/dto/drive-request.dto';

@ApiTags('Drivers')
@ApiBearerAuth()
@Auth0Roles(Role.Driver)
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
      throw new BadRequestException(DriverException.UnregisteredDriver);
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Driver information successfully retrieved.',
    type: () => DriverDto,
  })
  @ApiBadRequestResponse({
    description: 'This phone number is not registered as a driver',
  })
  @Get('me')
  async getMyDriverInfo(@Req() req: FastifyRequest): Promise<DriverDto> {
    const driverInfo = await this.driversMockupApiService.getDriver(
      req.user.phone_number,
      'phone_number',
    );

    if (!driverInfo) {
      throw new BadRequestException(DriverException.UnregisteredDriver);
    }

    let driver = await this.driversService.findOneById(req.user.user_id, {
      loadEagerRelations: false,
      select: {
        id: true,
        role: true,
      },
      relations: {
        serviceSpot: true,
      },
    });

    if (!driver) {
      const result = await this.driversService.create({
        id: req.user.user_id,
        phoneNumber: req.user.phone_number,
      });
      driver = await this.driversService.findOneById(result.identifiers[0].id);
    }

    return plainToInstance(DriverDto, { ...driver, info: driverInfo });
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Driver ratings successfully retrieved.',
  })
  @Get('me/ratings')
  getMyRatings(@Req() req: FastifyRequest) {
    return this.driversService.findDriverRatingsByDriverId(req.user.user_id);
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'Driver successfully joined service spot.',
  })
  @ApiBadRequestResponse({
    description: 'Invite code is invalid or expired.',
  })
  @Patch('service-spot/join')
  async joinServiceSpot(@Req() req: FastifyRequest, @Body() data: JoinServiceSpot) {
    const driverHasServiceSpot = await this.driversService.IsDriverHasServiceSpot(req.user.user_id);

    if (driverHasServiceSpot) {
      throw new BadRequestException(DriverException.DriverAlreadyInServiceSpot);
    }

    const serviceSpotId = await this.serviceSpotsService.findServiceSpotByInviteCode(data.code);

    if (!serviceSpotId) {
      throw new BadRequestException(DriverException.InvalidInviteCode);
    }

    await this.driversService.update(req.user.user_id, {
      serviceSpot: {
        id: serviceSpotId,
      },
    });

    return {
      message: 'Driver successfully joined service spot',
    };
  }

  @HttpCode(HttpStatus.OK)
  @PaginatedSwaggerDocs(DriveRequest, driveRequestPaginateConfig)
  @Get('me/drive-requests')
  async getDriveRequests(@Paginate() query: PaginateQuery, @Req() req: FastifyRequest) {
    return this.driversService.findAllDriveRequestsByDriverId(
      req.user.user_id,
      query,
      driveRequestPaginateConfig,
    );
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    type: () => DriveRequestDto,
    description: 'Drive request successfully retrieved.',
  })
  @Get('me/drive-requests/:id')
  async getDriveRequest(@Req() req: FastifyRequest, @Param('id') id: string) {
    const driveRequest = await this.driversService.findOneDriveRequestByDriverId(
      req.user.user_id,
      id,
    );
    if (!driveRequest) {
      throw new NotFoundException(DriverException.DriveRequestNotFound);
    }
    return plainToInstance(DriveRequestDto, driveRequest);
  }
}
