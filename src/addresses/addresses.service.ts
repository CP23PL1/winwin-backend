import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { District } from './entities/district.entity';
import { ObjectLiteral, Repository } from 'typeorm';
import { SubDistrict } from './entities/sub-district.entity';
import { Province } from './entities/province.entity';
import { PaginateConfig, PaginateQuery, paginate } from 'nestjs-paginate';

@Injectable()
export class AddressesService {
  constructor(
    @InjectRepository(SubDistrict)
    private readonly subDistrictRepo: Repository<SubDistrict>,
    @InjectRepository(District)
    private readonly districtRepo: Repository<District>,
    @InjectRepository(Province)
    private readonly provinceRepo: Repository<Province>,
  ) {}

  findAllProvinces(query: PaginateQuery, config: PaginateConfig<ObjectLiteral>) {
    return paginate(query, this.provinceRepo, config);
  }

  findAllDistricts(query: PaginateQuery, config: PaginateConfig<ObjectLiteral>) {
    return paginate(query, this.districtRepo, config);
  }

  findAllSubDistricts(query: PaginateQuery, config: PaginateConfig<ObjectLiteral>) {
    return paginate(query, this.subDistrictRepo, config);
  }
}
