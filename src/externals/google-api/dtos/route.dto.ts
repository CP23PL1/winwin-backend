export class RouteDto {
  duration: string;
  distanceMeters: number;
  polyline: {
    encodedPolyline: string;
  };
}
