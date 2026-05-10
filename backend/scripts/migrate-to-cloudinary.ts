/**
 * Uploads all local product images (frontend/public/products/*.jpg)
 * to Cloudinary and updates the DB image URLs.
 *
 * Usage:
 *   CLOUDINARY_CLOUD_NAME=xxx CLOUDINARY_API_KEY=yyy CLOUDINARY_API_SECRET=zzz \
 *   npx ts-node --project tsconfig.json -r tsconfig-paths/register scripts/migrate-to-cloudinary.ts
 */
import * as fs from 'fs';
import * as path from 'path';
import { v2 as cloudinary } from 'cloudinary';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';

const IMAGES_DIR = path.resolve(__dirname, '../../frontend/public/products');

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL || 'postgresql://postgres:yandexpraktikum@localhost:5432/technics' });
const prisma = new PrismaClient({ adapter } as any);

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function sleep(ms: number) { return new Promise(r => setTimeout(r, ms)); }

async function main() {
  const files = fs.readdirSync(IMAGES_DIR).filter(f => f.endsWith('.jpg') || f.endsWith('.png') || f.endsWith('.webp'));
  console.log(`📦 Найдено файлов: ${files.length}\n`);

  let ok = 0, fail = 0, skip = 0;

  for (const file of files) {
    const slug = file.replace(/\.(jpg|png|webp)$/, '');
    const filepath = path.join(IMAGES_DIR, file);

    // Find product image in DB
    const img = await prisma.productImage.findFirst({
      where: { url: `/products/${file}` },
    });

    if (!img) { skip++; continue; }

    // Already migrated?
    if (img.url.includes('cloudinary.com') || img.url.includes('res.cloudinary')) {
      skip++;
      continue;
    }

    process.stdout.write(`Uploading ${file}... `);
    try {
      const result = await cloudinary.uploader.upload(filepath, {
        public_id: `technics/products/${slug}`,
        overwrite: true,
        folder: '',
      });

      await prisma.productImage.update({
        where: { id: img.id },
        data: { url: result.secure_url },
      });

      console.log(`✅ ${result.secure_url}`);
      ok++;
    } catch (e: any) {
      console.log(`❌ ${e.message}`);
      fail++;
    }

    await sleep(200);
  }

  console.log(`\n✅ Загружено: ${ok}`);
  console.log(`❌ Ошибки:   ${fail}`);
  console.log(`⏭  Пропущено: ${skip}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
