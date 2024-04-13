import { plainToInstance } from 'class-transformer';
import {
  IsEnum,
  IsNumber,
  IsOptional,
  IsSemVer,
  IsString,
  IsUrl,
  validateSync,
} from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment;

  @IsString()
  @IsOptional()
  HOST?: string;

  @IsNumber()
  @IsOptional()
  PORT?: number;

  @IsString()
  AUTH0_DOMAIN: string;

  @IsString()
  AUTH0_AUDIENCE: string;

  @IsSemVer()
  API_VERSION: string;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  DB_PORT: number;

  @IsString()
  DB_USER: string;

  @IsString()
  DB_PASSWORD: string;

  @IsString()
  DB_NAME: string;

  @IsString()
  DRIVERS_MOCKUP_API_URL: string;

  @IsString()
  DRIVERS_MOCKUP_API_KEY: string;

  @IsString()
  GOOGLE_APPLICATION_CREDENTIALS: string;

  @IsString()
  @IsUrl({ protocols: ['gs'] })
  FIREBASE_STORAGE_BUCKET: string;

  @IsString()
  REDIS_HOST: string;

  @IsNumber()
  REDIS_PORT: number;

  @IsString()
  DRIVER_APP_AUTH0_CLIENT_ID: string;

  @IsString()
  PASSENGER_APP_AUTH0_CLIENT_ID: string;
}

export function validate(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const error = validateSync(validatedConfig, { skipMissingProperties: false });

  if (error.length > 0) {
    throw new Error(error.toString());
  }

  return validatedConfig;
}
