import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoContrato, TipoContrato, CiudadContrato, TipoGarantia, FormaPago, TipoParticipante, EstadoInstanciaConjunto } from '@prisma/client';

const INCLUDE_FULL = {
  cliente: true,
  evento: { select: { id: true, nombre: true, tipo: true, fecha_inicio: true } },
  prendas: {
    include: {
      conjunto: { select: { id: true, nombre: true, danza: true } },
      variacion: { select: { id: true, nombre_variacion: true, talla: true, color: true, codigo_variacion: true } },
      participantes: {
        include: { instanciaConjunto: { select: { id: true, codigo: true, estado: true } } },
        orderBy: { createdAt: 'asc' as const },
      },
    },
    orderBy: { id: 'asc' as const },
  },
  garantias: {
    include: { participante: { select: { id: true, nombre: true } } },
    orderBy: { createdAt: 'asc' as const },
  },
  participantes: {
    include: {
      garantias: true,
      instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
    },
    orderBy: { createdAt: 'asc' as const },
  },
  _count: { select: { prendas: true, garantias: true, participantes: true } },
  historial: { orderBy: { createdAt: 'desc' as const } },
  movimientosCaja: { orderBy: { createdAt: 'desc' as const } },
} as const;

const INCLUDE_LIST = {
  cliente: { select: { id: true, nombre: true, celular: true } },
  evento: { select: { id: true, nombre: true } },
  participantes: { select: { id: true, devuelto: true } },
  _count: { select: { prendas: true, garantias: true, participantes: true } },
} as const;

@Injectable()
export class ContratosService {
  constructor(private readonly prisma: PrismaService) {}

  // ── Historial helper ──────────────────────────────────────────────────────

  private log(contratoId: number, tipo: string, descripcion?: string) {
    return this.prisma.contratoHistorial.create({
      data: { contratoId, tipo, descripcion },
    });
  }

  // ── Código auto-generado ──────────────────────────────────────────────────

  private async generarCodigo(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.contratoAlquiler.count();
    return `CONT-${year}-${String(count + 1).padStart(4, '0')}`;
  }

  // ── Contratos ─────────────────────────────────────────────────────────────

