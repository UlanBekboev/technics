import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
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

  private async assertStock(productId: number, requestedQuantity: number) {
    const product = await this.prisma.product.findUnique({ where: { id: productId }, select: { name: true, stock: true } });
    if (!product) throw new NotFoundException('Товар не найден');
    if (requestedQuantity > product.stock) {
      throw new BadRequestException(
        product.stock > 0
          ? `«${product.name}» — в наличии только ${product.stock} шт.`
          : `«${product.name}» закончился на складе`,
      );
    }
  }

  async addItem(userId: number, productId: number, quantity = 1) {
    const existing = await this.prisma.cartItem.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    const totalQuantity = (existing?.quantity ?? 0) + quantity;
    await this.assertStock(productId, totalQuantity);

    if (existing) {
      return this.prisma.cartItem.update({
        where: { userId_productId: { userId, productId } },
        data: { quantity: totalQuantity },
        include: { product: { include: { images: true } } },
      });
    }

    return this.prisma.cartItem.create({
      data: { userId, productId, quantity },
      include: { product: { include: { images: true } } },
    });
  }

  async updateItem(userId: number, productId: number, quantity: number) {
    if (quantity <= 0) return this.removeItem(userId, productId);
    await this.assertStock(productId, quantity);
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
