import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // ── Superadmin (propietario del sistema — no visible ni editable por nadie) ──
  const saHash = await bcrypt.hash('61105926', 10);
  await prisma.user.upsert({
    where: { email: 'nicolas90gabo@gmail.com' },
    update: {},
    create: { email: 'nicolas90gabo@gmail.com', nombre: 'Nicolás', password_hash: saHash, rol: 'SUPERADMIN' },
  });

  // ── Admin user ──
  const password_hash = await bcrypt.hash('password123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@folcklore.com' },
    update: {},
    create: { email: 'admin@folcklore.com', password_hash, rol: 'ADMIN' },
  });

  // ── Sucursales ──
  await prisma.sucursal.upsert({
    where: { id: 1 },
    update: {},
    create: { nombre: 'Sede Central La Paz', ciudad: 'La Paz', direccion: 'Av. 16 de Julio #1234' },
  });
  await prisma.sucursal.upsert({
    where: { id: 2 },
    update: {},
    create: { nombre: 'Sucursal Cochabamba', ciudad: 'Cochabamba', direccion: 'Av. Heroínas #567' },
  });

  console.log('✓ Seed completo: usuarios y sucursales.');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
