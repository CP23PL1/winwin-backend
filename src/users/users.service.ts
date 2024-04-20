import { Injectable } from '@nestjs/common';
import { CreateUserDto } from './dtos/create-user.dto';
import { UserIdentificationType } from './dtos/find-one-user-query.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { DriversService } from 'src/drivers/drivers.service';
import { plainToInstance } from 'class-transformer';
import { DriveRequestDto } from 'src/drive-requests/dto/drive-request.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(DriveRequest)
    private readonly driveRequestRepository: Repository<DriveRequest>,
    private readonly driversService: DriversService,
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

  async findOneDriveRequestByUserId(userId: string, driveRequestId: string) {
    const driveRequest = await this.driveRequestRepository.findOne({
      loadEagerRelations: false,
      where: {
        id: driveRequestId,
        userId,
      },
    });

    const driver = await this.driversService.findOneWithInfo({
      where: { id: driveRequest.driverId },
      loadEagerRelations: false,
    });

    return plainToInstance(DriveRequestDto, {
      ...driveRequest,
      driver,
    });
  }
}
