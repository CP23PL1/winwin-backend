import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { validate as envValidation } from './config/env.validation';
import { ServiceSpotsModule } from './service-spots/service-spots.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    ServiceSpotsModule,
  ],
})
export class AppModule {}
