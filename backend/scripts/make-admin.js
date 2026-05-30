process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const user = await prisma.user.update({
    where: { email: 'ubekboouulu@gmail.com' },
    data: { role: 'ADMIN' },
    select: { id: true, email: true, name: true, role: true },
  });
  console.log('Done:', user);
}

main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
