import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  Req,
  ConflictException,
  BadRequestException,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiTags,
} from '@nestjs/swagger';
import { FindOneUserQueryDto, UserIdentificationType } from './dtos/find-one-user-query.dto';
import { FastifyRequest } from 'fastify';
import { Auth0Roles } from 'src/authorization/decorators/auth0-roles.decorator';
import { Role } from 'src/authorization/dto/user-info.dto';
import { Paginate, PaginateQuery } from 'nestjs-paginate';

@ApiTags('Users')
@ApiBearerAuth()
@Auth0Roles(Role.Passenger)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @HttpCode(HttpStatus.CREATED)
  @ApiCreatedResponse({
    description: 'The record has been successfully created.',
    type: CreateUserDto,
  })
  @ApiConflictResponse({
    description: 'User with the provided phone number or email already exists',
  })
  @Post()
  async create(@Req() req: FastifyRequest, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(req.user.user_id, createUserDto);
      return user;
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException({
            code: 'user_already_exists',
            message: 'User with the provided phone number or email already exists',
          });
        default:
          throw error;
      }
    }
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User information',
  })
  @ApiBadRequestResponse({
    description: 'User not found',
  })
  @Get('me')
  async getMyUserInfo(@Req() req: FastifyRequest) {
    const user = await this.usersService.findOne(req.user.user_id, UserIdentificationType.ID);

    if (!user) {
      throw new BadRequestException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    return user;
  }

  @HttpCode(HttpStatus.OK)
  @ApiOkResponse({
    description: 'User information',
  })
  @ApiBadRequestResponse({
    description: 'User not found',
  })
  @Get(':identifier')
  async findOne(
    @Param('identifier') identifier: string,
    @Query() { identify_by }: FindOneUserQueryDto,
  ) {
    const user = await this.usersService.findOne(identifier, identify_by);

    if (!user) {
      throw new BadRequestException({
        code: 'user_not_found',
        message: 'User not found',
      });
    }

    return user;
  }

  @Get('me/drive-requests')
  async getMyDriveRequests(@Req() req: FastifyRequest, @Paginate() query: PaginateQuery) {
    return this.usersService.findAllDriveRequestsByUserId(req.user.user_id, query);
  }

  @Get('me/drive-requests/:id')
  async getMyDriveRequest(@Req() req: FastifyRequest, @Param('id') id: string) {
    const driveRequest = await this.usersService.findOneDriveRequestByUserId(req.user.user_id, id);
    if (!driveRequest) {
      throw new BadRequestException({
        code: 'drive_request_not_found',
        message: 'Drive request not found',
      });
    }
    return driveRequest;
  }
}
