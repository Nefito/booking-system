import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';

@Module({
  // Controllers: Handle HTTP requests
  controllers: [AuthController],

  // Providers: Services, utilities, etc.
  providers: [
    AuthService, // Business logic
    PrismaService, // Database access
  ],

  // Exports: What other modules can use
  exports: [AuthService], // Other modules might need AuthService
})
export class AuthModule {}
