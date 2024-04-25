import { Client } from '@googlemaps/google-maps-services-js';
import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import { GetRoutesResponseDto } from './dtos/get-routes-response.dto';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';

@Injectable()
export class GoogleMapsService extends Client {
  routesApiKey: string;
  placesApiKey: string;

  constructor(configService: ConfigService, private httpService: HttpService) {
    super();
    this.placesApiKey = configService.get<string>('PLACES_API_KEY');
    this.routesApiKey = configService.get<string>('ROUTES_API_KEY');
  }

  async computeRoutes(origin: Coordinate, destination: Coordinate) {
    const data = {
      origin: {
        location: {
          latLng: {
            latitude: origin.lat,
            longitude: origin.lng,
          },
        },
      },
      destination: {
        location: {
          latLng: {
            latitude: destination.lat,
            longitude: destination.lng,
          },
        },
      },
      travelMode: 'TWO_WHEELER',
      languageCode: 'th-TH',
      units: 'METRIC',
    };
    const observable = this.httpService
      .post<GetRoutesResponseDto>(
        'https://routes.googleapis.com/directions/v2:computeRoutes',
        data,
        {
          headers: {
            'X-Goog-Api-Key': this.routesApiKey,
            'X-Goog-FieldMask':
              'routes.duration,routes.distanceMeters,routes.polyline.encodedPolyline',
          },
        },
      )
      .pipe(
        catchError((error: AxiosError) => {
          throw new Error(JSON.stringify(error.response.data));
        }),
      );
    const result = await firstValueFrom(observable);
    return result.data;
  }
}
