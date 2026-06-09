import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS
  app.enableCors({
    origin: ['http://localhost:5173', 'http://localhost:3000'],
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // Swagger documentation
  const config = new DocumentBuilder()
    .setTitle('Finance Tracker API')
    .setDescription('Enterprise Finance Tracker API with JWT authentication')
    .setVersion('2.0.0')
    .addBearerAuth()
    .addTag('auth', 'Authentication endpoints')
    .addTag('categories', 'Category management')
    .addTag('wallets', 'Wallet management')
    .addTag('transactions', 'Transaction management')
    .addTag('budgets', 'Budget management')
    .addTag('recurring', 'Recurring transaction management')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Finance Tracker API running on http://localhost:${port}`);
  console.log(`📚 Swagger docs available at http://localhost:${port}/api`);
}

bootstrap();