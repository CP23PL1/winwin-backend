import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { AddressesService } from './addresses.service';
import { Paginate, PaginateConfig, PaginateQuery, PaginatedSwaggerDocs } from 'nestjs-paginate';
import { Province } from './entities/province.entity';
import { ObjectLiteral } from 'typeorm';
import { District } from './entities/district.entity';
import { SubDistrict } from './entities/sub-district.entity';

const addressPaginateConfig: PaginateConfig<ObjectLiteral> = {
  sortableColumns: ['id', 'nameTH'],
  searchableColumns: ['id', 'nameTH'],
  defaultSortBy: [['id', 'ASC']],
  relativePath: true,
};

@ApiTags('Addresses')
@ApiBearerAuth()
@Controller('addresses')
export class AddressesController {
  constructor(private readonly addressesService: AddressesService) {}

  @Get('/provinces')
  @PaginatedSwaggerDocs(Province, addressPaginateConfig)
  findAllProvinces(@Paginate() query: PaginateQuery) {
    return this.addressesService.findAllProvinces(query, addressPaginateConfig);
  }

  @Get('/districts')
  @PaginatedSwaggerDocs(District, addressPaginateConfig)
  findAllDistricts(@Paginate() query: PaginateQuery) {
    return this.addressesService.findAllDistricts(query, addressPaginateConfig);
  }

  @Get('/sub-districts')
  @PaginatedSwaggerDocs(SubDistrict, addressPaginateConfig)
  findAllSubDistricts(@Paginate() query: PaginateQuery) {
    return this.addressesService.findAllSubDistricts(query, addressPaginateConfig);
  }

  @Get('/:provinceId/districts')
  @PaginatedSwaggerDocs(District, addressPaginateConfig)
  async findAllDistrictsInProvince(
    @Paginate() query: PaginateQuery,
    @Param('provinceId', ParseIntPipe) provinceId: number,
  ) {
    return this.addressesService.findAllDistricts(query, {
      ...addressPaginateConfig,
      where: { province: { id: provinceId } },
    });
  }

  @Get('/:provinceId/districts/:districtId/sub-districts')
  @PaginatedSwaggerDocs(SubDistrict, addressPaginateConfig)
  async findAllSubDistrictsInDistrict(
    @Paginate() query: PaginateQuery,
    @Param('provinceId', ParseIntPipe) provinceId: number,
    @Param('districtId', ParseIntPipe) districtId: number,
  ) {
    return this.addressesService.findAllSubDistricts(query, {
      ...addressPaginateConfig,
      where: {
        province: {
          id: provinceId,
        },
        district: {
          id: districtId,
        },
      },
    });
  }
}
