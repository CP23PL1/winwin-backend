import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { User } from 'src/users/entities/user.entity';

export class CreateDriveRequestDto {
  user: User;
  origin: Coordinate;
  destination: Coordinate;
  route: {
    duration: string;
    distanceMeters: number;
    polyline: {
      encodedPolyline: string;
    };
  };
}
