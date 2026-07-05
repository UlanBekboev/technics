import { Module } from '@nestjs/common';
import { ProductsService } from './products.service';
import { ProductsController } from './products.controller';
import { UploadModule } from '../upload/upload.module';
import { ImageFetchService } from './image-fetch.service';

@Module({
  imports: [UploadModule],
  providers: [ProductsService, ImageFetchService],
  controllers: [ProductsController],
})
export class ProductsModule {}
