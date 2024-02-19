import { Injectable } from '@nestjs/common';
import { CreateServiceSpot, CreateServiceSpotFiles } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { FindOptionsSelect, Repository } from 'typeorm';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { AddressesService } from 'src/addresses/addresses.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { ServiceSpotHasDriver } from './entities/service-spot-has-driver.entity';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
    @InjectRepository(ServiceSpotHasDriver)
    private readonly serviceSpotHasDriverRepo: Repository<ServiceSpotHasDriver>,
    private readonly addressesService: AddressesService,
    private readonly driversMockupApi: DriversMockupApiService,
    @InjectFirebaseAdmin()
    private readonly firebase: FirebaseAdmin,
  ) {}

  create(data: CreateServiceSpot, files: CreateServiceSpotFiles) {
    const bucket = this.firebase.storage.bucket();
    return this.serviceSpotRepo.manager.transaction(async (manager) => {
      const newServiceSpot = this.serviceSpotRepo.create(data);
      await manager.save(newServiceSpot);
      const serviceSpotHasDriver = this.serviceSpotHasDriverRepo.create({
        driverId: data.serviceSpotOwnerId,
        serviceSpot: {
          id: newServiceSpot.id,
        },
      });
      await manager.save(serviceSpotHasDriver);
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

  async findDriverServiceSpotByDriverId(
    driverId: number,
    select: FindOptionsSelect<ServiceSpotHasDriver>,
  ) {
    const serviceSpotHasDriver = await this.serviceSpotHasDriverRepo.findOne({
      where: { driverId },
      select,
      relations: {
        serviceSpot: true,
      },
    });

    if (!serviceSpotHasDriver) {
      return null;
    }

    return serviceSpotHasDriver.serviceSpot;
  }

  findOne(id: number) {
    return this.serviceSpotRepo.findOne({ where: { id } });
  }

  update(id: number, data: UpdateServiceSpot) {
    return this.serviceSpotRepo.save({ id, ...data });
  }

  remove(id: number) {
    return this.serviceSpotRepo.delete({ id });
  }

  getImageUrl(serviceSpotId: number, imageName: string) {
    const bucket = this.firebase.storage.bucket();
    return bucket
      .file(`service-spots/${serviceSpotId}/images/${imageName}`)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week
      })
      .then((result) => result[0]);
  }

  async mapToDto(serviceSpot: ServiceSpot): Promise<ServiceSpotDto> {
    const address = await this.addressesService.findOneAddressBySubDistrictId(
      serviceSpot.subDistrictId,
    );
    const driver = await this.driversMockupApi.getDriver(
      serviceSpot.serviceSpotOwnerId.toString(),
      'id',
    );
    const priceRateImageUrl = await this.getImageUrl(serviceSpot.id, 'price_rate_image');
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
      serviceSpotOwner: driver,
      approved: serviceSpot.approved,
      priceRateImageUrl,
    };
  }
}
