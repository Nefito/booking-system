import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class AppService {
  constructor(private prisma: PrismaService) {}

  getHello(): string {
    return 'Hello from Booking System API!';
  }

  async testDatabase() {
    try {
      const count = await this.prisma.role.count();
      return {
        connected: true,
        message: 'Database connection successful!',
        rolesCount: count,
      };
    } catch (error) {
      return {
        connected: false,
        error: error.message,
      };
    }
  }
}
