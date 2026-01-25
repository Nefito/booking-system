import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { Reflector } from '@nestjs/core';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaService } from './prisma.service';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/guards/jwt-auth.guard';

@Module({
  // Import AuthModule to use its controllers and services
  imports: [AuthModule],

  controllers: [AppController],

  providers: [
    AppService,
    PrismaService,
    Reflector, // Needed for reading decorator metadata in guards

    // OPTIONAL: Make JWT guard global
    // Use @Public() to make specific routes public
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
  exports: [PrismaService],
})
export class AppModule {}
