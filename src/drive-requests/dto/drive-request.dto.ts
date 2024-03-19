import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { User } from 'src/users/entities/user.entity';
import { DriveRequestStatus } from '../entities/drive-request.entity';

export class DriveRequestDto {
  id: number;
  user: User;
  driver: DriverDto;
  origin: Coordinate;
  destination: Coordinate;
  status: DriveRequestStatus;
  refCode: string;
  createdAt: Date;
  updatedAt: Date;
}
