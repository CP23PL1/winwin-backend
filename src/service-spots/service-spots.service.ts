import { Injectable } from '@nestjs/common';
import { CreateServiceSpot, CreateServiceSpotFiles } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { Repository } from 'typeorm';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { AddressesService } from 'src/addresses/addresses.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
    private readonly addressesService: AddressesService,
    @InjectFirebaseAdmin()
    private readonly firebase: FirebaseAdmin,
  ) {}

  create(data: CreateServiceSpot, files: CreateServiceSpotFiles) {
    const bucket = this.firebase.storage.bucket();
    const serviceSpot = this.serviceSpotRepo.create(data);
    return this.serviceSpotRepo.manager.transaction(async (manager) => {
      const newServiceSpot = await manager.save(serviceSpot, {
        reload: true,
      });
      const path = `service-spots/${newServiceSpot.id}/images`;
      await bucket
        .file(`${path}/price_rate_image`)
        .save(files.priceRateImage[0].buffer, { contentType: files.priceRateImage[0].mimetype });
      return newServiceSpot;
    });
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
      coords: {
        lat: serviceSpot.coords.coordinates[1],
        lng: serviceSpot.coords.coordinates[0],
      },
      addressLine1: serviceSpot.addressLine1,
      addressLine2: serviceSpot.addressLine2,
      address,
      serviceSpotOwnerId: serviceSpot.serviceSpotOwnerId,
      approved: serviceSpot.approved,
    };
  }
}
