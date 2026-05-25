import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  private getCloudinary() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey    = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    this.logger.log(`Cloudinary config: cloud=${cloudName ?? 'MISSING'}, key=${apiKey ? apiKey.slice(0, 4) + '...' : 'MISSING'}`);

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException(
        `Cloudinary не настроен: cloud=${cloudName ?? 'MISSING'}, key=${apiKey ? 'OK' : 'MISSING'}, secret=${apiSecret ? 'OK' : 'MISSING'}`,
      );
    }
    cloudinary.config({ cloud_name: cloudName, api_key: apiKey, api_secret: apiSecret });
    return cloudinary;
  }

  async uploadImage(file: Express.Multer.File, folder = 'technics'): Promise<string> {
    if (!file?.buffer?.length) {
      throw new InternalServerErrorException('Файл пустой или не получен');
    }
    const cl = this.getCloudinary();
    return new Promise((resolve, reject) => {
      const stream = cl.uploader.upload_stream(
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
    const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z]+$/i);
    if (match) {
      try {
        this.getCloudinary();
        await cloudinary.uploader.destroy(match[1]);
      } catch {
        this.logger.warn(`Could not delete image: ${url}`);
      }
    }
  }
}
