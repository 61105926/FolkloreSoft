import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { ImagenAutoService } from './imagen-auto.service.js';

@Injectable()
export class CatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagenAuto: ImagenAutoService,
  ) { }

  // ── Conjuntos ──
  findAllConjuntos() {
    return this.prisma.conjunto.findMany({
      where: { activo: true },
      include: {
        componentes: { include: { componente: true } },
        variaciones: {
          where: { activa: true },
          include: { instancias: { include: { sucursal: true } } },
        },
      },
      orderBy: { nombre: 'asc' },
    });
  }

  async findConjunto(id: number) {
    const c = await this.prisma.conjunto.findUnique({
      where: { id },
      include: {
        componentes: { include: { componente: true } },
        variaciones: {
          where: { activa: true },
          include: { instancias: { include: { sucursal: true } } },
        },
      },
    });
    if (!c || !c.activo) throw new NotFoundException(`Conjunto #${id} no encontrado`);
    return c;
  }

  async createConjunto(data: {
    codigo?: string;
    nombre: string;
    danza: string;
    genero?: string;
    descripcion?: string;
    imagen_url?: string;
    precio_base: number;
    precio_venta?: number;
    disponible_venta?: boolean;
    disponible_alquiler?: boolean;
    componentes?: {
      componenteId: number;
      cantidad: number;
      es_obligatorio?: boolean;
      es_intercambiable?: boolean;
      orden_ensamblaje?: number;
    }[];
    variaciones?: {
      codigo_variacion: string;
      nombre_variacion: string;
      talla?: string;
      color?: string;
      estilo?: string;
      precio_venta?: number;
      precio_alquiler?: number;
    }[];
  }) {
    const { componentes, variaciones, ...rest } = data;
    const imagen_url = await this.imagenAuto.resolverImagen(data.nombre, data.danza, data.imagen_url ?? undefined);
    return this.prisma.conjunto.create({
      data: {
        ...rest,
        imagen_url: imagen_url ?? undefined,
        componentes: componentes ? { create: componentes } : undefined,
        variaciones: variaciones ? { create: variaciones } : undefined,
      },
      include: {
        componentes: { include: { componente: true } },
      },
    });
  }

  updateConjunto(id: number, data: {
    codigo?: string;
    nombre?: string;
    danza?: string;
    genero?: string;
    descripcion?: string;
    imagen_url?: string;
    precio_base?: number;
    precio_venta?: number;
    disponible_venta?: boolean;
    disponible_alquiler?: boolean;
    activo?: boolean;
  }) {
    return this.prisma.conjunto.update({ where: { id }, data });
  }

  // Soft delete (desactivar)
  removeConjunto(id: number) {
    return this.prisma.conjunto.update({ where: { id }, data: { activo: false } });
  }

  // Full replace of component associations for a conjunto
  async updateComponentes(conjuntoId: number, componentes: { componenteId: number; cantidad: number }[]) {
    await this.prisma.conjuntoComponente.deleteMany({ where: { conjuntoId } });
    if (componentes.length > 0) {
      await this.prisma.conjuntoComponente.createMany({
        data: componentes.map((c) => ({ conjuntoId, componenteId: c.componenteId, cantidad: c.cantidad })),
      });
    }
    return this.findConjunto(conjuntoId);
  }

  // ── Variaciones ──
  createVariacion(conjuntoId: number, data: {
    codigo_variacion: string;
    nombre_variacion: string;
    talla?: string;
    color?: string;
    estilo?: string;
    precio_venta?: number;
    precio_alquiler?: number;
  }) {
    return this.prisma.variacionConjunto.create({
      data: { ...data, conjuntoId },
    });
  }

  updateVariacion(id: number, data: {
    nombre_variacion?: string;
    talla?: string;
    color?: string;
    estilo?: string;
    precio_venta?: number;
    precio_alquiler?: number;
    activa?: boolean;
  }) {
    return this.prisma.variacionConjunto.update({ where: { id }, data });
  }

  removeVariacion(id: number) {
    return this.prisma.variacionConjunto.update({ where: { id }, data: { activa: false } });
  }

  // ── Componentes ──
  findAllComponentes() {
    return this.prisma.componente.findMany({
      orderBy: { tipo: 'asc' },
      include: {
        _count: { select: { conjuntos: true, instancias: true } },
      },
    });
  }

  async findComponente(id: number) {
    const c = await this.prisma.componente.findUnique({
      where: { id },
      include: {
        _count: { select: { conjuntos: true, instancias: true } },
        conjuntos: { include: { conjunto: { select: { id: true, nombre: true, danza: true } } } },
      },
    });
    if (!c) throw new NotFoundException(`Componente #${id} no encontrado`);
    return c;
  }

  createComponente(data: { nombre: string; tipo: string; descripcion?: string }) {
    return this.prisma.componente.create({ data });
  }

  updateComponente(id: number, data: { nombre?: string; tipo?: string; descripcion?: string }) {
    return this.prisma.componente.update({ where: { id }, data });
  }

  removeComponente(id: number) {
    return this.prisma.componente.delete({ where: { id } });
  }
}
