import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:yandexpraktikum@localhost:5432/technics' });
const prisma = new PrismaClient({ adapter } as any);

async function main() {
  const products = await prisma.product.findMany({ include: { images: true } });

  let count = 0;
  for (const p of products) {
    for (const img of p.images) {
      if (!img.url.includes('placehold.co')) {
        const label = encodeURIComponent(p.name.split(' ').slice(0, 2).join('+')).slice(0, 40);
        await prisma.productImage.update({
          where: { id: img.id },
          data: { url: `https://placehold.co/400x300/1a2f5e/ffffff?text=${label}` },
        });
        count++;
      }
    }
  }

  console.log(`✅ Сброшено ${count} изображений на плейсхолдеры`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
