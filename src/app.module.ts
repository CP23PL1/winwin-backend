import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { validate as envValidation } from './config/env.validation';
import { ServiceSpotsModule } from './service-spots/service-spots.module';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ServiceSpotsModule,
  ],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
