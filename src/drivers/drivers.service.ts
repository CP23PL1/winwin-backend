import { Injectable } from '@nestjs/common';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';

@Injectable()
export class DriversService {
  constructor(private readonly driversMockupApi: DriversMockupApiService) {}

  verify(phoneNumber: string) {
    return this.driversMockupApi.getDriver(phoneNumber, 'phone_number');
  }
}
