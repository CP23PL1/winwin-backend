import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriveRequest } from './entities/drive-request.entity';
import { DeepPartial, Repository } from 'typeorm';
import { DriversService } from 'src/drivers/drivers.service';
import { DriveRequestDto } from './dto/drive-request.dto';
import { PaginateQuery, paginate } from 'nestjs-paginate';

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

  findAllDriveRequestsByDriverId(driverId: string, query: PaginateQuery) {
    return paginate(query, this.driveRequestRepository, {
      sortableColumns: ['id', 'status', 'createdAt'],
      where: { driverId },
    });
  }

  async findOne(id: string): Promise<DriveRequestDto> {
    const driveRequest = await this.driveRequestRepository.findOne({ where: { id } });
    const driver = await this.driversService.findOne(driveRequest.driverId);
    return {
      ...driveRequest,
      driver,
    };
  }

  calculatePriceByDistanceMeters(distanceMeters: number) {
    if (distanceMeters <= 0) {
      throw new Error('Distance must be greater than 0');
    }
    let price = 0;
    const distanceKm = Math.floor(distanceMeters / 1000);
    if (distanceKm <= 1.1) {
      price = 15;
    } else if (distanceKm <= 1.5) {
      price = 20;
    } else if (distanceKm <= 2) {
      price = 25;
    } else if (distanceKm <= 5) {
      price = (distanceKm - 2) * 5 + 25;
    } else if (distanceKm <= 10) {
      price = (distanceKm - 5) * 10 + 40;
    } else {
      price = 90;
    }
    return price;
  }
}
