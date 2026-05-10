import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: {
    categorySlug?: string;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const { categorySlug, brandId, minPrice, maxPrice, search, page = 1, limit = 20 } = query;

    const where: any = { isActive: true };

    if (categorySlug) {
      const category = await this.prisma.category.findUnique({ where: { slug: categorySlug } });
      if (category) {
        const subcats = await this.prisma.category.findMany({ where: { parentId: category.id } });
        const ids = [category.id, ...subcats.map((s) => s.id)];
        where.categoryId = { in: ids };
      }
    }

    if (brandId) where.brandId = brandId;
    if (minPrice || maxPrice) {
      where.price = {};
      if (minPrice) where.price.gte = minPrice;
      if (maxPrice) where.price.lte = maxPrice;
    }
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: true, category: true, brand: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.product.count({ where }),
    ]);

    return { items, total, page, limit, totalPages: Math.ceil(total / limit) };
  }

  async findOne(slug: string) {
    const product = await this.prisma.product.findUnique({
      where: { slug },
      include: {
        images: true,
        category: true,
        brand: true,
        specs: true,
        reviews: { include: { user: { select: { name: true } } } },
      },
    });
    if (!product) throw new NotFoundException('Product not found');
    return product;
  }

  findFeatured() {
    return this.prisma.product.findMany({
      where: { isActive: true },
      include: { images: true, brand: true },
      take: 12,
      orderBy: { createdAt: 'desc' },
    });
  }

  findBrands() {
    return this.prisma.brand.findMany({ orderBy: { name: 'asc' } });
  }
}
