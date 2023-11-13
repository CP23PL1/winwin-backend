import { Injectable } from '@nestjs/common';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { Repository } from 'typeorm';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
  ) {}
  create(data: CreateServiceSpot) {
    return this.serviceSpotRepo.save(data);
  }

  findAll() {
    return this.serviceSpotRepo;
  }

  async findAllByDistance(lat: number, lng: number, radius: number) {
    const result = await this.serviceSpotRepo
      .createQueryBuilder('serviceSpot')
      .addSelect(
        'ST_Distance(serviceSpot.location, ST_MakePoint(:lng, :lat)::geography)',
        'distance',
      )
      .where('ST_DWithin(serviceSpot.location, ST_MakePoint(:lng, :lat)::geography, :radius)', {
        lat,
        lng,
        radius,
      })
      .orderBy('distance', 'ASC')
      .getRawMany<ServiceSpot>();
    const formattedResult = JSON.stringify(result ?? []).replace(/serviceSpot_/g, '');
    return JSON.parse(formattedResult) as ServiceSpot[];
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
