import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  getCart(userId: number) {
    return this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: { include: { images: true } } },
    });
  }

  async addItem(userId: number, productId: number, quantity = 1) {
    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });

    if (existing) {
      return this.prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: existing.quantity + quantity },
        include: { product: { include: { images: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: { include: { images: true } } },
    });
  }

  updateItem(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, productId);
    return this.prisma.cartItem.update({
      where: { userId_productId: { userId, productId } },
      data: { quantity },
      include: { product: { include: { images: true } } },
    });
  }

  removeItem(userId: number, productId: number) {
    return this.prisma.cartItem.delete({
      where: { userId_productId: { userId, productId } },
    });
  }

  clearCart(userId: number) {
    return this.prisma.cartItem.deleteMany({ where: { userId } });
  }
}
