import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const password_hash = await bcrypt.hash('password123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@folcklore.com' },
    update: {},
    create: {
      email: 'admin@folcklore.com',
      password_hash,
      rol: 'ADMIN',
    },
  });

  console.log('Seed complete: admin@folcklore.com / password123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
