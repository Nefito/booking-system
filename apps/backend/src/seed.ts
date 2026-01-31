import { PrismaClient } from '@prisma/client';
import { seedResources } from './resources/seed/resources.seed';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  await seedResources();

  console.log('Database seed completed!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
