import { Coordinate } from 'src/shared/dtos/coordinate.dto';

export class CreateDriveRequestDto {
  origin: Coordinate;
  destination: Coordinate;
}
