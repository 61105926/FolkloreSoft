import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoContrato } from '@prisma/client';

@Injectable()
export class BotService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Consultar reserva por CI o código ─────────────────────────────────────
  async consultarReserva(q: string) {
    const contrato = await this.prisma.contratoAlquiler.findFirst({
      where: {
        OR: [
          { codigo: { contains: q } },
          { cliente: { ci: q } },
          { cliente: { celular: { contains: q } } },
        ],
        estado: { notIn: [EstadoContrato.CANCELADO, EstadoContrato.CERRADO] },
      },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        codigo: true,
        estado: true,
        fecha_entrega: true,
        fecha_devolucion: true,
        total: true,
        total_pagado: true,
        nombre_evento_ext: true,
        evento: { select: { nombre: true } },
        cliente: { select: { nombre: true, celular: true } },
        prendas: {
          select: {
            modelo: true,
            total: true,
            subtotal: true,
            variacion: { select: { nombre_variacion: true, talla: true } },
          },
        },
        participantes: {
          select: { nombre: true, devuelto: true },
        },
        garantias: {
          select: { tipo: true, descripcion: true, valor: true, retenida: true },
        },
      },
    });
    return contrato;
  }

  // ── Cotización ─────────────────────────────────────────────────────────────
  async cotizar(conjuntoId: number, cantidad: number, dias: number) {
    const conjunto = await this.prisma.conjunto.findUnique({
      where: { id: conjuntoId },
      select: {
        nombre: true,
        danza: true,
        precio_base: true,
        imagen_url: true,
        variaciones: {
          select: {
            id: true,
            nombre_variacion: true,
            talla: true,
            movimientosStock: { select: { cantidad: true } },
          },
        },
      },
    });
    if (!conjunto) return null;
    const precioUnit = parseFloat(String(conjunto.precio_base));
    return {
      conjunto: conjunto.nombre,
      danza: conjunto.danza,
      imagen_url: conjunto.imagen_url,
      precio_unitario: precioUnit,
      cantidad,
      dias,
      subtotal: precioUnit * cantidad,
      anticipo_minimo: Math.ceil(precioUnit * cantidad * 0.3),
      variaciones: conjunto.variaciones,
    };
  }

  // ── Stats hoy (para reporte diario) ───────────────────────────────────────
  async statsHoy() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const manana = new Date(hoy);
    manana.setDate(manana.getDate() + 1);

    const [entregas, devoluciones, nuevasReservas, deudas] = await Promise.all([
      this.prisma.contratoAlquiler.count({
        where: { fecha_entrega: { gte: hoy, lt: manana } },
      }),
      this.prisma.contratoAlquiler.count({
        where: { fecha_devolucion: { gte: hoy, lt: manana } },
      }),
      this.prisma.contratoAlquiler.count({
        where: { createdAt: { gte: hoy, lt: manana } },
      }),
      this.prisma.contratoAlquiler.findMany({
        where: { estado: { in: [EstadoContrato.CON_DEUDA, EstadoContrato.DEVUELTO] } },
        select: { codigo: true, total: true, total_pagado: true, cliente: { select: { nombre: true } } },
      }),
    ]);

    const totalDeuda = deudas.reduce(
      (s, c) => s + (Number(c.total) - Number(c.total_pagado)), 0
    );

    // Contratos vencidos sin devolver
    const vencidos = await this.prisma.contratoAlquiler.count({
      where: {
        fecha_devolucion: { lt: hoy },
        estado: { in: [EstadoContrato.ENTREGADO, EstadoContrato.EN_USO] },
      },
    });

    return { entregas, devoluciones, nuevasReservas, totalDeuda, deudas: deudas.length, vencidos };
  }

  // ── Contratos por vencer (para recordatorios) ─────────────────────────────
  async porVencer(horas = 48) {
    const desde = new Date();
    const hasta = new Date(Date.now() + horas * 60 * 60 * 1000);
    return this.prisma.contratoAlquiler.findMany({
      where: {
        fecha_devolucion: { gte: desde, lte: hasta },
        estado: { in: [EstadoContrato.ENTREGADO, EstadoContrato.EN_USO] },
      },
      select: {
        codigo: true,
        fecha_devolucion: true,
        cliente: { select: { nombre: true, celular: true } },
        participantes: {
          where: { devuelto: false },
          select: { nombre: true },
        },
      },
    });
  }

  // ── Cancelar reserva ──────────────────────────────────────────────────────
  async cancelarReserva(codigo: string, ci: string) {
    const contrato = await this.prisma.contratoAlquiler.findFirst({
      where: {
        codigo,
        cliente: { ci },
        estado: { in: [EstadoContrato.RESERVADO, EstadoContrato.CONFIRMADO] },
      },
      select: { id: true, codigo: true, cliente: { select: { nombre: true } } },
    });
    if (!contrato) return null;

    await this.prisma.contratoAlquiler.update({
      where: { id: contrato.id },
      data: { estado: EstadoContrato.CANCELADO },
    });
    return contrato;
  }

  // ── Catálogo público (con variaciones detalladas) ─────────────────────────
  async getCatalogo() {
    const conjuntos = await this.prisma.conjunto.findMany({
      where: { activo: true, disponible_alquiler: true },
      select: {
        id: true,
        nombre: true,
        danza: true,
        genero: true,
        descripcion: true,
        precio_base: true,
        imagen_url: true,
        variaciones: {
          where: { activa: true },
          select: {
            id: true,
            nombre_variacion: true,
            talla: true,
            color: true,
            precio_alquiler: true,
            movimientosStock: { select: { cantidad: true } },
            contratoPrendas: {
              where: {
                contrato: { estado: { in: ['RESERVADO', 'CONFIRMADO', 'ENTREGADO', 'EN_USO'] } },
              },
              select: { total: true },
            },
          },
        },
      },
      orderBy: [{ danza: 'asc' }, { nombre: 'asc' }],
    });

    return conjuntos.map((c) => ({
      ...c,
      variaciones: c.variaciones.map((v) => {
        const stockTotal = v.movimientosStock.reduce((s, m) => s + m.cantidad, 0);
        const ocupado = v.contratoPrendas.reduce((s, p) => s + p.total, 0);
        return {
          id: v.id,
          nombre_variacion: v.nombre_variacion,
          talla: v.talla,
          color: v.color,
          precio_alquiler: v.precio_alquiler,
          disponible: Math.max(0, stockTotal - ocupado),
          total: stockTotal,
        };
      }),
    }));
  }

  // ── Crear solicitud de reserva web (raw SQL para no depender del cliente generado) ──
  async crearSolicitudWeb(data: {
    nombre: string;
    ci: string;
    celular: string;
    evento: string;
    fechaEvento: string;
    items: unknown[];
    totalEstimado: number;
    anticipoMin: number;
  }) {
    const itemsJson = JSON.stringify(data.items);
    const fechaEvento = new Date(data.fechaEvento);

    await this.prisma.$executeRaw`
      INSERT INTO SolicitudReservaWeb
        (nombre, ci, celular, evento, fecha_evento, items, total_estimado, anticipo_min, estado, createdAt, updatedAt)
      VALUES
        (${data.nombre}, ${data.ci}, ${data.celular}, ${data.evento},
         ${fechaEvento}, ${itemsJson},
         ${data.totalEstimado}, ${data.anticipoMin},
         'PENDIENTE', NOW(), NOW())
    `;

    const rows = await this.prisma.$queryRaw<{ id: bigint }[]>`
      SELECT LAST_INSERT_ID() AS id
    `;
    return { id: Number(rows[0].id), estado: 'PENDIENTE' };
  }
}
