import { ExceptionPayload } from 'src/shared/dtos/exception-payload.dto';

export class DriverException {
  static readonly UnregisteredDriver: ExceptionPayload = {
    code: 'unregistered_driver',
    message: 'This phone number is not registered as a driver',
  };
}
