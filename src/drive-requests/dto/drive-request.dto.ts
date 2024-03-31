import { DriverDto } from 'src/drivers/dtos/driver.dto';
import { User } from 'src/users/entities/user.entity';
import { DriveRequestStatus } from '../entities/drive-request.entity';
import { Waypoint } from 'src/shared/dtos/place.dto';
import { ApiProperty } from '@nestjs/swagger';

export class DriveRequestDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  user: User;

  @ApiProperty({
    type: () => DriverDto,
  })
  driver: DriverDto;

  @ApiProperty({
    type: () => Waypoint,
  })
  origin: Waypoint;

  @ApiProperty({
    type: () => Waypoint,
  })
  destination: Waypoint;

  @ApiProperty()
  status: DriveRequestStatus;

  @ApiProperty()
  createdAt: string;
}
