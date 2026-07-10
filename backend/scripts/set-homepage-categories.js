require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

// The 8 categories shown on the homepage grid, in display order.
// imageUrl is left untouched — admin uploads photos via /admin/categories.
const TARGETS = [
  { id: 745, name: 'Видеонаблюдение', icon: 'Cctv', position: 0 },
  { id: 747, name: 'Сигнализация ОП', icon: 'Siren', position: 1 },
  { id: 744, name: 'Видеорегистраторы', icon: 'Video', position: 2 },
  { id: 737, name: 'Периферия ПК', icon: 'Keyboard', position: 3 },
  { id: 733, name: 'Контроль доступа', icon: 'ScanFace', position: 4 },
  { id: 730, name: 'Домофония', icon: 'Bell', position: 5 },
  { id: 729, name: 'Аксессуары камер', icon: 'Camera', position: 6 },
  { id: 741, name: 'Сетевые устройства', icon: 'Network', position: 7 },
];

async function main() {
  // Unfeature anything currently featured that isn't part of the target set.
  await prisma.category.updateMany({
    where: { featured: true, id: { notIn: TARGETS.map((t) => t.id) } },
    data: { featured: false },
  });

  for (const t of TARGETS) {
    await prisma.category.update({
      where: { id: t.id },
      data: { name: t.name, icon: t.icon, position: t.position, featured: true, showInCatalog: true },
    });
  }

  const result = await prisma.category.findMany({
    where: { id: { in: TARGETS.map((t) => t.id) } },
    orderBy: { position: 'asc' },
    select: { id: true, name: true, icon: true, imageUrl: true, featured: true, position: true },
  });
  console.log(JSON.stringify(result, null, 2));
}

main().finally(() => prisma.$disconnect());
