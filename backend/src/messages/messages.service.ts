import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class MessagesService {
  constructor(private prisma: PrismaService) {}

  create(data: { name: string; phone: string; message?: string }) {
    return this.prisma.contactMessage.create({ data });
  }

  findAll() {
    return this.prisma.contactMessage.findMany({ orderBy: { createdAt: 'desc' } });
  }

  findById(id: number) {
    return this.prisma.contactMessage.findUnique({ where: { id } });
  }

  async unreadCount() {
    const count = await this.prisma.contactMessage.count({ where: { isRead: false } });
    return { count };
  }

  markRead(id: number) {
    return this.prisma.contactMessage.update({ where: { id }, data: { isRead: true } });
  }

  reply(id: number, text: string) {
    return this.prisma.contactMessage.update({
      where: { id },
      data: { reply: text, repliedAt: new Date(), isRead: true },
    });
  }

  remove(id: number) {
    return this.prisma.contactMessage.delete({ where: { id } });
  }
}
