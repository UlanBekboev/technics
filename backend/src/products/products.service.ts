import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UploadService } from '../upload/upload.service';
import { ImageFetchService } from './image-fetch.service';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private upload: UploadService,
    private imageFetch: ImageFetchService,
  ) {}

  async findAll(query: {
    categorySlug?: string;
    brandId?: number;
    minPrice?: number;
    maxPrice?: number;
    search?: string;
    page?: number;
    limit?: number;
    isHit?: boolean;
    isNew?: boolean;
    sort?: string;
  }) {
    const { categorySlug, brandId, minPrice, maxPrice, search, page = 1, limit = 20, isHit, isNew, sort } = query;
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
    if (isHit) where.isHit = true;
    if (isNew) where.isNew = true;
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

    // новинки всегда идут первыми при сортировке по умолчанию
    const orderBy: any =
      sort === 'price-asc' ? [{ isNew: 'desc' }, { price: 'asc' }] :
      sort === 'price-desc' ? [{ isNew: 'desc' }, { price: 'desc' }] :
      sort === 'popular' ? [{ isNew: 'desc' }, { soldCount: 'desc' }] :
      [{ isNew: 'desc' }, { createdAt: 'desc' }];

    const [items, total] = await Promise.all([
      this.prisma.product.findMany({
        where,
        include: { images: true, category: true, brand: true },
        skip: (page - 1) * limit,
        take: limit,
        orderBy,
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

  findHits() {
    return this.prisma.product.findMany({
      where: { isActive: true, isHit: true },
      include: { images: true, brand: true },
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
    isActive?: boolean; isNew?: boolean; categoryId: number; brandId?: number;
    images?: { url: string; isMain?: boolean }[];
    specs?: { key: string; value: string }[];
  }) {
    const { images, specs, ...rest } = data;
    return this.prisma.product.create({
      data: {
        ...rest,
        images: images?.length ? { create: images.map(({ url, isMain }) => ({ url, isMain: isMain ?? false })) } : undefined,
        specs:  specs?.length  ? { create: specs.map(({ key, value }) => ({ key, value })) }  : undefined,
      },
      include: { images: true, category: true, brand: true, specs: true },
    });
  }

  async update(id: number, data: {
    name?: string; slug?: string; description?: string;
    price?: number; oldPrice?: number; stock?: number;
    isActive?: boolean; isNew?: boolean; categoryId?: number; brandId?: number;
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
        images: images?.length ? { create: images.map(({ url, isMain }) => ({ url, isMain: isMain ?? false })) } : undefined,
        specs:  specs?.length  ? { create: specs.map(({ key, value }) => ({ key, value })) }  : undefined,
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

  /** Сохраняет готовый URL как изображение товара (без перезаливки) */
  async addImageByUrl(productId: number, url: string, isMain: boolean) {
    if (isMain) {
      await this.prisma.productImage.updateMany({ where: { productId }, data: { isMain: false } });
    }
    return this.prisma.productImage.create({ data: { url, isMain, productId } });
  }

  // ── Auto image fetch ──────────────────────────────────────

  async fetchImage(id: number, imageUrl?: string) {
    const product = await this.prisma.product.findUniqueOrThrow({
      where: { id },
      include: { brand: true, images: true },
    });

    let url: string;
    if (imageUrl) {
      // Загружаем напрямую по указанному URL
      url = await this.imageFetch.uploadFromUrl(id, imageUrl);
    } else {
      // Автопоиск (fallback)
      const query = this.buildImageSearchQuery(product.brand?.name, product.name);
      url = await this.imageFetch.searchAndUpload(id, query);
    }

    // Удаляем старые placeholder-изображения (placehold.co и т.п.)
    const placeholders = product.images.filter(
      (img) => img.url.includes('placehold') || img.url.includes('placeholder'),
    );
    for (const ph of placeholders) {
      await this.prisma.productImage.delete({ where: { id: ph.id } }).catch(() => {});
    }

    // Определяем — нужно ли делать новое фото главным
    const realImages = product.images.filter(
      (img) => !img.url.includes('placehold') && !img.url.includes('placeholder'),
    );
    const makeMain = !realImages.some((img) => img.isMain);

    // Если будет главным — сбрасываем текущее главное
    if (makeMain) {
      await this.prisma.productImage.updateMany({ where: { productId: id }, data: { isMain: false } });
    }

    const newImage = await this.prisma.productImage.create({
      data: { url, isMain: makeMain, productId: id },
    });

    return { success: true, url, isMain: makeMain, image: newImage };
  }

  /** Извлекает короткий запрос для поиска фото: "Acer Aspire 5 A515-57G" */
  private buildImageSearchQuery(brandName: string | undefined, productName: string): string {
    // Словарь категорий: русское → английский суффикс для поиска
    const categoryMap: Record<string, string> = {
      'Ноутбук': 'laptop', 'Смартфон': 'smartphone', 'Телефон': 'phone',
      'Планшет': 'tablet', 'Телевизор': 'TV', 'Монитор': 'monitor',
      'Принтер': 'printer', 'Компьютер': 'desktop computer',
      'Наушники': 'headphones', 'Колонка': 'speaker', 'Мышь': 'mouse',
      'Клавиатура': 'keyboard', 'Проектор': 'projector',
      'Камера': 'camera', 'Фотоаппарат': 'camera',
      'Игровой': 'gaming', 'Сканер': 'scanner',
    };

    // Извлекаем категорию и убираем префикс
    const prefixRe = /^(Ноутбук|Смартфон|Телефон|Планшет|Телевизор|Монитор|Принтер|Компьютер|Наушники|Колонка|Мышь|Клавиатура|Проектор|Камера|Фотоаппарат|Игровой|Сканер)\s+/i;
    const prefixMatch = productName.match(prefixRe);
    const categoryEn = prefixMatch ? (categoryMap[prefixMatch[1]] ?? '') : '';
    let name = productName.replace(prefixRe, '').trim();

    // Убираем дюймовые метки (27", 15.6")
    name = name.replace(/\b\d+[.,]?\d*"\s*/g, '').trim();

    // Обрезаем на первых технических характеристиках
    const stopWords = /^(Core|FHD|UHD|HD|AMOLED|IPS|VA|TN|LED|Hz|HDMI|WiFi|Ryzen|RTX|GTX|RX)$/i;
    const stopPattern = /^\d+GB$/i;

    const words = name.split(/\s+/);
    let end = Math.min(words.length, 5);
    for (let i = 2; i < words.length; i++) {
      if (stopWords.test(words[i]) || stopPattern.test(words[i])) {
        end = i;
        break;
      }
    }

    let modelPart = words.slice(0, end).join(' ');

    // Добавляем бренд если его нет в названии
    if (brandName && !modelPart.toLowerCase().includes(brandName.toLowerCase())) {
      modelPart = `${brandName} ${modelPart}`;
    }

    // Добавляем английскую категорию — помогает поисковику понять контекст
    return categoryEn ? `${modelPart} ${categoryEn}` : modelPart;
  }
}
