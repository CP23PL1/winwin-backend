import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { validate as envValidation } from './config/env.validation';
import { ServiceSpotsModule } from './service-spots/service-spots.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { Auth0JwtGuard } from './authorization/auth0-jwt.guard';
import { AuthorizationModule } from './authorization/authorization.module';
import { DriversModule } from './drivers/drivers.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    ServiceSpotsModule,
    AuthorizationModule,
    DriversModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: Auth0JwtGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
