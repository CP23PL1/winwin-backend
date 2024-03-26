import { HttpService } from '@nestjs/axios';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { GetRoutesResponseDto } from './dtos/get-routes-response.dto';
import { Coordinate } from 'src/shared/dtos/coordinate.dto';
import {
  GeocodeResponse,
  GeocodeResponseData,
  GeocodeResult,
} from '@googlemaps/google-maps-services-js';

@Injectable()
export class GoogleApiService {
  private readonly logger = new Logger(GoogleApiService.name);
  private routesApiKey: string;
  private placesApiKey: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.routesApiKey = this.configService.get<string>('ROUTES_API_KEY');
    this.placesApiKey = this.configService.get<string>('PLACES_API_KEY');
  }

  async getRoutes(origin: Coordinate, destination: Coordinate) {
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

  async getReverseGeocode(
    coordinate: Coordinate,
    resultType: string | undefined = 'street_address',
  ) {
    const observable = this.httpService
      .get<GeocodeResponseData>('https://maps.googleapis.com/maps/api/geocode/json', {
        params: {
          latlng: `${coordinate.lat},${coordinate.lng}`,
          key: this.placesApiKey,
          result_type: resultType,
          region: 'th',
          language: 'th',
        },
      })
      .pipe(
        catchError((error: AxiosError) => {
          throw new Error(JSON.stringify(error.response.data));
        }),
      );
    const result = await firstValueFrom(observable);
    return result.data.results[0];
  }
}
