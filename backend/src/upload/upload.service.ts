import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);
  private readonly configured: boolean;

  constructor() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      this.logger.error('Cloudinary env vars not set (CLOUDINARY_CLOUD_NAME / CLOUDINARY_API_KEY / CLOUDINARY_API_SECRET)');
      this.configured = false;
    } else {
      cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
      this.configured = true;
    }
  }

  async uploadImage(file: Express.Multer.File, folder = 'technics'): Promise<string> {
    if (!this.configured) {
      throw new InternalServerErrorException('Cloudinary не настроен. Добавьте переменные окружения.');
    }
    if (!file?.buffer?.length) {
      throw new InternalServerErrorException('Файл пустой или не получен');
    }
    return new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder, resource_type: 'image' },
        (error, result) => {
          if (error) {
            this.logger.error(`Cloudinary upload error: ${JSON.stringify(error)}`);
            return reject(new InternalServerErrorException(`Cloudinary: ${error.message}`));
          }
          resolve(result!.secure_url);
        },
      );
      stream.end(file.buffer);
    });
  }

  async deleteImage(url: string): Promise<void> {
    // Extract public_id from URL: .../technics/filename.ext → technics/filename
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) {
      await cloudinary.uploader.destroy(match[1]);
    }
  }
}
