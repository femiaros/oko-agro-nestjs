import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Enable CORS
  app.enableCors({ origin: '*' });

  // Increase payload size limit (e.g., 50MB)
  app.use(json({ limit: '50mb' }));
  app.use(urlencoded({ extended: true, limit: '50mb' }));

  // Enable global validation
  app.useGlobalPipes(new ValidationPipe({
    whitelist: true, // strips unknown fields
    forbidNonWhitelisted: true, // throws error if extra fields present
    transform: true, // auto-transform payloads to DTO classes
  }));

  await app.listen(process.env.PORT ? parseInt(process.env.PORT, 10) : 3000, '0.0.0.0');
}
bootstrap();
