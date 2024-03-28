import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Driver } from './entities/driver.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { PaginateQuery, paginate } from 'nestjs-paginate';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(DriveRequest)
    private readonly driveRequestRepository: Repository<DriveRequest>,
    private readonly driversMockupApi: DriversMockupApiService,
  ) {}

  async findAllDriveRequestsByDriverId(driverId: string, query: PaginateQuery) {
    return paginate(query, this.driveRequestRepository, {
      sortableColumns: ['id', 'status', 'createdAt'],
      where: { driverId },
    });
  }

  async findAllInServiceSpot(serviceSpotId: number) {
    const driverPhoneNumbers = await this.driverRepository.find({
      select: ['phoneNumber'],
      where: { serviceSpot: { id: serviceSpotId } },
      loadEagerRelations: false,
    });

    if (!driverPhoneNumbers.length) {
      return [];
    }

    const drivers = await this.driversMockupApi.getDrivers({
      $in_field: 'phoneNumber',
      $in: driverPhoneNumbers.map((driver) => driver.phoneNumber).join(','),
    });

    return drivers;
  }

  async findOne(id: string) {
    const driver = await this.driverRepository.findOne({ where: { id } });
    if (!driver) {
      return null;
    }
    const driverInfo = await this.driversMockupApi.getDriver(driver.phoneNumber, 'phone_number');
    return {
      ...driver,
      info: driverInfo,
    };
  }

  async findOneBy(where: FindOptionsWhere<Driver>) {
    return this.driverRepository.findOne({ where });
  }

  async create(data: CreateDriverDto) {
    const newDriver = await this.driverRepository.save(data);
    return this.findOne(newDriver.id);
  }

  async update(id: string, data: DeepPartial<Driver>) {
    await this.driverRepository.update(id, data);
    return this.findOne(id);
  }
}
