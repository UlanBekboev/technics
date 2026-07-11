import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

const DEFAULT_ABOUT_STATS = JSON.stringify([
  { value: '10+', label: 'лет на рынке' },
  { value: '1000+', label: 'довольных клиентов' },
  { value: '800+', label: 'товаров в каталоге' },
  { value: '24/7', label: 'поддержка клиентов' },
]);

const DEFAULTS: Record<string, string> = {
  siteName: 'TECHNICS',
  sitePhone: '+996 312 900 000',
  siteEmail: 'info@technics.kg',
  siteAddress: 'г. Бишкек',
  siteWorkHours: 'Ежедневно, без выходных: 09:00–18:00',
  siteWhatsapp: '',
  siteTelegram: '',
  siteInstagram: '',
  freeDeliveryThreshold: '50000',
  deliveryCost: '300',
  // Full contact lists shown on the /contacts page (admin edits as add/remove rows).
  sitePhones: JSON.stringify(['+996 700 916 121', '+996 551 916 122']),
  siteAddresses: JSON.stringify(['г. Бишкек']),
  // Content for the /about page — admin-editable.
  aboutTitle: 'О компании TECHNICS',
  aboutSubtitle:
    'Мы — поставщик систем видеонаблюдения, охранных сигнализаций и цифровой техники в Кыргызстане. ' +
    'Наша цель — сделать современные технологии безопасности доступными для каждого.',
  aboutStats: DEFAULT_ABOUT_STATS,
  aboutHistory:
    'TECHNICS начинал как небольшая команда специалистов по видеонаблюдению в Бишкеке. За годы работы мы выросли ' +
    'в надёжного поставщика систем безопасности и цифровой техники, расширили каталог и наладили прямые поставки ' +
    'от ведущих производителей.',
  aboutMission:
    'Обеспечивать клиентов оригинальным оборудованием по честным ценам, сопровождая покупку профессиональной ' +
    'консультацией, установкой и сервисом. Мы помогаем бизнесу и людям чувствовать себя в безопасности.',
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
