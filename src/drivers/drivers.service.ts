import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Driver } from './entities/driver.entity';
import { Repository } from 'typeorm';
import { CreateDriverDto } from './dtos/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepo: Repository<Driver>,
  ) {}

  create(createDriverDto: CreateDriverDto) {
    return this.driverRepo.save({
      uid: createDriverDto.uid,
      firstName: createDriverDto.firstName,
      lastName: createDriverDto.lastName,
      serviceSpot: {
        id: createDriverDto.serviceSpotId,
      },
      role: createDriverDto.role,
    });
  }

  findOne(uid: string) {
    return this.driverRepo.findOne({
      where: { uid },
      relations: { serviceSpot: true },
    });
  }
}
