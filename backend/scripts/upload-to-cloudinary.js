process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { v2: cloudinary } = require('cloudinary');
const { PrismaPg }       = require('@prisma/adapter-pg');
const { PrismaClient }   = require('@prisma/client');
const fs   = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: 'ddoloafbp',
  api_key:    '811795714155685',
  api_secret: 'rOzh4bUMFi3BAySzqSytFeG6ucs',
});

const DATABASE_URL   = 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway';
const LOCAL_IMG_DIR  = path.resolve(__dirname, '../../frontend/public');

const adapter = new PrismaPg({ connectionString: DATABASE_URL });
const prisma  = new PrismaClient({ adapter });

function uploadFile(localPath, publicId) {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload(localPath, {
      public_id:     `technics/products/${publicId}`,
      overwrite:     false,
      resource_type: 'image',
      quality:       'auto',
      fetch_format:  'auto',
    }, (err, result) => {
      if (err) return reject(err);
      resolve(result.secure_url);
    });
  });
}

async function main() {
  const images = await prisma.productImage.findMany();
  console.log(`\nTotal images in DB: ${images.length}`);

  const toUpload = images.filter(i => !i.url.startsWith('https://res.cloudinary.com'));
  console.log(`Need to upload: ${toUpload.length}\n`);

  let uploaded = 0, missing = 0, errors = 0;

  for (const img of toUpload) {
    const rel       = img.url.startsWith('/') ? img.url.slice(1) : img.url;
    const localPath = path.join(LOCAL_IMG_DIR, rel);
    const publicId  = path.basename(rel, path.extname(rel));

    if (!fs.existsSync(localPath)) {
      process.stdout.write(`[skip] ${path.basename(rel)}\n`);
      missing++;
      continue;
    }

    try {
      process.stdout.write(`  [${uploaded + 1}/${toUpload.length}] ${path.basename(rel)} ... `);
      const url = await uploadFile(localPath, publicId);
      await prisma.productImage.update({ where: { id: img.id }, data: { url } });
      process.stdout.write(`✓\n`);
      uploaded++;
    } catch (e) {
      process.stdout.write(`✗ ${e.message}\n`);
      errors++;
    }
  }

  console.log(`\n✅ Done: uploaded=${uploaded}  missing=${missing}  errors=${errors}`);
  await prisma.$disconnect();
}

main().catch(e => { console.error(e); process.exit(1); });
