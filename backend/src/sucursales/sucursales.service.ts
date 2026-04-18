import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class SucursalesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
  }

  async findOne(id: number) {
    const s = await this.prisma.sucursal.findUnique({ where: { id } });
    if (!s) throw new NotFoundException(`Sucursal #${id} no encontrada`);
    return s;
  }

  create(data: { nombre: string; ciudad: string; direccion?: string; telefono?: string; email?: string }) {
    return this.prisma.sucursal.create({ data });
  }

  update(id: number, data: { nombre?: string; ciudad?: string; direccion?: string; telefono?: string; email?: string }) {
    return this.prisma.sucursal.update({ where: { id }, data });
  }

  remove(id: number) {
    return this.prisma.sucursal.delete({ where: { id } });
  }
}
