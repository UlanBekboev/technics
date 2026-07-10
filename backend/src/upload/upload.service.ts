import { Injectable, InternalServerErrorException, Logger } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import { requireEnv } from '../common/require-env';

@Injectable()
export class UploadService {
  private readonly logger = new Logger(UploadService.name);

  private getCloudinary() {
    cloudinary.config({
      cloud_name: requireEnv('CLOUDINARY_CLOUD_NAME'),
      api_key:    requireEnv('CLOUDINARY_API_KEY'),
      api_secret: requireEnv('CLOUDINARY_API_SECRET'),
    });
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
