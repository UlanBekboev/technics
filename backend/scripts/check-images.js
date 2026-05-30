process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const total = await prisma.productImage.count();
  const cloudinary = await prisma.productImage.count({ where: { url: { startsWith: 'https://res.cloudinary.com' } } });
  const local = await prisma.productImage.count({ where: { url: { startsWith: '/products' } } });
  const other = total - cloudinary - local;

  console.log(`Total images:    ${total}`);
  console.log(`Cloudinary URLs: ${cloudinary}`);
  console.log(`Local /products: ${local}`);
  console.log(`Other URLs:      ${other}`);

  // Show 3 samples of each type
  const samples = await prisma.productImage.findMany({ take: 3 });
  console.log('\nSamples:');
  samples.forEach(i => console.log(' ', i.url));

  if (other > 0) {
    const otherSamples = await prisma.productImage.findMany({
      where: { AND: [{ url: { not: { startsWith: 'https://res.cloudinary.com' } } }, { url: { not: { startsWith: '/products' } } }] },
      take: 3
    });
    console.log('\nOther URL samples:');
    otherSamples.forEach(i => console.log(' ', i.url));
  }
}

main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
