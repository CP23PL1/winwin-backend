import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Driver, DriverRole } from './entities/driver.entity';
import { DeepPartial, FindOneOptions, FindOptionsWhere, Repository, Not, IsNull } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';
import { DriveRequest } from 'src/drive-requests/entities/drive-request.entity';
import { plainToInstance } from 'class-transformer';
import { DriverDto } from './dtos/driver.dto';
import { DriverRating } from './entities/driver-rating.entity';

@Injectable()
export class DriversService {
  private readonly logger = new Logger(DriversService.name);

  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    @InjectRepository(DriveRequest)
    private readonly driveRequestRepository: Repository<DriveRequest>,
    @InjectRepository(DriverRating)
    private readonly driverRatingRepository: Repository<DriverRating>,
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
      .select('driver.id')
      .addSelect('driver.phoneNumber')
      .leftJoin('driver.serviceSpot', 'serviceSpot')
      .where('serviceSpot.id = :serviceSpotId AND role = :role', {
        serviceSpotId,
        role: DriverRole.MEMBER,
      })
      .getMany();

    if (drivers.length <= 0) {
      return [];
    }

    const driverInfos = await this.driversMockupApi.getDrivers({
      $in_field: 'phoneNumber',
      $in: drivers.map((driver) => driver.phoneNumber).join(','),
    });

    const mergedDriver = drivers.map((driver) => {
      const driverInfo = driverInfos.data.find((info) => info.phoneNumber === driver.phoneNumber);
      return plainToInstance(DriverDto, { ...driver, info: driverInfo });
    });

    return {
      data: mergedDriver,
      meta: driverInfos.meta,
    };
  }

  async findDriverRatingsByDriverId(driverId: string) {
    return this.driverRatingRepository.find({
      where: { driverId },
    });
    // return this.driverRatingRepository
    //   .createQueryBuilder('driverRating')
    //   .select('CAST(driverRating.rating AS FLOAT)')
    //   .addSelect('driverRating.category', 'category')
    //   .addSelect('driverRating.totalFeedbacks', 'totalFeedbacks')
    //   .where('driverRating.driverId = :driverId', { driverId })
    //   .where({ driverId })
    //   .getRawMany();
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

  async findOneWithInfo(options: FindOneOptions<Driver> = {}) {
    const driver = await this.driverRepository.findOne({
      ...options,
      select: {
        ...(options?.select || {}),
        id: true,
        phoneNumber: true,
      },
    });

    if (!driver) {
      return null;
    }

    const driverInfo = await this.driversMockupApi.getDriver(driver.phoneNumber, 'phone_number');

    return plainToInstance(DriverDto, { ...driver, info: driverInfo });
  }

  async IsDriverHasServiceSpot(driverId: string) {
    console.log(driverId);
    return this.driverRepository
      .createQueryBuilder('driver')
      .where({
        id: driverId,
        serviceSpot: Not(IsNull()),
      })
      .getExists();
  }

  create(data: CreateDriverDto) {
    return this.driverRepository.insert(data);
  }

  async removeFromServiceSpot(driverId: string) {
    return this.driverRepository.update(driverId, {
      serviceSpot: null,
    });
  }

  async update(id: string, data: DeepPartial<Driver>) {
    return this.driverRepository.update(id, data);
  }

  async isOwnedServiceSpot(driverId: string, serviceSpotId: number) {
    return this.driverRepository
      .count({
        where: {
          id: driverId,
          serviceSpotId,
          role: DriverRole.OWNER,
        },
      })
      .then((count) => count > 0);
  }
}
