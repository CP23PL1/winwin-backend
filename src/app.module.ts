import { ClassSerializerInterceptor, Module } from '@nestjs/common';

import { ConfigModule, ConfigService } from '@nestjs/config';
import { validate as envValidation } from './config/env.validation';
import { ServiceSpotsModule } from './service-spots/service-spots.module';
import { APP_GUARD, APP_INTERCEPTOR } from '@nestjs/core';
import { TypeOrmModule } from '@nestjs/typeorm';
import { dataSourceOptions } from './db/data-source';
import { Auth0JwtGuard } from './authorization/providers/auth0/auth0-jwt.guard';
import { AddressesModule } from './addresses/addresses.module';
import { DriversMockupApiModule } from './externals/drivers-mockup-api/drivers-mockup-api.module';
import { DriversModule } from './drivers/drivers.module';
import { AuthorizationModule } from './authorization/authorization.module';
import { FirebaseModule } from 'nestjs-firebase';
import { UsersModule } from './users/users.module';
import { DriveRequestsModule } from './drive-requests/drive-requests.module';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { RedisModule } from '@nestjs-modules/ioredis';
import { Auth0RolesGuard } from './authorization/providers/auth0/auth0-roles.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: envValidation,
    }),
    FirebaseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        googleApplicationCredential: configService.get<string>('GOOGLE_APPLICATION_CREDENTIALS'),
        storageBucket: configService.get<string>('FIREBASE_STORAGE_BUCKET'),
      }),
    }),
    RedisModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'single',
        url: `redis://${configService.get<string>('REDIS_HOST')}:${configService.get<number>(
          'REDIS_PORT',
        )}`,
      }),
    }),
    CacheModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        store: redisStore,
        host: configService.get<string>('REDIS_HOST'),
        port: configService.get<number>('REDIS_PORT'),
        ttl: configService.get<number>('CACHE_TTL'),
      }),
    }),
    TypeOrmModule.forRoot(dataSourceOptions),
    DriversModule,
    DriversMockupApiModule,
    ServiceSpotsModule,
    AddressesModule,
    AuthorizationModule,
    UsersModule,
    DriveRequestsModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: Auth0JwtGuard,
    },
    {
      provide: APP_GUARD,
      useClass: Auth0RolesGuard,
    },
    {
      provide: APP_INTERCEPTOR,
      useClass: ClassSerializerInterceptor,
    },
  ],
})
export class AppModule {}
