import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsOptional, IsSemVer, IsString, validateSync } from 'class-validator';

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
