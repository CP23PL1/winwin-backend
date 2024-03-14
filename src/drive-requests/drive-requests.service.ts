import { Injectable } from '@nestjs/common';
import { CreateDriveRequestDto } from './dto/create-drive-request.dto';
import { UpdateDriveRequestDto } from './dto/update-drive-request.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { DeepPartial, Repository } from 'typeorm';
import { AdditionalDriverDto } from 'src/externals/drivers-mockup-api/dtos/driver.dto';
import { User } from 'src/users/entities/user.entity';

@Injectable()
export class DriveRequestsService {
  constructor(
    @InjectRepository(DriveRequest)
    private driveRequestRepository: Repository<DriveRequest>,
  ) {}

  create(data: DeepPartial<DriveRequest>) {
    return this.driveRequestRepository.save(data);
  }

  findAll() {
    return `This action returns all driveRequests`;
  }

  findOne(id: number) {
    return `This action returns a #${id} driveRequest`;
  }

  update(id: number, data: DeepPartial<DriveRequest>) {
    return this.driveRequestRepository.save({ id, ...data });
  }

  remove(id: number) {
    return `This action removes a #${id} driveRequest`;
  }
}
