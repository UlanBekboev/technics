import {
  Controller, Post, UseInterceptors, UploadedFile,
  UseGuards, BadRequestException, Logger,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from './upload.service';
import { memoryStorage } from 'multer';

@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  private readonly logger = new Logger(UploadController.name);

  constructor(private readonly service: UploadService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } }))
  async uploadImage(@UploadedFile() file: Express.Multer.File) {
    if (!file) throw new BadRequestException('Файл не передан');
    if (!file.mimetype.startsWith('image/')) throw new BadRequestException('Допустимы только изображения');
    this.logger.log(`Uploading: ${file.originalname} (${file.mimetype}, ${file.size} bytes)`);
    const url = await this.service.uploadImage(file);
    return { url };
  }
}
