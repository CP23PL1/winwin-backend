import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe, VersioningType } from '@nestjs/common';
import { Environment } from './common/config/env.validation';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { validationFailedExceptionFactory } from './shared/exceptions/validation-failed.exception';
import multipart from '@fastify/multipart';
import { RedisIoAdapter } from './shared/adapters/redis-io.adapter';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Configurations
  const configService = app.get(ConfigService);
  const API_VERSION = configService.get<string>('API_VERSION');
  const HOST = configService.get<string>('HOST') || '0.0.0.0';
  const PORT = configService.get<number>('PORT') || 3000;
  const ENV = configService.get<Environment>('NODE_ENV');

  // App settings
  app.enableVersioning({
    type: VersioningType.URI,
    defaultVersion: API_VERSION.split('.')[0],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      validationError: { target: false },
      exceptionFactory: validationFailedExceptionFactory,
    }),
  );
  app.useGlobalFilters(new HttpExceptionFilter());
  app.enableCors({
    origin: '*',
  });
  // API Documentation
  const documentBuilder = new DocumentBuilder()
    .setTitle('WinWin API')
    .setDescription('An application programming interface for Motorcycle Taxi')
    .addServer(`http://localhost:${PORT}`, 'Local server')
    .addServer(`http://192.168.1.33:${PORT}`, 'Test server')
    .addServer('https://capstone23.sit.kmutt.ac.th/pl1', 'Production server')
    .addBearerAuth()
    .setVersion(API_VERSION)
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('openapi', app, document);

  const redisIoAdapter = new RedisIoAdapter(app);
  const REDIS_HOST = configService.get<string>('REDIS_HOST');
  const REDIS_PORT = configService.get<number>('REDIS_PORT');
  await redisIoAdapter.connectToRedis(REDIS_HOST, REDIS_PORT);
  app.useWebSocketAdapter(redisIoAdapter);

  await app.register(multipart, {
    logLevel: 'debug',
    limits: {
      fileSize: 5000000, // 5MB
    },
  });
  await app.listen(PORT, HOST);
  logger.debug(`Server running on ${HOST}:${PORT} 🚀`);
  logger.debug(`Environment: ${ENV}`);
  logger.debug(`Api Version: ${API_VERSION}`);
}

bootstrap();
