import { Injectable } from '@nestjs/common';
import { put, del } from '@vercel/blob';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class BlobService {
  private token: string;

  constructor() {
    this.token = process.env.BLOB_READ_WRITE_TOKEN || '';
    if (!this.token) {
      console.warn('BLOB_READ_WRITE_TOKEN not set. Image uploads will fail.');
    }
  }

  /**
   * Upload file to Vercel Blob
   *
   * Infrastructure layer - handles low-level API calls
   * @param file - File buffer
   * @param folder - Folder path (e.g., 'resources', 'avatars')
   * @param contentType - MIME type (e.g., 'image/jpeg')
   * @returns Public URL of uploaded file
   * @throws Error if upload fails
   */
  async uploadFile(file: Buffer, folder: string, contentType: string): Promise<string> {
    if (!this.token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
    }

    const extension = this.getExtensionFromMimeType(contentType);
    const fileName = `${folder}/${uuidv4()}-${Date.now()}.${extension}`;

    try {
      const blob = await put(fileName, file, {
        access: 'public',
        token: this.token,
        contentType,
      });

      return blob.url;
    } catch (error) {
      // Re-throw original error - let StorageService handle error formatting
      throw error;
    }
  }

  /**
   * Delete file from Vercel Blob
   *
   * Infrastructure layer - handles low-level API calls
   * @param fileUrl - Full URL of the file to delete
   * @throws Error if deletion fails
   */
  async deleteFile(fileUrl: string): Promise<void> {
    if (!this.token) {
      throw new Error('BLOB_READ_WRITE_TOKEN is not configured');
    }

    try {
      await del(fileUrl, { token: this.token });
    } catch (error) {
      // Re-throw original error - let StorageService handle error formatting
      throw error;
    }
  }

  /**
   * Check if URL is a Vercel Blob URL
   *
   * Utility method for infrastructure layer
   */
  isBlobUrl(url: string): boolean {
    return url.includes('blob.vercel-storage.com');
  }

  /**
   * Get file extension from MIME type
   *
   * Utility method for infrastructure layer
   */
  private getExtensionFromMimeType(mimeType: string): string {
    const mimeToExt: Record<string, string> = {
      'image/jpeg': 'jpg',
      'image/jpg': 'jpg',
      'image/png': 'png',
      'image/gif': 'gif',
      'image/webp': 'webp',
      'image/svg+xml': 'svg',
    };
    return mimeToExt[mimeType.toLowerCase()] || 'jpg';
  }
}
