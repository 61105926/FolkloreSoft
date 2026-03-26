import { Injectable, NotFoundException, ConflictException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const USER_SELECT = {
  id: true, nombre: true, email: true, rol: true, activo: true,
  sucursalId: true, createdAt: true, updatedAt: true,
  sucursal: { select: { id: true, nombre: true, ciudad: true } },
} as const;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.prisma.user.findUnique({ where: { id } });
  }

  async findAll() {
    return this.prisma.user.findMany({
      where: { rol: { not: 'SUPERADMIN' } },
      select: USER_SELECT,
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data: { nombre: string; email: string; password: string; rol?: string; sucursalId?: number }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password_hash,
        rol: (data.rol as any) ?? 'VENDEDOR',
        sucursalId: data.sucursalId ?? null,
      },
      select: USER_SELECT,
    });
  }

  async update(id: number, data: {
    nombre?: string; email?: string; rol?: string;
    activo?: boolean; password?: string; sucursalId?: number | null;
  }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    if (user.rol === 'SUPERADMIN') throw new ForbiddenException('No se puede modificar este usuario');

    const updateData: Record<string, unknown> = {};
    if (data.nombre    !== undefined) updateData.nombre    = data.nombre;
    if (data.email     !== undefined) updateData.email     = data.email;
    if (data.rol       !== undefined) updateData.rol       = data.rol;
    if (data.activo    !== undefined) updateData.activo    = data.activo;
    if ('sucursalId'   in data)       updateData.sucursalId = data.sucursalId ?? null;
    if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.update({ where: { id }, data: updateData, select: USER_SELECT });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    if (user.rol === 'SUPERADMIN') throw new ForbiddenException('No se puede eliminar este usuario');
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
      select: USER_SELECT,
    });
  }
}
