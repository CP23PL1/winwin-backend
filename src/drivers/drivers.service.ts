import { Injectable } from '@nestjs/common';
import { DriversMockupApiService } from 'src/externals/drivers-mockup-api/drivers-mockup-api.service';
import { AdditionalDriverDto } from 'src/externals/drivers-mockup-api/dtos/driver.dto';
import { ServiceSpotsService } from 'src/service-spots/service-spots.service';

@Injectable()
export class DriversService {
  constructor(
    private readonly serviceSpotsService: ServiceSpotsService,
    private readonly driversMockupApi: DriversMockupApiService,
  ) {}

  verify(phoneNumber: string) {
    return this.driversMockupApi.getDriver(phoneNumber, 'phone_number');
  }

  async getDriverInfoWithAdditionalData(phoneNumber: string): Promise<AdditionalDriverDto> {
    const driver = await this.driversMockupApi.getDriver(phoneNumber, 'phone_number');

    if (!driver) {
      return null;
    }

    const serviceSpot = await this.serviceSpotsService.findDriverServiceSpotByDriverId(driver.id, {
      serviceSpot: {
        id: true,
        name: true,
      },
    });

    return {
      ...driver,
      serviceSpot,
    };
  }
}
