import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { User } from 'src/users/entities/user.entity';
import { DriveRequestStatus } from '../entities/drive-request.entity';
import { Waypoint } from 'src/shared/dtos/place.dto';

export class DriveRequestDto {
  id: string;
  user: User;
  driver: DriverDto;
  origin: Waypoint;
  destination: Waypoint;
  status: DriveRequestStatus;
  createdAt: Date;
}
