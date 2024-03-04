import { DriveRequestStatus } from '../entities/drive-request.entity';

export class UpdateDriveRequestDto {
  id: number;
  status: DriveRequestStatus;
}
