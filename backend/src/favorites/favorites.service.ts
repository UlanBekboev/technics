import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  getFavorites(userId: number) {
    return this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { images: true, brand: true } } },
    });
  }

  async toggle(userId: number, productId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      await this.prisma.favorite.delete({
        where: { userId_productId: { userId, productId } },
      });
      return { added: false };
    }

    await this.prisma.favorite.create({ data: { userId, productId } });
    return { added: true };
  }

  async getIds(userId: number): Promise<number[]> {
    const favs = await this.prisma.favorite.findMany({
      where: { userId },
      select: { productId: true },
    });
    return favs.map((f) => f.productId);
  }
}
