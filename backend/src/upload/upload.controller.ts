import {
  Controller, Post, Get, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly service: UploadService) {}

  /** Временный диагностический эндпоинт — проверяет наличие env vars */
  @Get('debug')
  debugEnv() {
    const cn = process.env.CLOUDINARY_CLOUD_NAME;
    const ak = process.env.CLOUDINARY_API_KEY;
    const as = process.env.CLOUDINARY_API_SECRET;
    return {
      CLOUDINARY_CLOUD_NAME: cn ? `"${cn}"` : '❌ NOT SET',
      CLOUDINARY_API_KEY:    ak ? `"${ak.slice(0, 4)}..."` : '❌ NOT SET',
      CLOUDINARY_API_SECRET: as ? `"${as.slice(0, 4)}..."` : '❌ NOT SET',
    };
  }

  @Post('image')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не передан');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Допустимы только изображения');
    this.logger.log(`Uploading: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    const url = await this.service.uploadImage(file);
    return { url };
  }
}
