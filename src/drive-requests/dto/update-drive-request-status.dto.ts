import { IsEnum, IsString } from 'class-validator';
import { DriveRequestSessionStatus } from '../stores/dto/drive-request-session.dto';

export class UpdateDriveRequestStatusDto {
  @IsString()
  driveRequestSid: string;

  @IsEnum(DriveRequestSessionStatus)
  status: DriveRequestSessionStatus;
}
