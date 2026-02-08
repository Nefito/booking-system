import { Module } from '@nestjs/common';

import { ResourcesController } from './resources.controller';
import { ResourcesService } from './resources.service';
import { PrismaService } from '../prisma.service';
import { AuthModule } from '../auth/auth.module';
import { StorageModule } from '../storage/storage.module';

@Module({
  imports: [AuthModule, StorageModule],
  controllers: [ResourcesController],
  providers: [ResourcesService, PrismaService],
  exports: [ResourcesService], // Export if other modules need it
})
export class ResourcesModule {}
