import { Injectable, ForbiddenException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: number, productId: number, rating: number, comment?: string) {
    const existing = await this.prisma.review.findUnique({
      where: { userId_productId: { userId, productId } },
    });
    if (existing) throw new ConflictException('Вы уже оставляли отзыв на этот товар');

    return this.prisma.review.create({
      data: { userId, productId, rating, comment },
      include: { user: { select: { name: true } } },
    });
  }

  async remove(id: number, userId: number, role: string) {
    const review = await this.prisma.review.findUniqueOrThrow({ where: { id } });
    if (review.userId !== userId && role !== 'ADMIN') throw new ForbiddenException();
    return this.prisma.review.delete({ where: { id } });
  }
}
