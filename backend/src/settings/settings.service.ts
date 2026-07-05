import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULTS: Record<string, string> = {
  siteName: 'TECHNICS',
  sitePhone: '+996 312 900 000',
  siteEmail: 'info@technics.kg',
  siteAddress: 'г. Бишкек',
  whatsapp: '',
  telegram: '',
  freeDeliveryThreshold: '50000',
  deliveryCost: '300',
};

@Injectable()
export class SettingsService {
  constructor(private prisma: PrismaService) {}

  async getAll(): Promise<Record<string, string>> {
    const rows = await this.prisma.siteSettings.findMany();
    const result = { ...DEFAULTS };
    for (const row of rows) result[row.key] = row.value;
    return result;
  }

  async updateAll(data: Record<string, string>): Promise<Record<string, string>> {
    await Promise.all(
      Object.entries(data).map(([key, value]) =>
        this.prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        })
      )
    );
    return this.getAll();
  }
}
