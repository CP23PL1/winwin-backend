import { Module } from '@nestjs/common';
import { DriversMockupApiService } from './drivers-mockup-api.service';
import { HttpModule } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    HttpModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        baseURL: configService.get<string>('DRIVERS_MOCKUP_API_URL'),
        headers: {
          'X-API-KEY': configService.get<string>('DRIVERS_MOCKUP_API_KEY'),
        },
      }),
    }),
  ],
  providers: [DriversMockupApiService],
  exports: [DriversMockupApiService],
})
export class DriversMockupApiModule {}
