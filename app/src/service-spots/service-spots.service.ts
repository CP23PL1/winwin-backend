import { Injectable } from '@nestjs/common';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { Repository } from 'typeorm';
import { ServiceSpotDto } from './dto/service-spot.dto';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
  ) {}
  async create(data: CreateServiceSpot) {
    const newServiceSpot = await this.serviceSpotRepo.save(data);
    return newServiceSpot;
  }

  findAll() {
    return this.serviceSpotRepo.find();
  }

  async findAllByDistance(lat: number, lng: number, radius: number) {
    const result = await this.serviceSpotRepo
      .createQueryBuilder('serviceSpot')
      .addSelect('ST_Distance(serviceSpot.coords, ST_MakePoint(:lng, :lat)::geography)', 'distance')
      .where('ST_DWithin(serviceSpot.coords, ST_MakePoint(:lng, :lat)::geography, :radius)')
      .setParameters({
        lat,
        lng,
        radius,
      })
      .orderBy('distance', 'ASC')
      .getRawMany<ServiceSpot>();
    const formattedResult = JSON.stringify(result ?? []).replace(/serviceSpot_/g, '');
    return JSON.parse(formattedResult) as ServiceSpotDto[];
  }

  findOne(id: number) {
    return this.serviceSpotRepo.findOneBy({ id });
  }

  update(id: number, data: UpdateServiceSpot) {
    return this.serviceSpotRepo.update({ id }, data);
  }

  remove(id: number) {
    return this.serviceSpotRepo.delete({ id });
  }
}
