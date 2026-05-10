import { Controller, Get, Param, Query } from '@nestjs/common';
import { ProductsService } from './products.service';

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

  @Get(':slug')
  findOne(@Param('slug') slug: string) {
    return this.service.findOne(slug);
  }
}