  findAllGarantias() {
    return this.prisma.contratoGarantia.findMany({
      include: {
        contrato: {
          select: {
            id: true, codigo: true, estado: true,
            cliente: { select: { id: true, nombre: true, celular: true, ci: true } },
          },
        },
        participante: { select: { id: true, nombre: true, ci: true } },
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  findAll(filter?: { isAdmin?: boolean; sucursalId?: number }) {
    const where: Record<string, unknown> = {};
    if (!filter?.isAdmin && filter?.sucursalId) {
      where['sucursalId'] = filter.sucursalId;
    }
    return this.prisma.contratoAlquiler.findMany({
      where,
      include: INCLUDE_LIST,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const c = await this.prisma.contratoAlquiler.findUnique({
      where: { id },
      include: INCLUDE_FULL,
    });
    if (!c) throw new NotFoundException(`Contrato #${id} no encontrado`);
    return c;
  }

  async create(data: {
    tipo?: TipoContrato;
    eventoId?: number;
    clienteId: number;
    nombre_evento_ext?: string;
    institucion?: string;
    ubicacion?: string;
    ciudad?: CiudadContrato;
    fecha_entrega: string;
    fecha_devolucion: string;
    total?: number;
    anticipo?: number;
    forma_pago?: FormaPago;
    observaciones?: string;
    condiciones?: string;
    prendas?: {
      modelo: string;
      conjuntoId?: number;
      variacionId?: number;
      cantidad_hombres?: number;
      cantidad_cholitas?: number;
      cantidad_machas?: number;
      cantidad_ninos?: number;
      costo_unitario: number;
    }[];
    garantias?: {
      tipo: TipoGarantia;
      descripcion?: string;
      valor?: number;
      participanteId?: number;
    }[];
  }, actor?: { id?: number; nombre?: string; sucursalId?: number | null }) {
    const codigo = await this.generarCodigo();
    // Never trust total_pagado from frontend — derive it from anticipo
    const { prendas, garantias, ...rest } = data;
    const anticipoVal = Number(rest.anticipo ?? 0);

    const prendaCreate = (prendas ?? []).map((p) => {
      const total =
        (p.cantidad_hombres ?? 0) +
        (p.cantidad_cholitas ?? 0) +
        (p.cantidad_machas ?? 0) +
        (p.cantidad_ninos ?? 0);
      return {
        modelo: p.modelo,
        conjuntoId: p.conjuntoId,
        variacionId: p.variacionId,
        cantidad_hombres: p.cantidad_hombres ?? 0,
        cantidad_cholitas: p.cantidad_cholitas ?? 0,
        cantidad_machas: p.cantidad_machas ?? 0,
        cantidad_ninos: p.cantidad_ninos ?? 0,
        total,
        costo_unitario: p.costo_unitario,
        subtotal: total * p.costo_unitario,
      };
    });

    const totalAuto = prendaCreate.reduce((s, p) => s + Number(p.subtotal), 0);

    const contrato = await this.prisma.contratoAlquiler.create({
      data: {
        ...rest,
        codigo,
        fecha_entrega: new Date(data.fecha_entrega),
        fecha_devolucion: new Date(data.fecha_devolucion),
        total: data.total ?? totalAuto,
        total_pagado: anticipoVal,
        sucursalId: actor?.sucursalId ?? null,
        prendas: prendaCreate.length > 0 ? { create: prendaCreate } : undefined,
        garantias: garantias ? { create: garantias } : undefined,
      },
      include: INCLUDE_FULL,
    });
    const userName = actor?.nombre ?? 'Sistema';
    await this.log(contrato.id, 'CREADO', `Contrato ${contrato.codigo} creado — por ${userName}`);

    const clienteNombre = (contrato.cliente as { nombre: string }).nombre;

    // Auto-register anticipo in caja
    if (anticipoVal > 0) {
      await this.prisma.movimientoCaja.create({
        data: {
          tipo: 'INGRESO',
          concepto: 'ANTICIPO_CONTRATO',
          monto: anticipoVal,
          descripcion: `Anticipo — ${contrato.codigo} (${clienteNombre})`,
          forma_pago: data.forma_pago ?? 'EFECTIVO',
          contratoId: contrato.id,
          userId: actor?.id ?? null,
        },
      });
      await this.log(contrato.id, 'PAGO_REGISTRADO',
        `Anticipo de Bs. ${anticipoVal.toFixed(2)} registrado en caja (${data.forma_pago ?? 'EFECTIVO'}) — cobrado por ${userName}`);
    }

    // Auto-register cash guarantees in caja
    const garantiasEfectivo = (garantias ?? []).filter(
      (g) => g.tipo === 'EFECTIVO' && g.valor && g.valor > 0,
    );
    for (const g of garantiasEfectivo) {
      await this.prisma.movimientoCaja.create({
        data: {
          tipo: 'INGRESO',
          concepto: 'GARANTIA_EFECTIVO',
          monto: g.valor!,
          descripcion: `Garantía en efectivo — ${contrato.codigo} (${clienteNombre})`,
          forma_pago: 'EFECTIVO',
          contratoId: contrato.id,
          userId: actor?.id ?? null,
        },
      });
    }
    if (garantiasEfectivo.length > 0) {
      const totalGar = garantiasEfectivo.reduce((s, g) => s + g.valor!, 0);
      await this.log(contrato.id, 'PAGO_REGISTRADO',
        `Garantía(s) en efectivo de Bs. ${totalGar.toFixed(2)} registradas en caja — cobrado por ${userName}`);
    }

    return contrato;
  }

  async update(id: number, data: {
    tipo?: TipoContrato;
    estado?: EstadoContrato;
    eventoId?: number | null;
    clienteId?: number;
    nombre_evento_ext?: string;
    institucion?: string;
    ubicacion?: string;
    ciudad?: CiudadContrato;
    fecha_entrega?: string;
    fecha_devolucion?: string;
    total?: number;
    anticipo?: number;
    forma_pago?: FormaPago | null;
    observaciones?: string;
    condiciones?: string;
  }) {
    await this.findOne(id);
    // Explicitly exclude total_pagado — only registrarPago can change it
    const { total_pagado: _tp, ...safeData } = data as Record<string, unknown>;
    return this.prisma.contratoAlquiler.update({
      where: { id },
      data: {
        ...safeData,
        fecha_entrega: (safeData['fecha_entrega'] as string | undefined) ? new Date(safeData['fecha_entrega'] as string) : undefined,
        fecha_devolucion: (safeData['fecha_devolucion'] as string | undefined) ? new Date(safeData['fecha_devolucion'] as string) : undefined,
      },
      include: INCLUDE_FULL,
    });
  }

  async entregar(id: number) {
    await this.findOne(id);
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.ENTREGADO, fecha_entrega_real: new Date() },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'ENTREGADO', 'Prendas entregadas al cliente');
    return result;
  }

  async iniciarUso(id: number) {
    await this.findOne(id);
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.EN_USO },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'EN_USO', 'Prendas en uso');
    return result;
  }

  async devolver(id: number, data?: { observaciones?: string }) {
    // Auto-detect si queda deuda basado en los pagos reales en caja
    const contrato = await this.findOne(id);
    const conDeuda = Number(contrato.total_pagado) < Number(contrato.total);

    // Liberar todas las instancias asignadas a participantes
    const instanciaIds = (contrato.participantes ?? [])
      .map((p) => (p as { instanciaConjuntoId?: number }).instanciaConjuntoId)
      .filter((iid): iid is number => !!iid);
    if (instanciaIds.length > 0) {
      await this.prisma.instanciaConjunto.updateMany({
        where: { id: { in: instanciaIds }, estado: EstadoInstanciaConjunto.ALQUILADO },
        data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
    }

    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: {
        estado: conDeuda ? EstadoContrato.CON_DEUDA : EstadoContrato.DEVUELTO,
        fecha_devolucion_real: new Date(),
        observaciones: data?.observaciones,
      },
      include: INCLUDE_FULL,
    });
    const deudaDesc = conDeuda
      ? `Deuda pendiente: Bs. ${(Number(contrato.total) - Number(contrato.total_pagado)).toFixed(2)}`
      : 'Pagado completo';
    await this.log(id, conDeuda ? 'CON_DEUDA' : 'DEVUELTO',
      conDeuda ? `Prendas devueltas — ${deudaDesc}` : 'Prendas devueltas correctamente');
    return result;
  }

  async confirmar(id: number) {
    await this.findOne(id);
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.CONFIRMADO },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'CONFIRMADO', 'Reserva confirmada');
    return result;
  }

