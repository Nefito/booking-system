import { Module } from '@nestjs/common';

import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { PrismaService } from '../prisma.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@Module({
  // Controllers: Handle HTTP requests
  controllers: [AuthController],

  // Providers: Services, utilities, etc.
  providers: [
    AuthService, // Business logic
    PrismaService, // Database access
    JwtAuthGuard, // Make guard available for other modules
  ],

  // Exports: What other modules can use
  exports: [AuthService, JwtAuthGuard], // Export AuthService and JwtAuthGuard for other modules
})
export class AuthModule {}
