import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  Req,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindOneUserQueryDto, UserIdentificationType } from './dtos/find-one-user-query.dto';
import { FastifyRequest } from 'fastify';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Req() req: FastifyRequest, @Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(req.user.user_id, createUserDto);
      return user;
    } catch (error: any) {
      switch (error.code) {
        case '23505':
          throw new ConflictException(
            'User with the provided phone number or email already exists',
          );
        default:
          throw error;
      }
    }
  }

  @Get('me')
  async getMyUserInfo(@Req() req: FastifyRequest) {
    const user = await this.usersService.findOne(req.user.user_id, UserIdentificationType.ID);

    if (!user) {
      throw new BadRequestException('User not found');
    }

    return user;
  }

  @Get(':identifier')
  findOne(@Param('identifier') identifier: string, @Query() { identify_by }: FindOneUserQueryDto) {
    return this.usersService.findOne(identifier, identify_by);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(+id, updateUserDto);
  }
}
