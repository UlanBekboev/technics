import {
  Controller, Get, Post, Put, Delete, Param, Query,
  Body, UseGuards, Request, ForbiddenException,
  UseInterceptors, UploadedFile, ParseIntPipe,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

  // ── Public ────────────────────────────────────

  @Get()
  findAll(
    @Query('category') categorySlug?: string,
    @Query('brand') brandId?: string,
    @Query('minPrice') minPrice?: string,
    @Query('maxPrice') maxPrice?: string,
    @Query('search') search?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.service.findAll({
      categorySlug,
      brandId: brandId ? +brandId : undefined,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      search,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
    });
  }

  @Get('featured')
  findFeatured() { return this.service.findFeatured(); }

  @Get('brands')
  findBrands() { return this.service.findBrands(); }

  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }

  // ── Admin ─────────────────────────────────────

  @Get('admin/list')
  @UseGuards(JwtAuthGuard)
  adminList(@Request() req: any, @Query('search') search?: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.findAllAdmin(search);
  }

  @Post('admin')
  @UseGuards(JwtAuthGuard)
  adminCreate(@Request() req: any, @Body() dto: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.createProduct(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  adminUpdate(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.updateProduct(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  adminDelete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.deleteProduct(id);
  }

  @Post('admin/:id/images')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('file', { storage: memoryStorage() }))
  adminAddImage(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: Express.Multer.File,
    @Body('isMain') isMain?: string,
  ) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.addImage(id, file, isMain === 'true');
  }

  @Delete('admin/images/:imageId')
  @UseGuards(JwtAuthGuard)
  adminDeleteImage(@Request() req: any, @Param('imageId', ParseIntPipe) imageId: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.deleteImage(imageId);
  }

  @Put('admin/images/:imageId/main')
  @UseGuards(JwtAuthGuard)
  adminSetMain(
    @Request() req: any,
    @Param('imageId', ParseIntPipe) imageId: number,
    @Body('productId', ParseIntPipe) productId: number,
  ) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.setMainImage(imageId, productId);
  }
}
