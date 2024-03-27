import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { DriverInfoDto } from './dtos/driver-info.dto';
import { GetDriversQuery } from './dtos/get-drivers-query.dto';

@Injectable()
export class DriversMockupApiService {
  constructor(private readonly http: HttpService) {}

  async getDriver(identifier: string, identify_by: 'national_id' | 'phone_number' | 'id') {
    const observable = this.http
      .get<DriverInfoDto>(`/drivers/${identifier}`, { params: { identify_by } })
      .pipe(
        catchError((error: AxiosError) => {
          throw new Error(error.message);
        }),
      );
    const { data } = await firstValueFrom(observable);
    return data;
  }

  async getDrivers(query?: GetDriversQuery): Promise<DriverInfoDto[]> {
    const observable = this.http.get<DriverInfoDto[]>('/drivers', { params: query }).pipe(
      catchError((error: AxiosError) => {
        throw new Error(error.message);
      }),
    );
    const { data } = await firstValueFrom(observable);
    return data;
  }
}
