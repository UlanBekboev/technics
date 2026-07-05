import {
  Controller, Post, Get, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';

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

  /**
   * Генерирует подпись для прямой загрузки из браузера в Cloudinary.
   * Не делает сетевых запросов — только крипто.
   */
  @Get('cloudinary-params')
  @UseGuards(JwtAuthGuard)
  getCloudinaryParams() {
    const cloudName  = process.env.CLOUDINARY_CLOUD_NAME  || 'ddoloafbp';
    const apiKey     = process.env.CLOUDINARY_API_KEY     || '811795714155685';
    const apiSecret  = process.env.CLOUDINARY_API_SECRET  || 'rOzh4bUMFi3BAySzqSytFeG6ucs';
    const folder     = 'technics/products';
    const timestamp  = Math.round(Date.now() / 1000);

    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    const signature = cloudinary.utils.api_sign_request({ timestamp, folder }, apiSecret);

    return { signature, timestamp, cloudName, apiKey, folder };
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
