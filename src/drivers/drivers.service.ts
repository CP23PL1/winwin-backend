import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Driver } from './entities/driver.entity';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository, Not } from 'typeorm';
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

  async findOneDriveRequestByDriverId(driverId: string, driveRequestId: string) {
    return this.driveRequestRepository.findOne({
      loadEagerRelations: false,
      where: {
        id: driveRequestId,
        driverId,
      },
      relations: {
        user: true,
      },
    });
  }

  async findAllDriversInServiceSpot(serviceSpotId: number) {
    const drivers = await this.driverRepository
      .createQueryBuilder('driver')
      .select('driver.phoneNumber')
      .leftJoin('driver.serviceSpot', 'serviceSpot')
      .where('serviceSpot.id = :serviceSpotId AND driver.id <> serviceSpot.serviceSpotOwnerId', {
        serviceSpotId,
      })
      .getMany();
    if (drivers.length <= 0) {
      return [];
    }
    const driverInfos = await this.driversMockupApi.getDrivers({
      $in_field: 'phoneNumber',
      $in: drivers.map((driver) => driver.phoneNumber).join(','),
    });
    return driverInfos;
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
        ...(options?.select || {}),
        id: true,
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
