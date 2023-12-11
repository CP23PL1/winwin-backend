import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { Logger, ValidationPipe } from '@nestjs/common';
import { Environment } from './config/env.validation';
import { HttpExceptionFilter } from './shared/filters/http-exception.filter';
import { validationFailedExceptionFactory } from './shared/exceptions/validation-failed.exception';

async function bootstrap() {
  const logger = new Logger('Bootstrap');
  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());

  // Configurations
  const configService = app.get(ConfigService);
  const API_VERSION = configService.get<string>('API_VERSION');
  const API_VERSION_PREFIX = `v${API_VERSION.split('.')[0]}`;
  const HOST = configService.get<string>('HOST') || '0.0.0.0';
  const PORT = configService.get<number>('PORT') || 3000;
  const ENV = configService.get<Environment>('NODE_ENV');

  // App settings
  app.setGlobalPrefix(API_VERSION_PREFIX);
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
    .addServer('https://capstone23.sit.kmutt.ac.th/pl1', 'Production server')
    .addBearerAuth()
    .setVersion(API_VERSION)
    .build();
  const document = SwaggerModule.createDocument(app, documentBuilder);
  SwaggerModule.setup('openapi', app, document);

  logger.debug(`Server running on ${HOST}:${PORT} 🚀`);
  logger.debug(`Environment: ${ENV}`);
  logger.debug(`Api Version: ${API_VERSION}`);

  await app.listen(PORT, HOST);
}
bootstrap();
