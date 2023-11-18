import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/exceptions/global-exception.filter';
import { Environment } from './config/env.validation';
import * as fs from 'fs';

async function bootstrap() {
  const logger = new Logger('Bootstrap', { timestamp: false });
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Configurations
  const configService = app.get(ConfigService);
  const API_VERSION = configService.get<string>('API_VERSION');
  const HOST = configService.get<string>('HOST') || '0.0.0.0';
  const PORT = configService.get<number>('PORT') || 3000;
  const ENV = configService.get<Environment>('NODE_ENV');

  // App settings
  app.setGlobalPrefix(API_VERSION);
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  app.useGlobalFilters(new GlobalExceptionFilter());

  // API Documentation
  const documentBuilder = new DocumentBuilder()
    .setTitle('WinWin API Documentation')
    .setDescription('An application for Motorcycle Taxi')
    .setVersion(API_VERSION)
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup(API_VERSION, app, document);

  // Generate OpenAPI JSON file for production
  if (ENV === Environment.Production) {
    logger.debug('Generate OpenAPI JSON file');
    fs.writeFileSync('openapi.json', JSON.stringify(document, null, 2), { encoding: 'utf-8' });
  }

  logger.debug(`Server running on ${HOST}:${PORT} 🚀`);
  logger.debug(`Environment: ${ENV}`);
  logger.debug(`Api Version: ${API_VERSION}`);

  await app.listen(PORT, HOST);
}
bootstrap();
