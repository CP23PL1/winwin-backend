import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Driver } from './entities/driver.entity';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { plainToInstance } from 'class-transformer';
import { DriverDto } from './dtos/driver.dto';

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

  async findAllDriveRequestsByDriverId(
    driverId: string,
    query: PaginateQuery,
    config: PaginateConfig<DriveRequest>,
  ) {
    return paginate(query, this.driveRequestRepository, {
      ...config,
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

  async findOneById(id: Driver['id'], options: FindOneOptions<Driver> = {}) {
    return this.driverRepository.findOne({
      ...options,
      where: { id },
    });
  }

  async findOneBy(where: FindOptionsWhere<Driver>) {
    return this.driverRepository.findOne({ where });
  }

  async findOneWithInfo(id: Driver['id'], options: FindOneOptions<Driver> = {}) {
    const driver = await this.driverRepository.findOne({
      ...options,
      select: {
        ...options.select,
        phoneNumber: true,
      },
      where: { id },
    });

    if (!driver) {
      return null;
    }

    const driverInfo = await this.driversMockupApi.getDriver(driver.phoneNumber, 'phone_number');

    return plainToInstance(DriverDto, { ...driver, info: driverInfo });
  }

  create(data: CreateDriverDto) {
    return this.driverRepository.save(data);
  }

  async update(id: string, data: DeepPartial<Driver>) {
    return this.driverRepository.update(id, data);
  }
}
