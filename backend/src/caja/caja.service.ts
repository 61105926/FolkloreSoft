import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';

@Injectable()
export class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  // ── List movimientos ──────────────────────────────────────────────────────

  findAll(params?: {
    fechaDesde?: string;
    fechaHasta?: string;
    tipo?: TipoMovimiento;
    concepto?: ConceptoCaja;
    formaPago?: FormaPago;
    contratoId?: number;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.tipo) where['tipo'] = params.tipo;
    if (params?.concepto) where['concepto'] = params.concepto;
    if (params?.formaPago) where['forma_pago'] = params.formaPago;
    if (params?.contratoId) where['contratoId'] = params.contratoId;
    if (params?.fechaDesde || params?.fechaHasta) {
      where['createdAt'] = {
        ...(params.fechaDesde ? { gte: new Date(params.fechaDesde) } : {}),
        ...(params.fechaHasta ? { lte: new Date(params.fechaHasta + 'T23:59:59') } : {}),
      };
    }
    return this.prisma.movimientoCaja.findMany({
      where,
      include: {
        contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async stats() {
    const hoy = new Date();
    const inicioDia   = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(inicioDia);
    inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    const [todosHoy, todosSemana, todosMes, todosIngresos] = await Promise.all([
      this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioDia } } }),
      this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioSemana } } }),
      this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioMes } } }),
      this.prisma.movimientoCaja.findMany({
        where: { tipo: 'INGRESO' },
        select: { concepto: true, monto: true },
      }),
    ]);

    const sumar = (movs: typeof todosHoy, tipo: TipoMovimiento) =>
      movs.filter((m) => m.tipo === tipo).reduce((s, m) => s + Number(m.monto), 0);

    const porFormaPago = (movs: typeof todosHoy, tipo: TipoMovimiento) => {
      const map: Record<string, number> = {};
      movs.filter((m) => m.tipo === tipo).forEach((m) => {
        map[m.forma_pago] = (map[m.forma_pago] ?? 0) + Number(m.monto);
      });
      return map;
    };

    const sumarConcepto = (conceptos: ConceptoCaja[]) =>
      todosIngresos
        .filter((m) => conceptos.includes(m.concepto))
        .reduce((s, m) => s + Number(m.monto), 0);

    return {
      hoy: {
        ingresos:    sumar(todosHoy, 'INGRESO'),
        egresos:     sumar(todosHoy, 'EGRESO'),
        balance:     sumar(todosHoy, 'INGRESO') - sumar(todosHoy, 'EGRESO'),
        porFormaPago: porFormaPago(todosHoy, 'INGRESO'),
      },
      semana: {
        ingresos: sumar(todosSemana, 'INGRESO'),
        egresos:  sumar(todosSemana, 'EGRESO'),
        balance:  sumar(todosSemana, 'INGRESO') - sumar(todosSemana, 'EGRESO'),
      },
      mes: {
        ingresos: sumar(todosMes, 'INGRESO'),
        egresos:  sumar(todosMes, 'EGRESO'),
        balance:  sumar(todosMes, 'INGRESO') - sumar(todosMes, 'EGRESO'),
      },
      totales: {
        anticipo:  sumarConcepto(['ANTICIPO_CONTRATO']),
        garantia:  sumarConcepto(['GARANTIA_EFECTIVO']),
        saldo:     sumarConcepto(['PAGO_SALDO_CONTRATO', 'DEUDA_COBRADA']),
      },
    };
  }

  // ── Cuentas por cobrar ────────────────────────────────────────────────────

  async cuentasPorCobrar() {
    const contratos = await this.prisma.contratoAlquiler.findMany({
      where: { estado: { notIn: ['CERRADO', 'CANCELADO'] } },
      select: {
        id: true, codigo: true, estado: true, fecha_devolucion: true,
        total: true, total_pagado: true, anticipo: true,
        cliente: { select: { id: true, nombre: true, celular: true } },
      },
      orderBy: { fecha_devolucion: 'asc' },
    });
    // Keep only those with outstanding debt
    return contratos.filter((c) => Number(c.total) - Number(c.total_pagado) > 0.01);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  create(data: {
    tipo: TipoMovimiento;
    concepto: ConceptoCaja;
    monto: number;
    descripcion?: string;
    forma_pago?: FormaPago;
    referencia?: string;
    contratoId?: number;
  }) {
    return this.prisma.movimientoCaja.create({
      data: {
        tipo:        data.tipo,
        concepto:    data.concepto,
        monto:       data.monto,
        descripcion: data.descripcion,
        forma_pago:  data.forma_pago ?? 'EFECTIVO',
        referencia:  data.referencia,
        contratoId:  data.contratoId ?? null,
      },
      include: {
        contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
      },
    });
  }

  // ── Remove ────────────────────────────────────────────────────────────────

  async remove(id: number) {
    const m = await this.prisma.movimientoCaja.findUnique({ where: { id } });
    if (!m) throw new NotFoundException(`Movimiento #${id} no encontrado`);
    return this.prisma.movimientoCaja.delete({ where: { id } });
  }
}
