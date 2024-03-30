import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserIdentificationType } from './dtos/find-one-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DriveRequest)
    private readonly driveRequestRepository: Repository<DriveRequest>,
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

  findAllDriveRequestsByUserId(userId: string, query: PaginateQuery) {
    return paginate(query, this.driveRequestRepository, {
      where: {
        userId,
      },
      defaultLimit: 8,
      maxLimit: 10,
      sortableColumns: ['createdAt', 'status'],
      defaultSortBy: [['createdAt', 'DESC']],
    });
  }
}
