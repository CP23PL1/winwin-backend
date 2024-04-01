import { ExceptionPayload } from 'src/shared/dtos/exception-payload.dto';
import { ServiceSpot } from '../entities/service-spot.entity';
import { SubDistrict } from 'src/addresses/entities/sub-district.entity';

export class ServiceSpotException {
  static AlreadyExist(name: ServiceSpot['name']): ExceptionPayload {
    return {
      code: 'service_spot_already_exist',
      message: `Service spot with name ${name}  already exists`,
    };
  }
  static SubDistrictNotFound(subDistrictId: SubDistrict['id']): ExceptionPayload {
    return {
      code: 'sub_district_not_found',
      message: `Sub district with id ${subDistrictId} not found`,
    };
  }
}
