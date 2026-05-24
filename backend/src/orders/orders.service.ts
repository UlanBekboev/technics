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

    const total = cartItems.reduce((sum, item) => {
      return sum + Number(item.product.price) * item.quantity;
    }, 0);

    const user = await this.prisma.user.findUnique({ where: { id: userId }, select: { name: true, phone: true, email: true } });

    const order = await this.prisma.order.create({
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
