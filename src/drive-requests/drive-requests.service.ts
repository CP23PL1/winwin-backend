import { Injectable } from '@nestjs/common';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
import { UpdateDriveRequestDto } from './dto/update-drive-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { Repository } from 'typeorm';

@Injectable()
export class DriveRequestsService {
  constructor(
    @InjectRepository(DriveRequest)
    private driveRequestRepository: Repository<DriveRequest>,
  ) {}

  create(createDriveRequestDto: CreateDriveRequestDto) {
    return 'This action adds a new driveRequest';
  }

  findAll() {
    return `This action returns all driveRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} driveRequest`;
  }

  update(id: number, updateDriveRequestDto: UpdateDriveRequestDto) {
    return `This action updates a #${id} driveRequest`;
  }

  remove(id: number) {
    return `This action removes a #${id} driveRequest`;
  }
}
