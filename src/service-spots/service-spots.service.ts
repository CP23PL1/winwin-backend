import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateServiceSpot, CreateServiceSpotFiles } from './dto/create-service-spot.dto';
import { UpdateServiceSpot } from './dto/update-service-spot.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { ServiceSpot } from './entities/service-spot.entity';
import { FindOneOptions, FindOptions, Repository } from 'typeorm';
import { ServiceSpotDto } from './dto/service-spot.dto';
import { AddressesService } from 'src/addresses/addresses.service';
import { FirebaseAdmin, InjectFirebaseAdmin } from 'nestjs-firebase';
import { DriversService } from 'src/drivers/drivers.service';
import { customAlphabet } from 'nanoid';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Redis } from 'ioredis';
import { ServiceSpotInviteDto } from './dto/service-spot-invite.dto';
import { instanceToPlain } from 'class-transformer';

@Injectable()
export class ServiceSpotsService {
  constructor(
    @InjectRepository(ServiceSpot)
    private readonly serviceSpotRepo: Repository<ServiceSpot>,
    private readonly driversService: DriversService,
    @InjectFirebaseAdmin()
    private readonly firebase: FirebaseAdmin,
    @InjectRedis()
    private readonly redis: Redis,
  ) {}

  create(data: CreateServiceSpot, files: CreateServiceSpotFiles) {
    const bucket = this.firebase.storage.bucket();
    return this.serviceSpotRepo.manager.transaction(async (manager) => {
      const driver = await this.driversService.findOneById(data.serviceSpotOwnerId);
      if (!driver) {
        throw new Error('Driver not found');
      }
      const newServiceSpot = this.serviceSpotRepo.create(data);
      await manager.save(newServiceSpot);
      driver.serviceSpot = newServiceSpot;
      await manager.save(driver);
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
    return (JSON.parse(formattedResult) as ServiceSpot[]).map((serviceSpot) => ({
      ...serviceSpot,
      coords: {
        lat: serviceSpot.coords.coordinates[1],
        lng: serviceSpot.coords.coordinates[0],
      },
    }));
  }

  async findOne(id: number, options: FindOneOptions<ServiceSpot> = {}) {
    const serviceSpot = await this.serviceSpotRepo.findOne({ ...options, where: { id } });
    if (!serviceSpot) {
      throw new NotFoundException(`Service spot #${id} not found`);
    }
    return serviceSpot;
  }

  update(id: number, data: UpdateServiceSpot) {
    return this.serviceSpotRepo.save({ id, ...data });
  }

  remove(id: number) {
    return this.serviceSpotRepo.delete({ id });
  }

  async exists(id: number) {
    return this.serviceSpotRepo.count({ where: { id } }).then((count) => count > 0);
  }

  async isOwnedServiceSpot(driverId: string, serviceSpotId: number) {
    return this.serviceSpotRepo
      .count({ where: { id: serviceSpotId, serviceSpotOwnerId: driverId } })
      .then((count) => count > 0);
  }

  async removeDriverFromServiceSpot(driverId: string, serviceSpotId: number) {
    return this.serviceSpotRepo.manager.transaction(async (manager) => {
      const driver = await this.driversService.findOneById(driverId, {
        select: {
          id: true,
          serviceSpot: { id: true },
        },
        relations: { serviceSpot: true },
      });
      if (!driver) {
        throw new Error('Driver not found');
      }
      if (driver.serviceSpot.id !== serviceSpotId) {
        throw new Error('Driver not in service spot');
      }
      driver.serviceSpot = null;
      await manager.save(driver);
    });
  }

  async getImageUrl(serviceSpotId: number, imageName: string) {
    const bucket = this.firebase.storage.bucket();
    return bucket
      .file(`service-spots/${serviceSpotId}/images/${imageName}`)
      .getSignedUrl({
        action: 'read',
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7, // 1 week,
      })
      .then((result) => result[0]);
  }

  async getInviteCode(serviceSpotId: number): Promise<ServiceSpotInviteDto> {
    const serviceSpotSessionKey = `service-spot:${serviceSpotId}:invite-code`;
    let inviteCode = await this.redis.get(serviceSpotSessionKey);
    if (!inviteCode) {
      inviteCode = customAlphabet('1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ', 5)();
    }
    const inviteSession = await this.redis.get(`invitation:${inviteCode}`);
    if (!inviteSession) {
      const ttl = 900; // 15 minute (in seconds)
      await Promise.all([
        this.redis.set(`invitation:${inviteCode}`, serviceSpotId, 'EX', ttl),
        this.redis.set(serviceSpotSessionKey, inviteCode, 'EX', ttl),
      ]);
      return {
        code: inviteCode,
        ttl,
      };
    }
    const ttl = await this.redis.ttl(`invitation:${inviteCode}`);
    return {
      code: inviteCode,
      ttl, // 5 minutes
    };
  }

  async findServiceSpotByInviteCode(code: string) {
    const inviteSession = `invitation:${code}`;
    const serviceSpotId = await this.redis.get(inviteSession);
    if (!serviceSpotId) {
      return null;
    }
    return +serviceSpotId;
  }

  async mapToDto(serviceSpot: ServiceSpot) {
    const serviceSpotDto = new ServiceSpotDto();
    serviceSpotDto.id = serviceSpot.id;
    serviceSpotDto.name = serviceSpot.name;
    serviceSpotDto.setAddress({
      addressLine1: serviceSpot.addressLine1,
      addressLine2: serviceSpot.addressLine2,
      subDistrict: serviceSpot.subDistrict,
    });
    serviceSpotDto.coords = {
      lat: serviceSpot.coords.coordinates[1],
      lng: serviceSpot.coords.coordinates[0],
    };
    serviceSpotDto.approved = serviceSpot.approved;
    serviceSpotDto.serviceSpotOwner = await this.driversService.findOneWithInfo(
      serviceSpot.serviceSpotOwnerId,
    );
    serviceSpotDto.priceRateImageUrl = await this.getImageUrl(serviceSpot.id, 'price_rate_image');

    return instanceToPlain(serviceSpotDto, {
      excludePrefixes: ['_'],
    }) as ServiceSpotDto;
  }
}
