import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';

const MOV_INCLUDE = {
  contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
  user:     { select: { id: true, nombre: true, rol: true } },
  sucursal: { select: { id: true, nombre: true } },
} as const;

@Injectable()
export class CajaService {
  constructor(private readonly prisma: PrismaService) {}

  // ── List movimientos ──────────────────────────────────────────────────────

  findAll(params?: {
    fechaDesde?: string; fechaHasta?: string;
    tipo?: TipoMovimiento; concepto?: ConceptoCaja; formaPago?: FormaPago;
    contratoId?: number;
    // scope filter (non-admin)
    userId?: number; sucursalId?: number; isAdmin?: boolean;
  }) {
    const where: Record<string, unknown> = {};
    if (params?.tipo)       where['tipo']       = params.tipo;
    if (params?.concepto)   where['concepto']   = params.concepto;
    if (params?.formaPago)  where['forma_pago'] = params.formaPago;
    if (params?.contratoId) where['contratoId'] = params.contratoId;
    if (params?.fechaDesde || params?.fechaHasta) {
      where['createdAt'] = {
        ...(params.fechaDesde ? { gte: new Date(params.fechaDesde) } : {}),
        ...(params.fechaHasta ? { lte: new Date(params.fechaHasta + 'T23:59:59') } : {}),
      };
    }
    // Non-admin: filter by sucursal (if assigned) or by user
    if (!params?.isAdmin) {
      if (params?.sucursalId) where['sucursalId'] = params.sucursalId;
      else if (params?.userId) where['userId'] = params.userId;
    }
    return this.prisma.movimientoCaja.findMany({
      where, include: MOV_INCLUDE, orderBy: { createdAt: 'desc' },
    });
  }

  // ── Stats ─────────────────────────────────────────────────────────────────

  async stats(filter?: { userId?: number; sucursalId?: number; isAdmin?: boolean }) {
    const hoy = new Date();
    const inicioDia    = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
    const inicioSemana = new Date(inicioDia);
    inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
    const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);

    // Scope filter
    const scope: Record<string, unknown> = {};
    if (!filter?.isAdmin) {
      if (filter?.sucursalId) scope['sucursalId'] = filter.sucursalId;
      else if (filter?.userId) scope['userId']    = filter.userId;
    }

