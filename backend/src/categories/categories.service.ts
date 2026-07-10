import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  /** Считает товары в каждой категории, включая товары всех вложенных подкатегорий (рекурсивно). */
  private async productCountsById(): Promise<Map<number, number>> {
    const all = await this.prisma.category.findMany({
      select: { id: true, parentId: true, _count: { select: { products: true } } },
    });
    const children = new Map<number | null, number[]>();
    const ownCount = new Map<number, number>();
    for (const c of all) {
      ownCount.set(c.id, c._count.products);
      const key = c.parentId ?? null;
      children.set(key, [...(children.get(key) ?? []), c.id]);
    }
    const total = new Map<number, number>();
    const resolve = (id: number): number => {
      if (total.has(id)) return total.get(id)!;
      const sum = (ownCount.get(id) ?? 0) + (children.get(id) ?? []).reduce((s, childId) => s + resolve(childId), 0);
      total.set(id, sum);
      return sum;
    };
    for (const c of all) resolve(c.id);
    return total;
  }

  async findAll() {
    const [categories, counts] = await Promise.all([
      this.prisma.category.findMany({
        where: { parentId: null, showInCatalog: true },
        include: {
          subcategories: {
            where: { showInCatalog: true },
            orderBy: [{ position: 'asc' }, { name: 'asc' }],
          },
        },
        orderBy: [{ position: 'asc' }, { name: 'asc' }],
      }),
      this.productCountsById(),
    ]);
    return categories.map((c) => ({
      ...c,
      productCount: counts.get(c.id) ?? 0,
      subcategories: c.subcategories.map((s) => ({ ...s, productCount: counts.get(s.id) ?? 0 })),
    }));
  }

  findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { subcategories: true },
    });
  }

  create(data: { name: string; slug: string; imageUrl?: string; icon?: string; parentId?: number }) {
    return this.prisma.category.create({ data, include: { subcategories: true } });
  }

  update(id: number, data: { name?: string; slug?: string; imageUrl?: string; icon?: string; parentId?: number | null }) {
    return this.prisma.category.update({ where: { id }, data, include: { subcategories: true } });
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }

  async findAllFlat() {
    const [categories, counts] = await Promise.all([
      this.prisma.category.findMany({ orderBy: { name: 'asc' } }),
      this.productCountsById(),
    ]);
    return categories.map((c) => ({ ...c, productCount: counts.get(c.id) ?? 0 }));
  }
}