  async cerrar(id: number) {
    const contrato = await this.findOne(id);
    // Liberar instancias que pudieran quedar ALQUILADO
    const instanciaIds = (contrato.participantes ?? [])
      .map((p) => (p as { instanciaConjuntoId?: number }).instanciaConjuntoId)
      .filter((iid): iid is number => !!iid);
    if (instanciaIds.length > 0) {
      await this.prisma.instanciaConjunto.updateMany({
        where: { id: { in: instanciaIds }, estado: EstadoInstanciaConjunto.ALQUILADO },
        data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
    }
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.CERRADO },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'CERRADO', 'Contrato cerrado');
    return result;
  }

  async cancelar(id: number) {
    const contrato = await this.findOne(id);
    const instanciaIds = (contrato.participantes ?? [])
      .map((p) => (p as { instanciaConjuntoId?: number }).instanciaConjuntoId)
      .filter((id): id is number => !!id);
    if (instanciaIds.length > 0) {
      await this.prisma.instanciaConjunto.updateMany({
        where: { id: { in: instanciaIds } },
        data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
    }
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.CANCELADO },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'CANCELADO', 'Contrato cancelado');
    return result;
  }

  async retenerGarantia(id: number, motivo: string) {
    await this.findOne(id);
    await this.prisma.contratoGarantia.updateMany({
      where: { contratoId: id },
      data: { retenida: true, motivo_retencion: motivo },
    });
    const result = await this.prisma.contratoAlquiler.update({
      where: { id },
      data: { estado: EstadoContrato.CON_GARANTIA_RETENIDA },
      include: INCLUDE_FULL,
    });
    await this.log(id, 'GARANTIA_RETENIDA', `Garantía retenida: ${motivo}`);
    return result;
  }

