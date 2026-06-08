import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));
  app.enableCors();
  await app.listen(3001);
  console.log('🚀 Finance Tracker API running on http://localhost:3001');
  console.log('📚 Swagger docs available at http://localhost:3001/api/docs');
}
bootstrap();