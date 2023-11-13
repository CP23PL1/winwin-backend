import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './filters/exceptions/global-exception.filter';

const API_VERSION = 'v1';

async function bootstrap() {
  const app = await NestFactory.create<NestFastifyApplication>(
    AppModule,
    new FastifyAdapter({
      logger: true,
    }),
  );
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

  // Server Configurations
  const configService = app.get(ConfigService);
  const HOST = configService.get<string>('HOST') || '0.0.0.0';
  const PORT = configService.get<number>('PORT') || 3000;

  await app.listen(PORT, HOST);
}
bootstrap();
