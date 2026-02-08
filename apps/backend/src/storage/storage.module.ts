import { Module } from '@nestjs/common';

import { AuthModule } from '../auth/auth.module';
import { StorageController } from './storage.controller';
import { StorageService } from './storage.service';
import { BlobService } from './blob.service';

@Module({
  imports: [AuthModule],
  controllers: [StorageController],
  providers: [StorageService, BlobService],
  exports: [StorageService, BlobService], // Export for use in other modules (e.g., ResourcesModule)
})
export class StorageModule {}
