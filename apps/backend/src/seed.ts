import { config } from 'dotenv';
import { resolve } from 'path';
import { existsSync } from 'fs';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { seedResources } from './resources/seed/resources.seed';

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

// Initialize PrismaClient with adapter (same as PrismaService)
const connectionUrl = process.env.DATABASE_URL;

if (!connectionUrl) {
  throw new Error('DATABASE_URL environment variable is not set');
}

let pool: Pool;
try {
  const url = new URL(connectionUrl);
  const dbName = url.pathname.slice(1).split('?')[0];

  pool = new Pool({
    host: url.hostname,
    port: parseInt(url.port) || 5432,
    user: url.username,
    password: url.password,
    database: dbName || 'neondb',
    ssl: {
      rejectUnauthorized: false,
    },
  });
} catch (error) {
  pool = new Pool({
    connectionString: connectionUrl,
  });
}

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting database seed...');

  await seedResources(prisma);

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    await pool.end();
  });
