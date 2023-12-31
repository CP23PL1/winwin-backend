import { Injectable } from '@nestjs/common';
import { CreateServiceSpot } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { Repository } from 'typeorm';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { AddressesService } from 'src/addresses/addresses.service';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
    private readonly addressesService: AddressesService,
  ) {}

  create(data: CreateServiceSpot) {
    return this.serviceSpotRepo.save(data);
  }

  findAll() {
    return this.serviceSpotRepo.find();
  }

  async findAllByDistance(lat: number, lng: number, radius: number) {
    const result = await this.serviceSpotRepo
      .createQueryBuilder('serviceSpot')
      .addSelect('ST_Distance(serviceSpot.coords, ST_MakePoint(:lng, :lat)::geography)', 'distance')
      .where('ST_DWithin(serviceSpot.coords, ST_MakePoint(:lng, :lat)::geography, :radius)')
      .andWhere('serviceSpot.approved IS TRUE')
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
    return this.serviceSpotRepo.save({ id, ...data });
  }

  remove(id: number) {
    return this.serviceSpotRepo.delete({ id });
  }

  async mapToDto(serviceSpot: ServiceSpot): Promise<ServiceSpotDto> {
    const address = await this.addressesService.findOneAddressBySubDistrictId(
      serviceSpot.subDistrictId,
    );
    return {
      id: serviceSpot.id,
      name: serviceSpot.name,
      placeId: serviceSpot.placeId,
      coords: {
        lat: serviceSpot.coords.coordinates[1],
        lng: serviceSpot.coords.coordinates[0],
      },
      addressLine1: serviceSpot.addressLine1,
      addressLine2: serviceSpot.addressLine2,
      address,
      serviceSpotOwnerUid: serviceSpot.serviceSpotOwnerUid,
      approved: serviceSpot.approved,
    };
  }
}
