import {
  Controller,
  Post,
  Delete,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Body,
  HttpCode,
  HttpStatus,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserWithRole } from '../auth/types/user.type';
import { StorageService } from './storage.service';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_MIME_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];

@Controller('storage')
@UseGuards(JwtAuthGuard)
export class StorageController {
  constructor(private storageService: StorageService) {}

  /**
   * POST /storage/upload
   *
   * PURPOSE: Upload image file to Vercel Blob
   * AUTH: Requires authentication
   * BODY: multipart/form-data with 'file' field
   * QUERY: folder (optional, defaults to 'resources')
   */
  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
      limits: {
        fileSize: MAX_FILE_SIZE,
      },
      fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.includes(file.mimetype)) {
          cb(null, true);
        } else {
          cb(
            new BadRequestException(
              `Invalid file type. Allowed types: ${ALLOWED_MIME_TYPES.join(', ')}`
            ),
            false
          );
        }
      },
    })
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder: string = 'resources',
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: UserWithRole
  ) {
    return this.storageService.uploadFile(file, folder);
  }

  /**
   * DELETE /storage/delete
   *
   * PURPOSE: Delete image file from Vercel Blob
   * AUTH: Requires authentication
   * BODY: { url: string }
   */
  @Delete('delete')
  @HttpCode(HttpStatus.OK)
  async deleteFile(
    @Body('url') fileUrl: string,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    @CurrentUser() _user: UserWithRole
  ) {
    return this.storageService.deleteFile(fileUrl);
  }
}
