import { RouteDto } from 'src/externals/google-api/dtos/route.dto';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';

export class RequestDriveDto {
  origin: Coordinate;
  destination: Coordinate;
  route: RouteDto;
}
