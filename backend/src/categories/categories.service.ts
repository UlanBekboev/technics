import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CategoriesService {
  constructor(private prisma: PrismaService) {}

  findAll() {
    return this.prisma.category.findMany({
      where: { parentId: null },
      include: { subcategories: true },
    });
  }

  findOne(slug: string) {
    return this.prisma.category.findUnique({
      where: { slug },
      include: { subcategories: true },
    });
  }

  create(data: { name: string; slug: string; imageUrl?: string; parentId?: number }) {
    return this.prisma.category.create({ data, include: { subcategories: true } });
  }

  update(id: number, data: { name?: string; slug?: string; imageUrl?: string; parentId?: number | null }) {
    return this.prisma.category.update({ where: { id }, data, include: { subcategories: true } });
  }

  remove(id: number) {
    return this.prisma.category.delete({ where: { id } });
  }

  findAllFlat() {
    return this.prisma.category.findMany({ orderBy: { name: 'asc' } });
  }
}
