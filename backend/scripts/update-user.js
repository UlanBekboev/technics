process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const { PrismaPg } = require('@prisma/adapter-pg');
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const adapter = new PrismaPg({ connectionString: 'postgresql://postgres:AJgHnGNePVlFIsWCYYkGnrUmBhbvDHnJ@viaduct.proxy.rlwy.net:53365/railway' });
const prisma = new PrismaClient({ adapter });

const NEW_NAME     = 'Улан';
const NEW_PASSWORD = process.argv[2]; // передаётся аргументом: node update-user.js МойПароль

async function main() {
  const data = { name: NEW_NAME };

  if (NEW_PASSWORD) {
    data.password = await bcrypt.hash(NEW_PASSWORD, 10);
    console.log('Пароль будет обновлён.');
  }

  const user = await prisma.user.update({
    where: { email: 'ubekboouulu@gmail.com' },
    data,
    select: { id: true, email: true, name: true, role: true },
  });
  console.log('Готово:', user);
}

main().catch(e => console.error(e.message)).finally(() => prisma.$disconnect());
