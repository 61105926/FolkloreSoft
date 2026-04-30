import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoVenta, FormaPago } from '@prisma/client';

const INCLUDE_FULL = {
  cliente: true,
  sucursal: { select: { id: true, nombre: true, ciudad: true, direccion: true, telefono: true, email: true } },
  items: {
    include: {
      conjunto: { select: { id: true, nombre: true, danza: true } },
      variacion: { select: { id: true, nombre_variacion: true, talla: true, color: true } },
    },
    orderBy: { id: 'asc' as const },
  },
  movimientosCaja: { orderBy: { createdAt: 'desc' as const } },
} as const;

const INCLUDE_LIST = {
  cliente: { select: { id: true, nombre: true, celular: true } },
  _count: { select: { items: true } },
} as const;

@Injectable()
export class VentasService {
  constructor(private readonly prisma: PrismaService) {}

  private async generarCodigo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.venta.count();
    return `VENTA-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  findAll(filter?: { isAdmin?: boolean; sucursalId?: number }) {
    const where: Record<string, unknown> = {};
    if (!filter?.isAdmin && filter?.sucursalId) {
      where['sucursalId'] = filter.sucursalId;
    }
    return this.prisma.venta.findMany({
      where,
      include: INCLUDE_LIST,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const v = await this.prisma.venta.findUnique({ where: { id }, include: INCLUDE_FULL });
    if (!v) throw new NotFoundException(`Venta #${id} no encontrada`);
    return v;
  }

  async create(body: any, user: any) {
    const { clienteId, sucursalId, items = [], forma_pago, observaciones, descuento } = body;

    if (!clienteId) throw new BadRequestException('clienteId es requerido');
    if (!items.length) throw new BadRequestException('Se requiere al menos un ítem');

    const codigo = await this.generarCodigo();

    const itemsCalc = items.map((it: any) => ({
      descripcion: it.descripcion ?? '',
      conjuntoId: it.conjuntoId ?? null,
      variacionId: it.variacionId ?? null,
      cantidad: Number(it.cantidad ?? 1),
      precio_unit: Number(it.precio_unit ?? 0),
      subtotal: Number(it.cantidad ?? 1) * Number(it.precio_unit ?? 0),
    }));

    const subtotalItems = itemsCalc.reduce((s: number, it: any) => s + it.subtotal, 0);
    const desc = Number(descuento ?? 0);
    const total = Math.max(0, subtotalItems - desc);

    return this.prisma.venta.create({
      data: {
        codigo,
        clienteId: Number(clienteId),
        sucursalId: sucursalId ? Number(sucursalId) : (user.sucursalId ?? null),
        userId: user.id ?? null,
        forma_pago: forma_pago ?? null,
        observaciones: observaciones?.trim() || null,
        descuento: desc,
        total,
        total_pagado: 0,
        items: { create: itemsCalc },
      },
      include: INCLUDE_FULL,
    });
  }

  async update(id: number, body: any) {
    await this.findOne(id);
    const { items, clienteId, observaciones, descuento, forma_pago } = body;

    if (items !== undefined) {
      await this.prisma.ventaItem.deleteMany({ where: { ventaId: id } });

      const itemsCalc = items.map((it: any) => ({
        ventaId: id,
        descripcion: it.descripcion ?? '',
        conjuntoId: it.conjuntoId ?? null,
        variacionId: it.variacionId ?? null,
        cantidad: Number(it.cantidad ?? 1),
        precio_unit: Number(it.precio_unit ?? 0),
        subtotal: Number(it.cantidad ?? 1) * Number(it.precio_unit ?? 0),
      }));

      await this.prisma.ventaItem.createMany({ data: itemsCalc });

      const subtotalItems = itemsCalc.reduce((s: number, it: any) => s + it.subtotal, 0);
      const desc = Number(descuento ?? 0);
      const total = Math.max(0, subtotalItems - desc);

      await this.prisma.venta.update({
        where: { id },
        data: {
          clienteId: clienteId ? Number(clienteId) : undefined,
          observaciones: observaciones?.trim() ?? undefined,
          descuento: desc,
          total,
          forma_pago: forma_pago ?? undefined,
        },
      });
    } else {
      await this.prisma.venta.update({
        where: { id },
        data: {
          clienteId: clienteId ? Number(clienteId) : undefined,
          observaciones: observaciones?.trim() ?? undefined,
          forma_pago: forma_pago ?? undefined,
        },
      });
    }

    return this.findOne(id);
  }

  async registrarPago(id: number, body: any, user: any) {
    const venta = await this.findOne(id);
    if (venta.estado === 'CANCELADO') throw new BadRequestException('Venta cancelada');

    const monto = Number(body.monto ?? 0);
    const forma_pago: FormaPago = body.forma_pago ?? 'EFECTIVO';
    if (monto <= 0) throw new BadRequestException('Monto debe ser mayor a 0');

    const nuevoPagado = Number(venta.total_pagado) + monto;
    const nuevoEstado: EstadoVenta = nuevoPagado >= Number(venta.total) ? 'PAGADO' : venta.estado;

    const [ventaUpd] = await this.prisma.$transaction([
      this.prisma.venta.update({
        where: { id },
        data: { total_pagado: nuevoPagado, estado: nuevoEstado, forma_pago },
        include: INCLUDE_FULL,
      }),
      this.prisma.movimientoCaja.create({
        data: {
          tipo: 'INGRESO',
          concepto: 'VENTA_COBRO',
          monto,
          forma_pago,
          descripcion: `Pago venta ${venta.codigo}`,
          ventaId: id,
          userId: user.id ?? null,
          sucursalId: venta.sucursalId ?? null,
        },
      }),
    ]);

    return ventaUpd;
  }

  async entregar(id: number) {
    const venta = await this.findOne(id);
    if (venta.estado !== 'PAGADO') throw new BadRequestException('La venta debe estar pagada antes de entregar');
    return this.prisma.venta.update({ where: { id }, data: { estado: 'ENTREGADO' }, include: INCLUDE_FULL });
  }

  async cancelar(id: number) {
    const venta = await this.findOne(id);
    if (venta.estado === 'ENTREGADO') throw new BadRequestException('No se puede cancelar una venta ya entregada');

    const ops: any[] = [
      this.prisma.venta.update({ where: { id }, data: { estado: 'CANCELADO' }, include: INCLUDE_FULL }),
    ];

    // Si tiene pagos, generar egreso de devolución
    if (Number(venta.total_pagado) > 0) {
      ops.push(
        this.prisma.movimientoCaja.create({
          data: {
            tipo: 'EGRESO',
            concepto: 'VENTA_DEVOLUCION',
            monto: Number(venta.total_pagado),
            forma_pago: venta.forma_pago ?? 'EFECTIVO',
            descripcion: `Devolución por cancelación de venta ${venta.codigo}`,
            ventaId: id,
            sucursalId: venta.sucursalId ?? null,
          },
        }),
      );
    }

    const [ventaUpd] = await this.prisma.$transaction(ops);
    return ventaUpd;
  }

  async remove(id: number) {
    const venta = await this.findOne(id);
    if (!['PENDIENTE', 'CANCELADO'].includes(venta.estado)) {
      throw new BadRequestException('Solo se pueden eliminar ventas en estado PENDIENTE o CANCELADO');
    }
    await this.prisma.venta.delete({ where: { id } });
    return { ok: true };
  }
}
