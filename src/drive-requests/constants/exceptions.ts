import { ExceptionPayload } from 'src/shared/dtos/exception-payload.dto';

export class DriveRequestException {
  static readonly NotFound: ExceptionPayload = {
    code: 'drive_request_not_found',
    message: 'Drive request not found',
  };
}
