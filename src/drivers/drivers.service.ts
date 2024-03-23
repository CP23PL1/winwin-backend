import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { Driver } from './entities/driver.entity';
import { DeepPartial, FindOptionsWhere, Repository } from 'typeorm';
import { DriverDto } from './dtos/driver.dto';
import { CreateDriverDto } from './dtos/create-driver.dto';

@Injectable()
export class DriversService {
  constructor(
    @InjectRepository(Driver)
    private readonly driverRepository: Repository<Driver>,
    private readonly driversMockupApi: DriversMockupApiService,
  ) {}

  async findOne(id: string): Promise<DriverDto> {
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
