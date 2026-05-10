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
}