    const [todosHoy, todosSemana, todosMes, todosIngresos] = await Promise.all([
      this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioDia } } }),
      this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioSemana } } }),
      this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioMes } } }),
      this.prisma.movimientoCaja.findMany({ where: { ...scope, tipo: 'INGRESO' }, select: { concepto: true, monto: true } }),
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
      todosIngresos.filter((m) => conceptos.includes(m.concepto)).reduce((s, m) => s + Number(m.monto), 0);

    return {
      hoy: {
        ingresos: sumar(todosHoy, 'INGRESO'), egresos: sumar(todosHoy, 'EGRESO'),
        balance:  sumar(todosHoy, 'INGRESO') - sumar(todosHoy, 'EGRESO'),
        porFormaPago: porFormaPago(todosHoy, 'INGRESO'),
      },
      semana: {
        ingresos: sumar(todosSemana, 'INGRESO'), egresos: sumar(todosSemana, 'EGRESO'),
        balance:  sumar(todosSemana, 'INGRESO') - sumar(todosSemana, 'EGRESO'),
      },
      mes: {
        ingresos: sumar(todosMes, 'INGRESO'), egresos: sumar(todosMes, 'EGRESO'),
        balance:  sumar(todosMes, 'INGRESO') - sumar(todosMes, 'EGRESO'),
      },
      totales: {
        anticipo: sumarConcepto(['ANTICIPO_CONTRATO']),
        garantia: sumarConcepto(['GARANTIA_EFECTIVO']),
        saldo:    sumarConcepto(['PAGO_SALDO_CONTRATO', 'DEUDA_COBRADA']),
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
    return contratos.filter((c) => Number(c.total) - Number(c.total_pagado) > 0.01);
  }

  // ── Create ────────────────────────────────────────────────────────────────

  // Conceptos que cuentan como pago hacia el total del contrato
  private static readonly CONCEPTOS_PAGO: ConceptoCaja[] = [
    'ANTICIPO_CONTRATO',
    'PAGO_SALDO_CONTRATO',
    'DEUDA_COBRADA',
  ];

  async create(data: {
    tipo: TipoMovimiento; concepto: ConceptoCaja; monto: number;
    descripcion?: string; forma_pago?: FormaPago; referencia?: string;
    contratoId?: number; userId?: number; sucursalId?: number;
  }) {
    const movimiento = await this.prisma.movimientoCaja.create({
      data: {
        tipo:        data.tipo,
        concepto:    data.concepto,
        monto:       data.monto,
        descripcion: data.descripcion,
        forma_pago:  data.forma_pago ?? 'EFECTIVO',
        referencia:  data.referencia,
        contratoId:  data.contratoId  ?? null,
        userId:      data.userId      ?? null,
        sucursalId:  data.sucursalId  ?? null,
      },
      include: MOV_INCLUDE,
    });

    // Si es un pago vinculado a un contrato, actualizar total_pagado + registrar en historial
    if (
      data.contratoId &&
      data.tipo === 'INGRESO' &&
      CajaService.CONCEPTOS_PAGO.includes(data.concepto)
    ) {
      await this.prisma.contratoAlquiler.update({
        where: { id: data.contratoId },
        data: { total_pagado: { increment: data.monto } },
      });

      // Obtener nombre del usuario que registró
      const userName = movimiento.user?.nombre ?? 'Sistema';
      const formaPagoLabel = data.forma_pago ?? 'EFECTIVO';
      const conceptoLabel: Record<string, string> = {
        ANTICIPO_CONTRATO:    'Anticipo',
        PAGO_SALDO_CONTRATO:  'Pago de saldo',
        DEUDA_COBRADA:        'Deuda cobrada',
      };
      const label = conceptoLabel[data.concepto] ?? 'Pago';

      await this.prisma.contratoHistorial.create({
        data: {
          contratoId:  data.contratoId,
          tipo:        'PAGO_REGISTRADO',
          descripcion: `${label} de Bs. ${Number(data.monto).toFixed(2)} registrado en caja (${formaPagoLabel}) — cobrado por ${userName}`,
        },
      });
    }

    return movimiento;
  }

  // ── Remove ────────────────────────────────────────────────────────────────

  async remove(id: number) {
    const m = await this.prisma.movimientoCaja.findUnique({
      where: { id },
      include: { user: { select: { nombre: true } } },
    });
    if (!m) throw new NotFoundException(`Movimiento #${id} no encontrado`);

    // Revertir el pago del contrato si aplica
    if (
      m.contratoId &&
      m.tipo === 'INGRESO' &&
      CajaService.CONCEPTOS_PAGO.includes(m.concepto)
    ) {
      await this.prisma.contratoAlquiler.update({
        where: { id: m.contratoId },
        data: { total_pagado: { decrement: Number(m.monto) } },
      });
      await this.prisma.contratoHistorial.create({
        data: {
          contratoId:  m.contratoId,
          tipo:        'PAGO_REGISTRADO',
          descripcion: `Pago de Bs. ${Number(m.monto).toFixed(2)} eliminado de caja — anulado`,
        },
      });
    }

    return this.prisma.movimientoCaja.delete({ where: { id } });
  }

  // ── Recalcular total_pagado de todos los contratos ─────────────────────────
  // Suma todos los movimientos INGRESO vinculados (concepto de pago) y sobreescribe total_pagado.
  // Usar para sincronizar datos históricos desincronizados.

  async recalcularTodosPagados() {
    // Traer todos los contratos con sus movimientos de pago vinculados
    const contratos = await this.prisma.contratoAlquiler.findMany({
      select: { id: true, codigo: true, total_pagado: true },
    });

    const resultados: { id: number; codigo: string; antes: number; despues: number }[] = [];

    for (const c of contratos) {
      const movs = await this.prisma.movimientoCaja.findMany({
        where: {
          contratoId: c.id,
          tipo: 'INGRESO',
          concepto: { in: CajaService.CONCEPTOS_PAGO },
        },
        select: { monto: true },
      });

      const totalCaja = movs.reduce((s, m) => s + Number(m.monto), 0);

      await this.prisma.contratoAlquiler.update({
        where: { id: c.id },
        data: { total_pagado: totalCaja },
      });

      resultados.push({
        id: c.id,
        codigo: c.codigo,
        antes: Number(c.total_pagado),
        despues: totalCaja,
      });
    }

    return resultados;
  }
}
