import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Query,
  Body,
  Request,
  UseGuards,
  ForbiddenException,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@Controller('products')
export class ProductsController {
  constructor(private service: ProductsService) {}

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
  findFeatured() {
    return this.service.findFeatured();
  }

  @Get('brands')
  findBrands() {
    return this.service.findBrands();
  }

  @Get('admin/all')
  @UseGuards(JwtAuthGuard)
  findAllAdmin(@Request() req: any) {
    if (req.user.role !== 'ADMIN') throw new ForbiddenException();
    return this.service.findAllAdmin();
  }

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
  findOne(@Param('slug') slug: string) {
    return this.service.findOne(slug);
  }
}
