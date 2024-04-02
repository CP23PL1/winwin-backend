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
  static NotFound(serviceSpotId: ServiceSpot['id']): ExceptionPayload {
    return {
      code: 'service_spot_not_found',
      message: `Service spot with id ${serviceSpotId} not found`,
    };
  }
  static SubDistrictNotFound(subDistrictId: SubDistrict['id']): ExceptionPayload {
    return {
      code: 'sub_district_not_found',
      message: `Sub district with id ${subDistrictId} not found`,
    };
  }
  static readonly NotOwned: ExceptionPayload = {
    code: 'service_spot_not_owned',
    message: 'Service spot not owned by user',
  };
  static readonly SelfRemove: ExceptionPayload = {
    code: 'service_spot_self_remove',
    message: 'You can not remove service spot owned by yourself',
  };
  static readonly DriverNotInServiceSpot: ExceptionPayload = {
    code: 'driver_not_in_service_spot',
    message: 'Driver not in service spot',
  };
}
