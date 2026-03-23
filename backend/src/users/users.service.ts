import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '@prisma/client';
import * as bcrypt from 'bcrypt';

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
      select: {
        id: true,
        nombre: true,
        email: true,
        rol: true,
        activo: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async create(data: { nombre: string; email: string; password: string; rol?: string }) {
    const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
    if (exists) throw new ConflictException('El email ya está registrado');

    const password_hash = await bcrypt.hash(data.password, 10);
    return this.prisma.user.create({
      data: {
        nombre: data.nombre,
        email: data.email,
        password_hash,
        rol: (data.rol as any) ?? 'VENDEDOR',
      },
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true, updatedAt: true },
    });
  }

  async update(id: number, data: { nombre?: string; email?: string; rol?: string; activo?: boolean; password?: string }) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);

    const updateData: Record<string, unknown> = {};
    if (data.nombre !== undefined) updateData.nombre = data.nombre;
    if (data.email !== undefined) updateData.email = data.email;
    if (data.rol !== undefined) updateData.rol = data.rol;
    if (data.activo !== undefined) updateData.activo = data.activo;
    if (data.password) updateData.password_hash = await bcrypt.hash(data.password, 10);

    return this.prisma.user.update({
      where: { id },
      data: updateData,
      select: { id: true, nombre: true, email: true, rol: true, activo: true, createdAt: true, updatedAt: true },
    });
  }

  async remove(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) throw new NotFoundException(`Usuario #${id} no encontrado`);
    return this.prisma.user.update({
      where: { id },
      data: { activo: false },
      select: { id: true, nombre: true, email: true, rol: true, activo: true },
    });
  }
}
