process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway' });
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany({
    select: { id: true, email: true, name: true, role: true, createdAt: true },
    orderBy: { createdAt: 'asc' },
  });
  console.log(`\nTotal users: ${users.length}\n`);
  users.forEach(u => console.log(`[${u.role}] id=${u.id}  ${u.email}  "${u.name}"  (${u.createdAt.toLocaleDateString()})`));
}

main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
