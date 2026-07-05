import { Injectable } from '@nestjs/common'; // updated
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class BannersService {
  constructor(private prisma: PrismaService) {}

  findActive() {
    return this.prisma.banner.findMany({
      where: { isActive: true },
      orderBy: { position: 'asc' },
    });
  }

  findAll() {
    return this.prisma.banner.findMany({ orderBy: { position: 'asc' } });
  }

  create(data: any) {
    return this.prisma.banner.create({ data });
  }

  update(id: number, data: any) {
    return this.prisma.banner.update({ where: { id }, data });
  }

  async toggle(id: number) {
    const banner = await this.prisma.banner.findUniqueOrThrow({ where: { id } });
    return this.prisma.banner.update({ where: { id }, data: { isActive: !banner.isActive } });
  }

  async reorder(ids: number[]) {
    await Promise.all(
      ids.map((id, i) => this.prisma.banner.update({ where: { id }, data: { position: i } }))
    );
    return this.findAll();
  }

  remove(id: number) {
    return this.prisma.banner.delete({ where: { id } });
  }
}
