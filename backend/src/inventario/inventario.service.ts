import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimientoStock, EstadoInstanciaComponente } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Stock de variaciones ──────────────────────────────────────────────────

  /** Suma todos los movimientos de una variación para obtener el stock actual */
  async stockVariacion(variacionId: number): Promise<number> {
    const agg = await this.prisma.movimientoStock.aggregate({
      where: { variacionId },
      _sum: { cantidad: true },
    });
    return agg._sum.cantidad ?? 0;
  }

  /** Stock de todas las variaciones de un conjunto */
  async stockConjunto(conjuntoId: number) {
    const variaciones = await this.prisma.variacionConjunto.findMany({
      where: { conjuntoId, activa: true },
      select: { id: true, nombre_variacion: true, talla: true, color: true, estilo: true },
    });

    return Promise.all(
      variaciones.map(async (v) => ({
        ...v,
        stock: await this.stockVariacion(v.id),
      })),
    );
  }

  /** Stock de todos los conjuntos (resumen para dashboard) */
  async resumenStock() {
    const conjuntos = await this.prisma.conjunto.findMany({
      where: { activo: true },
      select: {
        id: true, nombre: true, danza: true, imagen_url: true,
        variaciones: {
          where: { activa: true },
          select: {
            id: true, nombre_variacion: true, talla: true, color: true,
            movimientosStock: { select: { cantidad: true } },
          },
        },
      },
      orderBy: [{ danza: 'asc' }, { nombre: 'asc' }],
    });

    return conjuntos.map((c) => ({
      id: c.id,
      nombre: c.nombre,
      danza: c.danza,
      imagen_url: c.imagen_url,
      variaciones: c.variaciones.map((v) => ({
        id: v.id,
        nombre_variacion: v.nombre_variacion,
        talla: v.talla,
        color: v.color,
        stock: v.movimientosStock.reduce((s, m) => s + m.cantidad, 0),
      })),
      stockTotal: c.variaciones.reduce(
        (s, v) => s + v.movimientosStock.reduce((sv, m) => sv + m.cantidad, 0),
        0,
      ),
    }));
  }

  // ── Movimientos de stock ──────────────────────────────────────────────────

  async getMovimientos(variacionId?: number) {
    return this.prisma.movimientoStock.findMany({
      where: variacionId ? { variacionId } : undefined,
      include: {
        variacion: {
          select: {
            id: true, nombre_variacion: true, talla: true,
            conjunto: { select: { id: true, nombre: true, danza: true } },
          },
        },
        user: { select: { id: true, nombre: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async registrarMovimiento(data: {
    variacionId: number;
    tipo: TipoMovimientoStock;
    cantidad: number; // siempre positivo, el tipo determina si suma o resta
    motivo?: string;
    userId?: number;
  }) {
    const variacion = await this.prisma.variacionConjunto.findUnique({
      where: { id: data.variacionId },
    });
    if (!variacion) throw new NotFoundException(`Variación #${data.variacionId} no encontrada`);

    // BAJA siempre se guarda como negativo
    const cantidadFinal =
      data.tipo === 'BAJA' ? -Math.abs(data.cantidad) : Math.abs(data.cantidad);

    return this.prisma.movimientoStock.create({
      data: {
        variacionId: data.variacionId,
        tipo: data.tipo,
        cantidad: cantidadFinal,
        motivo: data.motivo,
        userId: data.userId,
      },
      include: {
        variacion: {
          select: {
            id: true, nombre_variacion: true, talla: true,
            conjunto: { select: { id: true, nombre: true, danza: true } },
          },
        },
        user: { select: { id: true, nombre: true } },
      },
    });
  }

  async registrarMovimientoMasivo(items: {
    variacionId: number;
    tipo: TipoMovimientoStock;
    cantidad: number;
    motivo?: string;
  }[], userId?: number) {
    const creados = await this.prisma.$transaction(
      items.map((item) =>
        this.prisma.movimientoStock.create({
          data: {
            variacionId: item.variacionId,
            tipo: item.tipo,
            cantidad: item.tipo === 'BAJA' ? -Math.abs(item.cantidad) : Math.abs(item.cantidad),
            motivo: item.motivo,
            userId,
          },
        }),
      ),
    );
    return creados;
  }

  // ── Instancias de componentes (se mantiene para piezas sueltas) ───────────

  findAllInstanciasComponente(sucursalId?: number) {
    return this.prisma.instanciaComponente.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: { componente: true, sucursal: true },
      orderBy: { serial: 'asc' },
    });
  }

  createInstanciaComponente(data: {
    serial: string;
    talla?: string;
    componenteId: number;
    sucursalId: number;
    notas?: string;
  }) {
    return this.prisma.instanciaComponente.create({
      data,
      include: { componente: true, sucursal: true },
    });
  }

  updateEstadoComponente(id: number, estado: EstadoInstanciaComponente, notas?: string) {
    return this.prisma.instanciaComponente.update({
      where: { id },
      data: { estado, ...(notas !== undefined ? { notas } : {}) },
    });
  }

  // ── Stats para dashboard ──────────────────────────────────────────────────

  async statsDashboard() {
    const conjuntos = await this.prisma.conjunto.count({ where: { activo: true } });
    const variaciones = await this.prisma.variacionConjunto.count({ where: { activa: true } });

    const stockAgg = await this.prisma.movimientoStock.aggregate({
      _sum: { cantidad: true },
    });
    const stockTotal = stockAgg._sum.cantidad ?? 0;

    // Conjuntos con stock 0 (sin trajes)
    const resumen = await this.resumenStock();
    const sinStock = resumen.filter((c) => c.stockTotal === 0).length;

    return { conjuntos, variaciones, stockTotal, sinStock };
  }
}
