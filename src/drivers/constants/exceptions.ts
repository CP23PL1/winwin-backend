import { ExceptionPayload } from 'src/shared/dtos/exception-payload.dto';

export class DriverException {
  static readonly UnregisteredDriver: ExceptionPayload = {
    code: 'unregistered_driver',
    message: 'This phone number is not registered as a driver',
  };
  static readonly InvalidInviteCode: ExceptionPayload = {
    code: 'invalid_invite_code',
    message: 'Invalid invite code or expired',
  };
  static readonly DriveRequestNotFound: ExceptionPayload = {
    code: 'drive_request_not_found',
    message: 'Drive request not found',
  };
  static readonly DriverAlreadyInServiceSpot: ExceptionPayload = {
    code: 'driver_already_in_service_spot',
    message: 'Driver already in service spot',
  };
  static readonly CannotJoinOwnedServiceSpot: ExceptionPayload = {
    code: 'cannot_join_owned_service_spot',
    message: 'Cannot join service spot owned by yourself',
  };
}
