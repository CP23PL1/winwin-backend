import { Controller, Get, Post, Body, Patch, Param, Delete, Query, Req } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { FindOneUserQueryDto, UserIdentificationType } from './dtos/find-one-user-query.dto';

@ApiTags('Users')
@ApiBearerAuth()
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get('me')
  getMyUserInfo(@Req() req) {
    return this.usersService.findOne(req.user.name, UserIdentificationType.PHONE_NUMBER);
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
