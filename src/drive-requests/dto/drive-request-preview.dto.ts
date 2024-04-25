import { RouteDto } from 'src/externals/google-maps/dtos/route.dto';

export class DriveRequestPreviewDto extends RouteDto {
  priceByDistance: number;
  total: number;
  serviceCharge: number;
}
