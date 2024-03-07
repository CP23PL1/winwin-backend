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
  async create(@Body() createUserDto: CreateUserDto) {
    try {
      const user = await this.usersService.create(createUserDto);
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
  getMyUserInfo(@Req() req: FastifyRequest) {
    return this.usersService.findOne(req.user.phone_number, UserIdentificationType.PHONE_NUMBER);
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
