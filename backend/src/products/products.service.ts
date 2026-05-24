import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadService,
  ) {}

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
        images: true, category: true, brand: true, specs: true,
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

  // ── Admin CRUD ──────────────────────────────────────────────

  findAllAdmin(search?: string) {
    return this.prisma.product.findMany({
      where: search ? { name: { contains: search, mode: 'insensitive' } } : undefined,
      include: { images: true, category: true, brand: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async create(data: {
    name: string; slug: string; description?: string;
    price: number; oldPrice?: number; stock?: number;
    isActive?: boolean; categoryId: number; brandId?: number;
    images?: { url: string; isMain?: boolean }[];
    specs?: { key: string; value: string }[];
  }) {
    const { images, specs, ...rest } = data;
    return this.prisma.product.create({
      data: {
        ...rest,
        images: images?.length ? { create: images } : undefined,
        specs:  specs?.length  ? { create: specs }  : undefined,
      },
      include: { images: true, category: true, brand: true, specs: true },
    });
  }

  async update(id: number, data: {
    name?: string; slug?: string; description?: string;
    price?: number; oldPrice?: number; stock?: number;
    isActive?: boolean; categoryId?: number; brandId?: number;
    images?: { url: string; isMain?: boolean }[];
    specs?: { key: string; value: string }[];
  }) {
    const { images, specs, ...rest } = data;
    await this.prisma.product.findUniqueOrThrow({ where: { id } });
    if (images !== undefined) await this.prisma.productImage.deleteMany({ where: { productId: id } });
    if (specs  !== undefined) await this.prisma.productSpec.deleteMany({ where: { productId: id } });
    return this.prisma.product.update({
      where: { id },
      data: {
        ...rest,
        images: images?.length ? { create: images } : undefined,
        specs:  specs?.length  ? { create: specs }  : undefined,
      },
      include: { images: true, category: true, brand: true, specs: true },
    });
  }

  async remove(id: number) {
    const product = await this.prisma.product.findUnique({ where: { id }, include: { images: true } });
    if (product) {
      for (const img of product.images) {
        await this.upload.deleteImage(img.url).catch(() => {});
      }
    }
    return this.prisma.product.delete({ where: { id } });
  }

  // ── Image management ──────────────────────────────────────

  async addImage(productId: number, file: Express.Multer.File, isMain = false) {
    const url = await this.upload.uploadImage(file, 'technics/products');
    if (isMain) {
      await this.prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } });
    }
    return this.prisma.productImage.create({ data: { url, isMain, productId } });
  }

  async deleteImage(imageId: number) {
    const img = await this.prisma.productImage.findUnique({ where: { id: imageId } });
    if (img) await this.upload.deleteImage(img.url).catch(() => {});
    return this.prisma.productImage.delete({ where: { id: imageId } });
  }

  async setMainImage(imageId: number, productId: number) {
    await this.prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } });
    return this.prisma.productImage.update({ where: { id: imageId }, data: { isMain: true } });
  }

  // ── Brands ────────────────────────────────────────────────

  async createBrand(data: { name: string; slug: string; logoUrl?: string }) {
    return this.prisma.brand.create({ data });
  }

  async updateBrand(id: number, data: { name?: string; slug?: string; logoUrl?: string }) {
    return this.prisma.brand.update({ where: { id }, data });
  }

  async removeBrand(id: number) {
    return this.prisma.brand.delete({ where: { id } });
  }
}
