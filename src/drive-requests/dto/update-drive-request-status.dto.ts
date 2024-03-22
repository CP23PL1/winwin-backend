import { IsEnum, IsPositive } from 'class-validator';
import { DriveRequestStatus } from '../entities/drive-request.entity';

export class UpdateDriveRequestStatusDto {
  @IsPositive()
  driveRequestId: number;

  @IsEnum(DriveRequestStatus)
  status: DriveRequestStatus;
}
