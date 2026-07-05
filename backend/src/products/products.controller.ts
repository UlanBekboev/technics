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
    @Query('isHit') isHit?: string,
    @Query('isNew') isNew?: string,
    @Query('sort') sort?: string,
  ) {
    return this.service.findAll({
      categorySlug,
      brandId: brandId ? +brandId : undefined,
      minPrice: minPrice ? +minPrice : undefined,
      maxPrice: maxPrice ? +maxPrice : undefined,
      search,
      page: page ? +page : 1,
      limit: limit ? +limit : 20,
      isHit: isHit === 'true',
      isNew: isNew === 'true',
      sort,
    });
  }

  @Get('featured')
  findFeatured() { return this.service.findFeatured(); }

  @Get('hits')
  findHits() { return this.service.findHits(); }

  @Get('brands')
  findBrands() { return this.service.findBrands(); }

  // ── Admin (legacy routes kept for compatibility) ──

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdminLegacy(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.findAllAdmin();
  }

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
    return this.service.create(dto);
  }

  @Put('admin/:id')
  @UseGuards(JwtAuthGuard)
  adminUpdate(@Request() req: any, @Param('id', ParseIntPipe) id: number, @Body() dto: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.update(id, dto);
  }

  @Delete('admin/:id')
  @UseGuards(JwtAuthGuard)
  adminDelete(@Request() req: any, @Param('id', ParseIntPipe) id: number) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.remove(id);
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

  @Post('admin/:id/images-by-url')
  @UseGuards(JwtAuthGuard)
  adminAddImageByUrl(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { url: string; isMain?: boolean },
  ) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.addImageByUrl(id, body.url, body.isMain ?? false);
  }

  @Post('admin/:id/fetch-image')
  @UseGuards(JwtAuthGuard)
  adminFetchImage(
    @Request() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { url?: string },
  ) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.fetchImage(id, body?.url);
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

  // ── New admin routes ──

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.create(body);
  }

  @Put('brands/:id')
  @UseGuards(JwtAuthGuard)
  updateBrand(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.updateBrand(+id, body);
  }

  @Delete('brands/:id')
  @UseGuards(JwtAuthGuard)
  removeBrand(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.removeBrand(+id);
  }

  @Post('brands')
  @UseGuards(JwtAuthGuard)
  createBrand(@Request() req: any, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.createBrand(body);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  update(@Request() req: any, @Param('id') id: string, @Body() body: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.update(+id, body);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Request() req: any, @Param('id') id: string) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.remove(+id);
  }

  @Get(':slug')
  findOne(@Param('slug') slug: string) { return this.service.findOne(slug); }
}
