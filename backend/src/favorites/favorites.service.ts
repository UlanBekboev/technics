import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FavoritesService {
  constructor(private prisma: PrismaService) {}

  async getFavorites(userId: number) {
    const favorites = await this.prisma.favorite.findMany({
      where: { userId },
      include: { product: { include: { images: true, brand: true } } },
    });
    // Callers want the products themselves, not the Favorite join rows —
    // returning the raw rows previously leaked the Favorite's own id where
    // callers expected productId, breaking favorite-removal for that item.
    return favorites.map((f) => f.product);
  }

  async toggle(userId: number, productId: number) {
    const existing = await this.prisma.favorite.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    // A second toggle request can land while the first is still in flight
    // (e.g. a double-click before the button disables). Without this, the
    // loser of the race throws P2025/P2002 and Nest turns that into a 500 —
    // which is what made favorites look "impossible to remove".
    if (existing) {
      try {
        await this.prisma.favorite.delete({
          where: { userId_productId: { userId, productId } },
        });
      } catch (e) {
        if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2025')) throw e;
      }
      return { added: false };
    }

    try {
      await this.prisma.favorite.create({ data: { userId, productId } });
    } catch (e) {
      if (!(e instanceof Prisma.PrismaClientKnownRequestError && e.code === 'P2002')) throw e;
    }
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
