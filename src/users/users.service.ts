import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UpdateUserDto } from './dtos/update-user.dto';
import { UserIdentificationType } from './dtos/find-one-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}
  create(userId: string, createUserDto: CreateUserDto) {
    return this.userRepository.save({
      id: userId,
      ...createUserDto,
    });
  }

  findOne(identifier: string | number, identifyBy: UserIdentificationType) {
    return this.userRepository.findOne({
      where: {
        [identifyBy]: identifier,
      },
    });
  }

  update(id: number, updateUserDto: UpdateUserDto) {
    return `This action updates a #${id} user`;
  }
}
