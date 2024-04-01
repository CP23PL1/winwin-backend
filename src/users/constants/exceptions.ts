import { ExceptionPayload } from 'src/shared/dtos/exception-payload.dto';

export class UserException {
  static DriveRequestNotFound: ExceptionPayload = {
    code: 'drive_request_not_found',
    message: 'Drive request not found',
  };
}
