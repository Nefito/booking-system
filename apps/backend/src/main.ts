import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { json, urlencoded } from 'express';
import { AppModule } from './app.module';

// Load .env file from the backend directory
// Try multiple possible paths
const envPaths = [
  resolve(__dirname, '../../.env'), // From dist/src (compiled)
  resolve(__dirname, '../.env'), // From src (development)
  resolve(process.cwd(), '.env'), // From project root
];

for (const envPath of envPaths) {
  if (existsSync(envPath)) {
    config({ path: envPath });
    break;
  }
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Increase body size limit (default is 100kb)
  // Set to 10MB to handle larger resource data (e.g., long descriptions, image URLs)
  app.use(json({ limit: '10mb' }));
  app.use(urlencoded({ limit: '10mb', extended: true }));

  // Enable CORS for frontend
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
    })
  );

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`🚀 Backend server running on http://localhost:${port}`);
}

bootstrap();
