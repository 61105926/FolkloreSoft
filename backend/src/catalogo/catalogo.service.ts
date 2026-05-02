import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library.js';
import { EstadoContrato } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service.js';
import { ImagenAutoService } from './imagen-auto.service.js';

@Injectable()
export class CatalogoService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly imagenAuto: ImagenAutoService,
  ) { }

  // ── Conjuntos ──
  private readonly ESTADOS_ACTIVOS: EstadoContrato[] = [
    EstadoContrato.RESERVADO,
    EstadoContrato.CONFIRMADO,
    EstadoContrato.ENTREGADO,
    EstadoContrato.EN_USO,
  ];

  private variacionInclude() {
    return {
      movimientosStock: { select: { cantidad: true } },
      contratoPrendas: {
        where: {
          contrato: {
            is: { estado: { in: this.ESTADOS_ACTIVOS } },
          },
        },
        select: { total: true },
      },
    };
  }

  findAllConjuntos() {
    return this.prisma.conjunto.findMany({
      where: { activo: true },
      include: {
        componentes: { include: { componente: true } },
        variaciones: {
          where: { activa: true },
          include: this.variacionInclude(),
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
          include: this.variacionInclude(),
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

    if (variaciones?.length) {
      const codigos = variaciones.map(v => v.codigo_variacion);
      const duplicados = codigos.filter((c, i) => codigos.indexOf(c) !== i);
      if (duplicados.length) {
        throw new BadRequestException(
          `Variaciones con código duplicado: ${[...new Set(duplicados)].join(', ')}`,
        );
      }
    }

    const imagen_url = await this.imagenAuto.resolverImagen(data.nombre, data.danza, data.imagen_url ?? undefined);
    try {
      return await this.prisma.conjunto.create({
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
    } catch (e) {
      if (e instanceof PrismaClientKnownRequestError && e.code === 'P2002') {
        throw new BadRequestException('Ya existe una variación con ese código para este conjunto');
      }
      throw e;
    }
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
  async createVariacion(conjuntoId: number, data: {
    codigo_variacion: string;
    nombre_variacion: string;
    talla?: string;
    color?: string;
    estilo?: string;
    precio_venta?: number;
    precio_alquiler?: number;
  }) {
    let codigo = data.codigo_variacion;
    const existentes = await this.prisma.variacionConjunto.findMany({
      where: { conjuntoId, codigo_variacion: { startsWith: codigo } },
      select: { codigo_variacion: true },
    });
    if (existentes.some((v) => v.codigo_variacion === codigo)) {
      const numeros = existentes
        .map((v) => { const m = v.codigo_variacion.match(/^.*-(\d+)$/); return m ? parseInt(m[1]) : 1; });
      codigo = `${data.codigo_variacion}-${Math.max(...numeros) + 1}`;
    }
    return this.prisma.variacionConjunto.create({
      data: { ...data, codigo_variacion: codigo, conjuntoId },
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
