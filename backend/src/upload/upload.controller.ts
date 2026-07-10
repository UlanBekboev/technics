import {
  Controller, Post, Get, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, ForbiddenException, Logger, Request,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { requireEnv } from '../common/require-env';

@Controller('upload')
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly service: UploadService) {}

  /**
   * Генерирует подпись для прямой загрузки из браузера в Cloudinary.
   * Не делает сетевых запросов — только крипто.
   */
  @Get('cloudinary-params')
  @UseGuards(JwtAuthGuard)
  getCloudinaryParams(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();

    const cloudName  = requireEnv('CLOUDINARY_CLOUD_NAME');
    const apiKey     = requireEnv('CLOUDINARY_API_KEY');
    const apiSecret  = requireEnv('CLOUDINARY_API_SECRET');
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
