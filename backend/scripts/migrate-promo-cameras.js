// One-off migration: the old admin UI stored promo camera photos as flat
// keys (promo_ezviz_0..3, promo_tvt_0..1) with real uploaded Cloudinary
// URLs. The new admin UI (add/remove cards) reads a single JSON array per
// group (promo_ezviz_cameras, promo_tvt_cameras) instead. This carries the
// real uploaded photos over into the new array format so they aren't
// silently replaced by the hardcoded fallback defaults.
require('dotenv/config');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

const EZVIZ_DEFAULTS = [
  { name: 'EZVIZ H6c Pro', type: 'Кубическая поворотная 2МР', price: 2350, specs: ['2MP / 1080p', 'IR ночь 10м', 'Wi-Fi', 'MicroSD', 'Микрофон + Динамик'], slug: 'ip-camera-ezviz-h6c-pro1080' },
  { name: 'EZVIZ H6C Pro 3K', type: 'Кубическая поворотная 5МР', price: 3200, specs: ['5MP / 3K', 'IR ночь 10м', 'Wi-Fi', 'MicroSD', 'Микрофон + Динамик'], slug: 'wifi-kamera-ezviz-h6c-pro-3k' },
  { name: 'EZVIZ H8c PRO 3K', type: 'Уличная поворотная 5МР', price: 4600, specs: ['5MP / 3K', 'LED ночь 30м', 'Wi-Fi', 'MicroSD', 'Микрофон + Динамик'], slug: 'ip-camera-ezviz-h8c-pro-3k' },
  { name: 'EZVIZ H1c', type: 'Кубическая 2МР внутренняя', price: 0, specs: ['2MP / 1080p', 'IR ночь', 'Wi-Fi', 'MicroSD', 'Magnetic Base'] },
];

const TVT_DEFAULTS = [
  { name: 'TVT TD-9540S5L-D', type: '4MP купольная уличная Dual Illumination', specs: ['4MP / 2560×1440', 'Dual Illumination', 'Микрофон', 'IP67', 'H.265+'] },
  { name: 'TVT TD-9440S5L-D', type: '4MP цилиндрическая уличная', specs: ['4MP / 2560×1440', 'Dual Illumination', 'Микрофон', 'IP67', 'H.265+'] },
];

async function main() {
  const rows = await prisma.siteSettings.findMany({ where: { key: { startsWith: 'promo_' } } });
  const byKey = Object.fromEntries(rows.map((r) => [r.key, r.value]));

  // Already migrated — don't clobber any edits made via the new admin UI.
  if (byKey.promo_ezviz_cameras || byKey.promo_tvt_cameras) {
    console.log('promo_ezviz_cameras / promo_tvt_cameras already present — skipping migration.');
    return;
  }

  const realName = (v) => (v && /[a-zA-Zа-яА-Я0-9]/.test(v) ? v : '');

  const ezviz = EZVIZ_DEFAULTS.map((def, i) => ({
    ...def,
    image: byKey[`promo_ezviz_${i}`] || '',
    name: realName(byKey[`promo_ezviz_${i}_name`]) || def.name,
  }));
  const tvt = TVT_DEFAULTS.map((def, i) => ({
    ...def,
    image: byKey[`promo_tvt_${i}`] || '',
    name: realName(byKey[`promo_tvt_${i}_name`]) || def.name,
  }));

  await prisma.siteSettings.upsert({
    where: { key: 'promo_ezviz_cameras' },
    update: { value: JSON.stringify(ezviz) },
    create: { key: 'promo_ezviz_cameras', value: JSON.stringify(ezviz) },
  });
  await prisma.siteSettings.upsert({
    where: { key: 'promo_tvt_cameras' },
    update: { value: JSON.stringify(tvt) },
    create: { key: 'promo_tvt_cameras', value: JSON.stringify(tvt) },
  });

  console.log('Migrated:');
  console.log('promo_ezviz_cameras', JSON.stringify(ezviz, null, 2));
  console.log('promo_tvt_cameras', JSON.stringify(tvt, null, 2));
}

main().finally(() => prisma.$disconnect());
