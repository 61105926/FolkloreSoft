import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoEvento, TipoEvento } from '@prisma/client';

const INCLUDE_EVENTO = {
  sucursal: { select: { id: true, nombre: true, ciudad: true } },
  _count: { select: { contratos: true } },
} as const;

@Injectable()
export class EventosService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.eventoFolclorico.findMany({
      include: INCLUDE_EVENTO,
      orderBy: { fecha_inicio: 'desc' },
    });
  }

  async findOne(id: number) {
    const e = await this.prisma.eventoFolclorico.findUnique({
      where: { id },
      include: INCLUDE_EVENTO,
    });
    if (!e) throw new NotFoundException(`Evento #${id} no encontrado`);
    return e;
  }

  create(data: {
    nombre: string;
    descripcion?: string;
    tipo?: TipoEvento;
    estado?: EstadoEvento;
    fecha_inicio: string;
    fecha_fin?: string;
    lugar?: string;
    sucursalId?: number;
  }) {
    return this.prisma.eventoFolclorico.create({
      data: {
        nombre: data.nombre,
        descripcion: data.descripcion,
        tipo: data.tipo ?? TipoEvento.FESTIVAL,
        estado: data.estado ?? EstadoEvento.PLANIFICADO,
        fecha_inicio: new Date(data.fecha_inicio),
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
        lugar: data.lugar,
        sucursalId: data.sucursalId,
      },
      include: INCLUDE_EVENTO,
    });
  }

  async update(id: number, data: {
    nombre?: string;
    descripcion?: string;
    tipo?: TipoEvento;
    estado?: EstadoEvento;
    fecha_inicio?: string;
    fecha_fin?: string | null;
    lugar?: string;
    sucursalId?: number | null;
  }) {
    await this.findOne(id);
    return this.prisma.eventoFolclorico.update({
      where: { id },
      data: {
        ...data,
        fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
        fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : data.fecha_fin === null ? null : undefined,
      },
      include: INCLUDE_EVENTO,
    });
  }

  async remove(id: number) {
    await this.findOne(id);
    return this.prisma.eventoFolclorico.delete({ where: { id } });
  }
}
