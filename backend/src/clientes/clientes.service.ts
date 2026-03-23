import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

@Injectable()
export class ClientesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cliente.findMany({
      orderBy: { nombre: 'asc' },
      include: { _count: { select: { contratos: true } } },
    });
  }

  async findOne(id: number) {
    const c = await this.prisma.cliente.findUnique({
      where: { id },
      include: { _count: { select: { contratos: true } } },
    });
    if (!c) throw new NotFoundException(`Cliente #${id} no encontrado`);
    return c;
  }

  create(data: { nombre: string; celular?: string; ci?: string; email?: string; rol?: string }) {
    return this.prisma.cliente.create({ data });
  }

  async update(id: number, data: { nombre?: string; celular?: string; ci?: string; email?: string; rol?: string }) {
    await this.findOne(id);
    return this.prisma.cliente.update({ where: { id }, data });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.cliente.delete({ where: { id } });
  }
}
