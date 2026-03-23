import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';

const INSTANCIA_INCLUDE = {
  instanciaConjunto: {
    include: {
      variacion: { include: { conjunto: true } },
    },
  },
  sucursalOrigen: true,
  sucursalDestino: true,
} as const;

@Injectable()
export class TransferenciasService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.transferencia.findMany({
      include: INSTANCIA_INCLUDE,
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: number) {
    const t = await this.prisma.transferencia.findUnique({
      where: { id },
      include: {
        instanciaConjunto: {
          include: {
            variacion: { include: { conjunto: true } },
            componentes: { include: { componente: true } },
          },
        },
        sucursalOrigen: true,
        sucursalDestino: true,
      },
    });
    if (!t) throw new NotFoundException(`Transferencia #${id} no encontrada`);
    return t;
  }

  async create(data: {
    instanciaConjuntoId: number;
    sucursalOrigenId: number;
    sucursalDestinoId: number;
    notas?: string;
  }) {
    const instancia = await this.prisma.instanciaConjunto.findUnique({
      where: { id: data.instanciaConjuntoId },
    });
    if (!instancia) throw new NotFoundException(`InstanciaConjunto #${data.instanciaConjuntoId} no encontrada`);
    if (instancia.estado !== 'DISPONIBLE') {
      throw new BadRequestException(`La instancia no está disponible (estado: ${instancia.estado})`);
    }
    if (instancia.sucursalId !== data.sucursalOrigenId) {
      throw new BadRequestException('La instancia no pertenece a la sucursal de origen indicada');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.instanciaConjunto.update({
        where: { id: data.instanciaConjuntoId },
        data: { estado: 'EN_TRANSFERENCIA' },
      });
      await tx.instanciaComponente.updateMany({
        where: { instanciaConjuntoId: data.instanciaConjuntoId },
        data: { estado: 'EN_TRANSFERENCIA' },
      });
      return tx.transferencia.create({
        data: {
          instanciaConjuntoId: data.instanciaConjuntoId,
          sucursalOrigenId: data.sucursalOrigenId,
          sucursalDestinoId: data.sucursalDestinoId,
          notas: data.notas,
          estado: 'SOLICITADO',
        },
        include: INSTANCIA_INCLUDE,
      });
    });
  }

  async marcarEnTransito(id: number) {
    const t = await this.findOne(id);
    if (t.estado !== 'SOLICITADO') {
      throw new BadRequestException(`La transferencia no está en estado SOLICITADO (estado: ${t.estado})`);
    }
    return this.prisma.transferencia.update({
      where: { id },
      data: { estado: 'EN_TRANSITO' },
      include: INSTANCIA_INCLUDE,
    });
  }

  async recibir(id: number) {
    const t = await this.findOne(id);
    if (t.estado !== 'EN_TRANSITO') {
      throw new BadRequestException(`La transferencia no está EN_TRANSITO (estado: ${t.estado})`);
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.instanciaConjunto.update({
        where: { id: t.instanciaConjuntoId },
        data: { estado: 'DISPONIBLE', sucursalId: t.sucursalDestinoId },
      });
      await tx.instanciaComponente.updateMany({
        where: { instanciaConjuntoId: t.instanciaConjuntoId },
        data: { estado: 'ASIGNADO', sucursalId: t.sucursalDestinoId },
      });
      return tx.transferencia.update({
        where: { id },
        data: { estado: 'RECIBIDO' },
        include: INSTANCIA_INCLUDE,
      });
    });
  }
}
