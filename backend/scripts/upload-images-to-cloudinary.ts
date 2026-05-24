/**
 * Uploads all local product images to Cloudinary and updates DB URLs.
 * Run: npx ts-node --esm scripts/upload-images-to-cloudinary.ts
 */
import { v2 as cloudinary } from 'cloudinary';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

// ── Config ─────────────────────────────────────────────────────────
const CLOUDINARY_CLOUD_NAME = 'ddoloafbp';
const CLOUDINARY_API_KEY    = '811795714155685';
const CLOUDINARY_API_SECRET = 'rOzh4bUMFi3BAySzqSytFeG6ucs';
const DATABASE_URL = 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway';

// Folder where frontend serves static images
const LOCAL_IMAGES_DIR = path.resolve(__dirname, '../../frontend/public');

cloudinary.config({
  cloud_name: CLOUDINARY_CLOUD_NAME,
  api_key:    CLOUDINARY_API_KEY,
  api_secret: CLOUDINARY_API_SECRET,
});

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma  = new PrismaClient({ adapter } as any);

async function uploadFile(localPath: string, publicId: string): Promise<string> {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(
      localPath,
      {
        public_id:     publicId,
        folder:        'technics/products',
        overwrite:     false,
        resource_type: 'image',
        quality:       'auto',
        fetch_format:  'auto',
      },
      (err, result) => {
        if (err) return reject(err);
        resolve(result!.secure_url);
      },
    );
  });
}

async function main() {
  const images = await prisma.productImage.findMany();
  console.log(`Total images in DB: ${images.length}`);

  let uploaded = 0, skipped = 0, missing = 0, errors = 0;

  for (const img of images) {
    // Skip already-uploaded Cloudinary URLs
    if (img.url.startsWith('https://res.cloudinary.com')) {
      skipped++;
      continue;
    }

    // Build local path: /products/foo.jpg → frontend/public/products/foo.jpg
    const relativePath = img.url.startsWith('/') ? img.url.slice(1) : img.url;
    const localPath    = path.join(LOCAL_IMAGES_DIR, relativePath);

    if (!fs.existsSync(localPath)) {
      console.warn(`  [MISSING] ${img.url}`);
      missing++;
      continue;
    }

    // Use filename without extension as public_id
    const publicId = path.basename(relativePath, path.extname(relativePath));

    try {
      process.stdout.write(`  Uploading ${path.basename(localPath)}... `);
      const cloudUrl = await uploadFile(localPath, publicId);
      await prisma.productImage.update({ where: { id: img.id }, data: { url: cloudUrl } });
      console.log(`✓`);
      uploaded++;
    } catch (e: any) {
      console.log(`✗ ${e.message}`);
      errors++;
    }
  }

  console.log(`\nDone! uploaded=${uploaded} skipped=${skipped} missing=${missing} errors=${errors}`);
  await prisma.$disconnect();
}

main().catch(err => { console.error(err); process.exit(1); });
