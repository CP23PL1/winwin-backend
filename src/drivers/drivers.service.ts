import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';
import { DriverDto } from './dtos/driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}

  create(uid: string, createDriverDto: CreateDriverDto) {
    return this.driverRepo.save({
      ...createDriverDto,
      uid,
    });
  }

  update(uid: string, data: Partial<Driver>) {
    return this.driverRepo.save({ ...data, uid });
  }

  findOne(uid: string) {
    return this.driverRepo.findOne({
      where: { uid },
      relations: { serviceSpot: true },
    });
  }

  findOneByPhoneNumber(phoneNumber: string) {
    return this.driverRepo.findOne({
      where: { phoneNumber },
      relations: { serviceSpot: true },
    });
  }

  mapToDto(driver: Driver): DriverDto {
    return {
      uid: driver.uid,
      firstName: driver.firstName,
      lastName: driver.lastName,
      phoneNumber: driver.phoneNumber,
      approved: driver.approved,
      serviceSpot: driver.serviceSpot,
    };
  }
}
