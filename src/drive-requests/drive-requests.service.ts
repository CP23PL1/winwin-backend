import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest, DriveRequestStatus } from './entities/drive-request.entity';
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

  async updateDriveRequestStatus(id: number, status: DriveRequestStatus) {
    const driveRequest = await this.findOne(id);
    if (!driveRequest) {
      throw new Error('Drive request not found');
    }
    const validStatuses = this.getDriveRequestStateMachine(driveRequest.status);
    if (!validStatuses.includes(status)) {
      throw new Error('Invalid status');
    }
    driveRequest.status = status;
    const updatedDriveRequest = await this.driveRequestRepository.save(driveRequest);
    return updatedDriveRequest;
  }

  getDriveRequestStateMachine(currentStatus: DriveRequestStatus) {
    switch (currentStatus) {
      case DriveRequestStatus.PENDING:
        return [DriveRequestStatus.ACCEPTED, DriveRequestStatus.REJECTED];
      case DriveRequestStatus.ACCEPTED:
        return [DriveRequestStatus.PICKED_UP, DriveRequestStatus.CANCELLED];
      case DriveRequestStatus.PICKED_UP:
        return [DriveRequestStatus.COMPLETED, DriveRequestStatus.CANCELLED];
      default:
        return [];
    }
  }
}