  async remove(id: number) {
    const contrato = await this.findOne(id);
    // Liberar instancias antes de borrar
    const instanciaIds = (contrato.participantes ?? [])
      .map((p) => (p as { instanciaConjuntoId?: number }).instanciaConjuntoId)
      .filter((iid): iid is number => !!iid);
    if (instanciaIds.length > 0) {
      await this.prisma.instanciaConjunto.updateMany({
        where: { id: { in: instanciaIds }, estado: EstadoInstanciaConjunto.ALQUILADO },
        data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
    }
    await this.prisma.movimientoCaja.deleteMany({ where: { contratoId: id } });
    return this.prisma.contratoAlquiler.delete({ where: { id } });
  }

  // ── Prendas ───────────────────────────────────────────────────────────────

  async addPrenda(contratoId: number, data: {
    modelo: string;
    conjuntoId?: number;
    variacionId?: number;
    cantidad_hombres?: number;
    cantidad_cholitas?: number;
    cantidad_machas?: number;
    cantidad_ninos?: number;
    costo_unitario: number;
  }) {
    const total =
      (data.cantidad_hombres ?? 0) +
      (data.cantidad_cholitas ?? 0) +
      (data.cantidad_machas ?? 0) +
      (data.cantidad_ninos ?? 0);

    if (data.variacionId && total > 0) {
      const disponibles = await this.prisma.instanciaConjunto.count({
        where: { variacionId: data.variacionId, estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
      if (disponibles < total) {
        throw new BadRequestException(
          `Stock insuficiente. Disponibles: ${disponibles}, solicitados: ${total}.`,
        );
      }
    }

    const prenda = await this.prisma.contratoPrenda.create({
      data: {
        contratoId,
        modelo: data.modelo,
        conjuntoId: data.conjuntoId,
        variacionId: data.variacionId,
        cantidad_hombres: data.cantidad_hombres ?? 0,
        cantidad_cholitas: data.cantidad_cholitas ?? 0,
        cantidad_machas: data.cantidad_machas ?? 0,
        cantidad_ninos: data.cantidad_ninos ?? 0,
        total,
        costo_unitario: data.costo_unitario,
        subtotal: total * data.costo_unitario,
      },
      include: {
        participantes: {
          include: { instanciaConjunto: { select: { id: true, codigo: true, estado: true } } },
        },
        variacion: { select: { id: true, nombre_variacion: true, talla: true, color: true, codigo_variacion: true } },
      },
    });
    await this.log(contratoId, 'PRENDA_AGREGADA', `Prenda agregada: ${data.modelo} (x${total})`);
    return prenda;
  }

  async updatePrenda(id: number, data: {
    modelo?: string;
    variacionId?: number | null;
    cantidad_hombres?: number;
    cantidad_cholitas?: number;
    cantidad_machas?: number;
    cantidad_ninos?: number;
    costo_unitario?: number;
  }) {
    const existing = await this.prisma.contratoPrenda.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException(`Prenda #${id} no encontrada`);
    const hombres = data.cantidad_hombres ?? existing.cantidad_hombres;
    const cholitas = data.cantidad_cholitas ?? existing.cantidad_cholitas;
    const machas = data.cantidad_machas ?? existing.cantidad_machas;
    const ninos = data.cantidad_ninos ?? existing.cantidad_ninos;
    const total = hombres + cholitas + machas + ninos;
    const costo = data.costo_unitario ?? Number(existing.costo_unitario);

    const variacionId = data.variacionId !== undefined ? data.variacionId : existing.variacionId;
    if (variacionId && total > 0) {
      const disponibles = await this.prisma.instanciaConjunto.count({
        where: { variacionId, estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
      if (disponibles < total) {
        throw new BadRequestException(
          `Stock insuficiente. Disponibles: ${disponibles}, solicitados: ${total}.`,
        );
      }
    }

    return this.prisma.contratoPrenda.update({
      where: { id },
      data: { ...data, total, subtotal: total * costo },
    });
  }

  async removePrenda(id: number) {
    const p = await this.prisma.contratoPrenda.findUnique({ where: { id }, select: { contratoId: true, modelo: true } });
    await this.prisma.contratoPrenda.delete({ where: { id } });
    if (p) await this.log(p.contratoId, 'PRENDA_REMOVIDA', `Prenda removida: ${p.modelo}`);
  }

  // ── Garantías ─────────────────────────────────────────────────────────────

  async addGarantia(contratoId: number, data: {
    tipo: TipoGarantia;
    descripcion?: string;
    valor?: number;
    participanteId?: number;
  }) {
    const g = await this.prisma.contratoGarantia.create({
      data: { contratoId, ...data },
      include: { participante: { select: { id: true, nombre: true } } },
    });
    const quien = (g.participante as { nombre: string } | null)?.nombre;
    await this.log(contratoId, 'GARANTIA_AGREGADA',
      `Garantía agregada: ${data.tipo}${quien ? ` — ${quien}` : ''}${data.descripcion ? ` (${data.descripcion})` : ''}`);

    // Auto-register cash guarantee in caja
    if (data.tipo === TipoGarantia.EFECTIVO && data.valor && data.valor > 0) {
      const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
        where: { id: contratoId },
        select: { codigo: true, cliente: { select: { nombre: true } } },
      });
      await this.prisma.movimientoCaja.create({
        data: {
          tipo: 'INGRESO',
          concepto: 'GARANTIA_EFECTIVO',
          monto: data.valor,
          descripcion: `Garantía en efectivo — ${contrato.codigo} (${(contrato.cliente as { nombre: string }).nombre})${quien ? ` · ${quien}` : ''}`,
          forma_pago: 'EFECTIVO',
          contratoId,
        },
      });
      await this.log(contratoId, 'PAGO_REGISTRADO',
        `Garantía en efectivo de Bs. ${data.valor.toFixed(2)} registrada en caja`);
    }

    return g;
  }

  updateGarantia(id: number, data: {
    tipo?: TipoGarantia;
    descripcion?: string;
    valor?: number;
    retenida?: boolean;
    motivo_retencion?: string;
    participanteId?: number | null;
  }) {
    return this.prisma.contratoGarantia.update({ where: { id }, data });
  }

  async removeGarantia(id: number) {
    const g = await this.prisma.contratoGarantia.findUnique({ where: { id }, select: { contratoId: true, tipo: true } });
    await this.prisma.contratoGarantia.delete({ where: { id } });
    if (g) await this.log(g.contratoId, 'GARANTIA_REMOVIDA', `Garantía removida: ${g.tipo}`);
  }

  // ── Participantes ─────────────────────────────────────────────────────────

  async addParticipante(contratoId: number, data: {
    nombre: string;
    ci?: string;
    tipo?: TipoParticipante;
    prendaId?: number;
    notas?: string;
    instanciaConjuntoId?: number;
  }) {
    const p = await this.prisma.contratoParticipante.create({
      data: { contratoId, ...data },
      include: {
        garantias: true,
        instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
      },
    });
    if (data.instanciaConjuntoId) {
      await this.prisma.instanciaConjunto.update({
        where: { id: data.instanciaConjuntoId },
        data: { estado: EstadoInstanciaConjunto.ALQUILADO },
      });
    }
    await this.log(contratoId, 'PARTICIPANTE_AGREGADO',
      `Participante agregado: ${data.nombre}${data.tipo ? ` (${data.tipo})` : ''}`);
    return p;
  }

  async updateParticipante(id: number, data: {
    nombre?: string;
    ci?: string;
    tipo?: TipoParticipante;
    prendaId?: number | null;
    notas?: string;
    devuelto?: boolean;
    fecha_devolucion?: string | null;
    instanciaConjuntoId?: number | null;
  }) {
    const { fecha_devolucion, instanciaConjuntoId, ...rest } = data;

    // Handle instance reassignment
    const old = await this.prisma.contratoParticipante.findUnique({
      where: { id },
      select: { instanciaConjuntoId: true },
    });
    if (old?.instanciaConjuntoId !== undefined && old.instanciaConjuntoId !== instanciaConjuntoId) {
      if (old.instanciaConjuntoId) {
        await this.prisma.instanciaConjunto.update({
          where: { id: old.instanciaConjuntoId },
          data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
        });
      }
      if (instanciaConjuntoId) {
        await this.prisma.instanciaConjunto.update({
          where: { id: instanciaConjuntoId },
          data: { estado: EstadoInstanciaConjunto.ALQUILADO },
        });
      }
    }

    return this.prisma.contratoParticipante.update({
      where: { id },
      data: {
        ...rest,
        instanciaConjuntoId,
        fecha_devolucion: fecha_devolucion
          ? new Date(fecha_devolucion)
          : fecha_devolucion === null ? null : undefined,
      },
      include: {
        garantias: true,
        instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
      },
    });
  }

  async removeParticipante(id: number) {
    const p = await this.prisma.contratoParticipante.findUnique({
      where: { id },
      select: { instanciaConjuntoId: true, nombre: true, contratoId: true },
    });
    if (p?.instanciaConjuntoId) {
      await this.prisma.instanciaConjunto.update({
        where: { id: p.instanciaConjuntoId },
        data: { estado: EstadoInstanciaConjunto.DISPONIBLE },
      });
    }
    await this.prisma.contratoParticipante.delete({ where: { id } });
    if (p) await this.log(p.contratoId, 'PARTICIPANTE_REMOVIDO', `Participante removido: ${p.nombre}`);
  }

  async marcarDevuelto(id: number, data?: {
    condicion?: 'COMPLETO' | 'CON_DANOS' | 'PERDIDA';
    notas?: string;
    sancion_monto?: number;
    sancion_motivo?: string;
  }) {
    const p = await this.prisma.contratoParticipante.findUniqueOrThrow({
      where: { id },
      select: { instanciaConjuntoId: true, contratoId: true, notas: true, nombre: true },
    });

    // Update instance state FIRST so the returned participant reflects the new state
    if (p.instanciaConjuntoId) {
      const nuevoEstado = data?.condicion === 'PERDIDA'
        ? EstadoInstanciaConjunto.DADO_DE_BAJA
        : EstadoInstanciaConjunto.DISPONIBLE;
      await this.prisma.instanciaConjunto.update({
        where: { id: p.instanciaConjuntoId },
        data: { estado: nuevoEstado },
      });
    }

    // Append devolucion notes to existing notes
    let updatedNotas: string | undefined;
    const condicionLabel = data?.condicion === 'PERDIDA' ? 'Pérdida' : data?.condicion === 'CON_DANOS' ? 'Con daños' : undefined;
    const notaPrefix = condicionLabel ? `[${condicionLabel}]` : '[Devolución]';
    if (data?.notas?.trim()) {
      updatedNotas = p.notas
        ? `${p.notas}\n${notaPrefix}: ${data.notas.trim()}`
        : `${notaPrefix}: ${data.notas.trim()}`;
    } else if (condicionLabel) {
      updatedNotas = p.notas
        ? `${p.notas}\n${notaPrefix}`
        : notaPrefix;
    }

    const updated = await this.prisma.contratoParticipante.update({
      where: { id },
      data: {
        devuelto: true,
        fecha_devolucion: new Date(),
        ...(updatedNotas !== undefined ? { notas: updatedNotas } : {}),
      },
      include: {
        garantias: true,
        instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
      },
    });

    // Create sanction as a retained guarantee linked to the participant
    const montoSancion = data?.sancion_monto && data.sancion_monto > 0 ? data.sancion_monto : undefined;
    if (montoSancion) {
      const motivoDefault = data?.condicion === 'PERDIDA' ? 'Pérdida de prenda' : 'Daños en la prenda';
      await this.prisma.contratoGarantia.create({
        data: {
          contratoId: p.contratoId,
          participanteId: id,
          tipo: TipoGarantia.OTRO,
          descripcion: data?.sancion_motivo?.trim() || motivoDefault,
          valor: montoSancion,
          retenida: true,
          motivo_retencion: data?.sancion_motivo?.trim() || motivoDefault,
        },
      });
    }

    // Log the return event
    const condDesc = data?.condicion === 'PERDIDA' ? 'prenda perdida' : data?.condicion === 'CON_DANOS' ? 'con daños' : 'correctamente';
    await this.log(p.contratoId, 'PARTICIPANTE_DEVOLVIO',
      `${p.nombre} devolvió ${condDesc}${data?.notas ? ` — ${data.notas}` : ''}`);

    return updated;
  }

  // ── Registrar egreso en caja (devolución de garantía, etc.) ─────────────

  async registrarEgreso(contratoId: number, body: {
    monto: number;
    forma_pago?: FormaPago;
    referencia?: string;
    descripcion?: string;
    concepto?: 'DEVOLUCION_GARANTIA' | 'OTRO_EGRESO';
  }, actor?: { id?: number; nombre?: string }) {
    const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
      where: { id: contratoId },
      select: { id: true, codigo: true, cliente: { select: { nombre: true } } },
    });
    const concepto = body.concepto ?? 'DEVOLUCION_GARANTIA';

    const userName = actor?.nombre ?? 'Sistema';

    await this.prisma.movimientoCaja.create({
      data: {
        tipo: 'EGRESO',
        concepto,
        monto: body.monto,
        descripcion: body.descripcion ?? `Devolución garantía — ${contrato.codigo}`,
        forma_pago: body.forma_pago ?? 'EFECTIVO',
        referencia: body.referencia,
        contratoId,
        userId: actor?.id ?? null,
      },
    });

    const CONCEPTO_LABELS: Record<string, string> = {
      DEVOLUCION_GARANTIA: 'Garantía devuelta al cliente',
      OTRO_EGRESO: 'Egreso registrado',
    };
    await this.log(contratoId, 'GARANTIA_DEVUELTA',
      `${CONCEPTO_LABELS[concepto] ?? concepto}: Bs. ${body.monto.toFixed(2)} en ${body.forma_pago ?? 'EFECTIVO'}${body.referencia ? ` — Ref: ${body.referencia}` : ''} — registrado por ${userName}`);

    return this.findOne(contratoId);
  }

  // ── Registrar pago en caja ────────────────────────────────────────────────

  async registrarPago(contratoId: number, body: {
    monto: number;
    forma_pago?: FormaPago;
    referencia?: string;
    descripcion?: string;
    concepto?: 'PAGO_SALDO_CONTRATO' | 'DEUDA_COBRADA' | 'ANTICIPO_CONTRATO';
  }, actor?: { id?: number; nombre?: string }) {
    const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
      where: { id: contratoId },
      select: {
        id: true, codigo: true, total_pagado: true, total: true, estado: true,
        cliente: { select: { nombre: true } },
      },
    });

    const nuevoPagado = Number(contrato.total_pagado) + body.monto;
    const esDeudeaCobrada = (['DEVUELTO', 'CON_DEUDA'] as EstadoContrato[]).includes(contrato.estado);
    const concepto = body.concepto ?? (esDeudeaCobrada ? 'DEUDA_COBRADA' : 'PAGO_SALDO_CONTRATO');

    // Update total_pagado
    const updated = await this.prisma.contratoAlquiler.update({
      where: { id: contratoId },
      data: { total_pagado: nuevoPagado },
      include: INCLUDE_FULL,
    });

    const userName = actor?.nombre ?? 'Sistema';

    // Create caja movement
    await this.prisma.movimientoCaja.create({
      data: {
        tipo: 'INGRESO',
        concepto,
        monto: body.monto,
        descripcion: body.descripcion ?? `Pago — ${contrato.codigo}`,
        forma_pago: body.forma_pago ?? 'EFECTIVO',
        referencia: body.referencia,
        contratoId,
        userId: actor?.id ?? null,
      },
    });

    const CONCEPTO_LABELS: Record<string, string> = {
      ANTICIPO_CONTRATO:   'Anticipo',
      PAGO_SALDO_CONTRATO: 'Pago de saldo',
      DEUDA_COBRADA:       'Deuda cobrada',
    };
    await this.log(contratoId, 'PAGO_REGISTRADO',
      `${CONCEPTO_LABELS[concepto] ?? concepto}: Bs. ${body.monto.toFixed(2)} en ${body.forma_pago ?? 'EFECTIVO'}${body.referencia ? ` — Ref: ${body.referencia}` : ''} — cobrado por ${userName}`);

    return updated;
  }

  // ── Instancias disponibles para una prenda ────────────────────────────────

  async getInstanciasDisponibles(prendaId: number) {
    const prenda = await this.prisma.contratoPrenda.findUnique({
      where: { id: prendaId },
      select: { variacionId: true },
    });
    if (!prenda || !prenda.variacionId) return [];
    return this.prisma.instanciaConjunto.findMany({
      where: { variacionId: prenda.variacionId, estado: EstadoInstanciaConjunto.DISPONIBLE },
      select: { id: true, codigo: true, estado: true },
      orderBy: { codigo: 'asc' },
    });
  }

  // ── Stock disponible para una variación ────────────────────────────────────

  async getStockForVariacion(variacionId: number) {
    const disponibles = await this.prisma.instanciaConjunto.count({
      where: { variacionId, estado: EstadoInstanciaConjunto.DISPONIBLE },
    });
    return { variacionId, disponibles };
  }
}
