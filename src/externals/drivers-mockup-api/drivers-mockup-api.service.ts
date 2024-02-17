import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { AxiosError } from 'axios';
import { catchError, firstValueFrom } from 'rxjs';
import { DriverDto } from './dtos/driver.dto';

@Injectable()
export class DriversMockupApiService {
  constructor(private readonly http: HttpService) {}

  async getDriver(identifier: string, identify_by: 'national_id' | 'phone_number' | 'id') {
    const observable = this.http
      .get<DriverDto>(`/drivers/${identifier}`, { params: { identify_by } })
      .pipe(
        catchError((error: AxiosError) => {
          throw new Error(error.message);
        }),
      );
    const { data } = await firstValueFrom(observable);
    return data;
  }

  async getDrivers(): Promise<DriverDto[]> {
    const observable = this.http.get<DriverDto[]>('/drivers').pipe(
      catchError((error: AxiosError) => {
        throw new Error(error.message);
      }),
    );
    const { data } = await firstValueFrom(observable);
    return data;
  }
}
