import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('test-database')
  async testDatabase() {
    return this.appService.testDatabase();
  }

  @Get('health')
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
    };
  }

  @Get('debug-db')
  debugDatabase() {
    const url = process.env.DATABASE_URL;
    // Mask password for security
    const maskedUrl = url?.replace(/:[^:@]+@/, ':****@');
    return {
      hasUrl: !!url,
      urlLength: url?.length,
      maskedUrl,
      // Extract database name from URL
      dbName: url?.match(/\/([^?]+)/)?.[1],
    };
  }
}
