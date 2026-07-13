import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import { MailService } from '../mail/mail.service';
import axios from 'axios';

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private mail: MailService,
  ) {}

  async createOrder(userId: number, address: string, comment?: string) {
    const cartItems = await this.prisma.cartItem.findMany({
      where: { userId },
      include: { product: true },
    });

    if (cartItems.length === 0) throw new BadRequestException('Cart is empty');

    // Re-check stock at order time — it may have changed since items were
    // added to the cart (another customer could have bought the last one).
    const shortages = cartItems.filter((item) => item.quantity > item.product.stock);
    if (shortages.length > 0) {
      const detail = shortages
        .map((item) =>
          item.product.stock > 0
            ? `«${item.product.name}» — в наличии только ${item.product.stock} шт.`
            : `«${item.product.name}» закончился на складе`,
        )
        .join('; ');
      throw new BadRequestException(detail);
    }

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true, email: true } });

    const order = await this.prisma.$transaction(async (tx) => {
      const created = await tx.order.create({
        data: {
          userId,
          address,
          comment,
          total,
          items: {
            create: cartItems.map((item) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.product.price,
            })),
          },
        },
        include: { items: { include: { product: true } } },
      });

      // Reserve the stock immediately so it isn't oversold while the order
      // is pending — restored if the order later gets cancelled.
      for (const item of cartItems) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stock: { decrement: item.quantity } },
        });
      }

      return created;
    });

    await this.prisma.cartItem.deleteMany({ where: { userId } });

    this.sendTelegramNotification(order, user, cartItems).catch(() => {});

    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (user?.email) this.mail.sendOrderConfirmation(user.email, order, user.name ?? '').catch(() => {});
    if (adminEmail) this.mail.sendNewOrderAlert(adminEmail, order, user).catch(() => {});

    return order;
  }

  getOrders(userId: number) {
    return this.prisma.order.findMany({
      where: { userId },
      include: { items: { include: { product: { include: { images: true } } } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  getOrder(userId: number, orderId: number) {
    return this.prisma.order.findFirst({
      where: { id: orderId, userId },
      include: { items: { include: { product: { include: { images: true } } } } },
    });
  }

  getAllOrders() {
    return this.prisma.order.findMany({
      include: {
        user: { select: { name: true, email: true, phone: true } },
        items: { include: { product: { select: { name: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async updateStatus(orderId: number, status: string) {
    const order = await this.prisma.order.findUniqueOrThrow({
      where: { id: orderId },
      include: { items: true },
    });

    const wasCancelled = order.status === 'CANCELLED';
    const isCancelling = status === 'CANCELLED';

    // Stock was reserved (decremented) when the order was placed. Restore
    // it if the order is cancelled, and re-reserve it if a cancelled order
    // is reinstated — otherwise cancel/un-cancel toggling would leak stock.
    if (!wasCancelled && isCancelling) {
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { increment: item.quantity } } });
        }
        return tx.order.update({ where: { id: orderId }, data: { status: status as any } });
      });
    }

    if (wasCancelled && !isCancelling) {
      const products = await this.prisma.product.findMany({
        where: { id: { in: order.items.map((i) => i.productId) } },
        select: { id: true, name: true, stock: true },
      });
      const stockById = new Map(products.map((p) => [p.id, p]));
      const shortages = order.items.filter((item) => item.quantity > (stockById.get(item.productId)?.stock ?? 0));
      if (shortages.length > 0) {
        const detail = shortages
          .map((item) => `«${stockById.get(item.productId)?.name}» — в наличии только ${stockById.get(item.productId)?.stock ?? 0} шт.`)
          .join('; ');
        throw new BadRequestException(`Нельзя восстановить заказ: ${detail}`);
      }
      return this.prisma.$transaction(async (tx) => {
        for (const item of order.items) {
          await tx.product.update({ where: { id: item.productId }, data: { stock: { decrement: item.quantity } } });
        }
        return tx.order.update({ where: { id: orderId }, data: { status: status as any } });
      });
    }

    return this.prisma.order.update({
      where: { id: orderId },
      data: { status: status as any },
    });
  }

  private async sendTelegramNotification(order: any, user: any, cartItems: any[]) {
    const botToken = this.config.get<string>('TELEGRAM_BOT_TOKEN');
    const chatId = this.config.get<string>('TELEGRAM_CHAT_ID');
    if (!botToken || !chatId) return;

    const lines = cartItems.map((i) => `  • ${i.product.name} × ${i.quantity} — ${(Number(i.product.price) * i.quantity).toLocaleString('ru')} сом`);

    const text = [
      `🛒 *Новый заказ #${order.id}*`,
      ``,
      `👤 *Клиент:* ${user?.name ?? '—'} (${user?.email ?? '—'})`,
      user?.phone ? `📞 *Телефон:* ${user.phone}` : null,
      `📍 *Адрес:* ${order.address ?? '—'}`,
      order.comment ? `💬 *Комментарий:* ${order.comment}` : null,
      ``,
      `*Товары:*`,
      ...lines,
      ``,
      `💰 *Итого: ${Number(order.total).toLocaleString('ru')} сом*`,
    ].filter(Boolean).join('\n');

    await axios.post(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      chat_id: chatId,
      text,
      parse_mode: 'Markdown',
    });
  }
}
