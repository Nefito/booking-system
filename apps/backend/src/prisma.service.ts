import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  private pool: Pool;

  constructor() {
    const connectionUrl = process.env.DATABASE_URL;

    if (!connectionUrl) {
      throw new Error('DATABASE_URL environment variable is not set');
    }

    // Parse the connection string to extract components
    let pool: Pool;
    try {
      const url = new URL(connectionUrl);
      const dbName = url.pathname.slice(1).split('?')[0]; // Remove leading / and query params

      // Create pool with explicit database name to avoid defaulting to username
      pool = new Pool({
        host: url.hostname,
        port: parseInt(url.port) || 5432,
        user: url.username,
        password: url.password,
        database: dbName || 'neondb',
        ssl: {
          rejectUnauthorized: false, // Required for Neon
        },
      });
    } catch (error) {
      // Fallback: use connectionString if URL parsing fails
      pool = new Pool({
        connectionString: connectionUrl,
      });
    }

    const adapter = new PrismaPg(pool);

    super({
      adapter,
    });

    // Assign to this.pool after super() call
    this.pool = pool;
  }

  async onModuleInit() {
    await this.$connect();
  }

  async onModuleDestroy() {
    await this.$disconnect();
    await this.pool.end();
  }
}
