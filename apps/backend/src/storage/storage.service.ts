import { Injectable, BadRequestException } from '@nestjs/common';
import { BlobService } from './blob.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

export interface UploadFileResult {
  url: string;
  fileName: string;
  size: number;
  mimeType: string;
}

@Injectable()
export class StorageService {
  constructor(private blobService: BlobService) {}

  /**
   * Upload file to cloud storage
   *
   * FLOW:
   * 1. Validate file exists
   * 2. Validate file size
   * 3. Validate file type
   * 4. Upload to blob storage
   * 5. Return upload result
   */
  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'resources'
  ): Promise<UploadFileResult> {
    // STEP 1: Validate file exists
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    // STEP 2: Validate file size
    if (file.size > MAX_FILE_SIZE) {
      throw new BadRequestException(`File size exceeds ${MAX_FILE_SIZE / 1024 / 1024}MB limit`);
    }

    // STEP 3: Validate file type
    if (!ALLOWED_MIME_TYPES.includes(file.mimetype)) {
      throw new BadRequestException(
        `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
      );
    }

    // STEP 4: Upload to blob storage
    try {
      const url = await this.blobService.uploadFile(file.buffer, folder, file.mimetype);

      // STEP 5: Return upload result
      return {
        url,
        fileName: file.originalname,
        size: file.size,
        mimeType: file.mimetype,
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to upload file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  /**
   * Delete file from cloud storage
   *
   * FLOW:
   * 1. Validate URL provided
   * 2. Validate URL is a blob URL
   * 3. Delete from blob storage
   * 4. Return success message
   */
  async deleteFile(fileUrl: string): Promise<{ message: string }> {
    // STEP 1: Validate URL provided
    if (!fileUrl) {
      throw new BadRequestException('File URL is required');
    }

    // STEP 2: Validate URL is a blob URL
    if (!this.blobService.isBlobUrl(fileUrl)) {
      throw new BadRequestException('Can only delete Vercel Blob URLs');
    }

    // STEP 3: Delete from blob storage
    try {
      await this.blobService.deleteFile(fileUrl);

      // STEP 4: Return success message
      return {
        message: 'File deleted successfully',
      };
    } catch (error) {
      throw new BadRequestException(
        `Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }
}
