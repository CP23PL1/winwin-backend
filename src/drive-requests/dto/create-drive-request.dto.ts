import { PlaceData } from '@googlemaps/google-maps-services-js';

export class CreateDriveRequestDto {
  origin: Pick<PlaceData, 'name' | 'geometry' | 'place_id'>;
  destination: Pick<PlaceData, 'name' | 'geometry' | 'place_id'>;
  route: {
    duration: string;
    distanceMeters: number;
    polyline: {
      encodedPolyline: string;
    };
  };
}
