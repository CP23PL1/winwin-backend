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
      ...createDriverDto,
      serviceSpot: { id: createDriverDto.serviceSpotId },
    });
  }

  findOne(uid: string) {
    return this.driverRepo.findOne({
      where: { uid },
      relations: { serviceSpot: true },
    });
  }
}
