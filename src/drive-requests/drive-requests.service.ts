import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { DeepPartial, Repository } from 'typeorm';
import { DriversService } from 'src/drivers/drivers.service';
import { DriveRequestDto } from './dto/drive-request.dto';

@Injectable()
export class DriveRequestsService {
  constructor(
    @InjectRepository(DriveRequest)
    private driveRequestRepository: Repository<DriveRequest>,
    private driversService: DriversService,
  ) {}

  async create(data: DeepPartial<DriveRequest>): Promise<DriveRequestDto> {
    const newDriveRequest = await this.driveRequestRepository.save(data);
    return this.findOne(newDriveRequest.id);
  }

  findAll() {
    return `This action returns all driveRequests`;
  }

  async findOne(id: number): Promise<DriveRequestDto> {
    const driveRequest = await this.driveRequestRepository.findOne({ where: { id } });
    const driver = await this.driversService.findOne(driveRequest.driverId);
    return {
      ...driveRequest,
      driver,
    };
  }

  update(id: number, data: DeepPartial<DriveRequest>) {
    return this.driveRequestRepository.save({ id, ...data });
  }

  remove(id: number) {
    return `This action removes a #${id} driveRequest`;
  }
}
