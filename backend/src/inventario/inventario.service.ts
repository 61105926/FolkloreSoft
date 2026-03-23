import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoInstanciaComponente } from '@prisma/client';

@Injectable()
export class InventarioService {
  constructor(private readonly prisma: PrismaService) {}

  // ── InstanciasConjunto ──
  findAllInstanciasConjunto(sucursalId?: number) {
    return this.prisma.instanciaConjunto.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: {
        variacion: {
          include: {
            conjunto: { include: { componentes: { include: { componente: true } } } },
          },
        },
        sucursal: true,
        componentes: { include: { componente: true } },
      },
      orderBy: { codigo: 'asc' },
    });
  }

  async findInstanciaConjunto(id: number) {
    const inst = await this.prisma.instanciaConjunto.findUnique({
      where: { id },
      include: {
        variacion: {
          include: {
            conjunto: { include: { componentes: { include: { componente: true } } } },
          },
        },
        sucursal: true,
        componentes: { include: { componente: true } },
      },
    });
    if (!inst) throw new NotFoundException(`InstanciaConjunto #${id} no encontrada`);
    return inst;
  }

  createInstanciaConjunto(data: { codigo: string; variacionId: number; sucursalId: number }) {
    return this.prisma.instanciaConjunto.create({
      data,
      include: {
        variacion: { include: { conjunto: true } },
        sucursal: true,
      },
    });
  }

  // Ensamblar: toma piezas del pool y las asigna al conjunto
  async ensamblar(instanciaConjuntoId: number, componenteIds: number[]) {
    const instancia = await this.findInstanciaConjunto(instanciaConjuntoId);

    return this.prisma.$transaction(async (tx) => {
      for (const componenteInstId of componenteIds) {
        const pieza = await tx.instanciaComponente.findUnique({
          where: { id: componenteInstId },
        });
        if (!pieza) throw new NotFoundException(`Pieza #${componenteInstId} no encontrada`);
        if (pieza.estado !== 'DISPONIBLE_POOL') {
          throw new BadRequestException(`Pieza #${componenteInstId} no está disponible (estado: ${pieza.estado})`);
        }
        if (pieza.sucursalId !== instancia.sucursalId) {
          throw new BadRequestException(`Pieza #${componenteInstId} pertenece a otra sucursal`);
        }
        await tx.instanciaComponente.update({
          where: { id: componenteInstId },
          data: { estado: 'ASIGNADO', instanciaConjuntoId },
        });
      }
      return tx.instanciaConjunto.findUnique({
        where: { id: instanciaConjuntoId },
        include: { componentes: { include: { componente: true } } },
      });
    });
  }

  // Desensamblar: devuelve piezas al pool
  async desensamblar(instanciaConjuntoId: number) {
    return this.prisma.$transaction(async (tx) => {
      await tx.instanciaComponente.updateMany({
        where: { instanciaConjuntoId },
        data: { estado: 'DISPONIBLE_POOL', instanciaConjuntoId: null },
      });
      return { message: 'Piezas devueltas al pool' };
    });
  }

  // ── Pool (InstanciasComponente libres) ──
  findPool(sucursalId: number) {
    return this.prisma.instanciaComponente.findMany({
      where: { sucursalId, estado: 'DISPONIBLE_POOL' },
      include: { componente: true },
      orderBy: { serial: 'asc' },
    });
  }

  findAllInstanciasComponente(sucursalId?: number) {
    return this.prisma.instanciaComponente.findMany({
      where: sucursalId ? { sucursalId } : undefined,
      include: { componente: true, sucursal: true },
      orderBy: { serial: 'asc' },
    });
  }

  createInstanciaComponente(data: {
    serial: string; talla?: string;
    componenteId: number; sucursalId: number; notas?: string;
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

  // ── Stats por sucursal ──
  async statsPorSucursal() {
    const sucursales = await this.prisma.sucursal.findMany({
      select: { id: true, nombre: true, ciudad: true },
    });

    const stats = await Promise.all(
      sucursales.map(async (s) => {
        const [disponible, alquilado, enTransferencia, dadoDeBaja] = await Promise.all([
          this.prisma.instanciaConjunto.count({ where: { sucursalId: s.id, estado: 'DISPONIBLE' } }),
          this.prisma.instanciaConjunto.count({ where: { sucursalId: s.id, estado: 'ALQUILADO' } }),
          this.prisma.instanciaConjunto.count({ where: { sucursalId: s.id, estado: 'EN_TRANSFERENCIA' } }),
          this.prisma.instanciaConjunto.count({ where: { sucursalId: s.id, estado: 'DADO_DE_BAJA' } }),
        ]);
        return {
          sucursalId: s.id,
          nombre: s.nombre,
          ciudad: s.ciudad,
          disponible,
          alquilado,
          enTransferencia,
          dadoDeBaja,
          total: disponible + alquilado + enTransferencia + dadoDeBaja,
        };
      }),
    );
    return stats;
  }

  // ── Dar de baja masivo ──
  async darDeBaja(ids: number[], motivo?: string) {
    return this.prisma.$transaction(async (tx) => {
      await tx.instanciaConjunto.updateMany({
        where: { id: { in: ids } },
        data: { estado: 'DADO_DE_BAJA' },
      });
      const movimientos = ids.map((instanciaId) => ({
        instanciaId,
        tipo: 'DADO_DE_BAJA',
        estadoDespues: 'DADO_DE_BAJA' as const,
        notas: motivo ?? null,
      }));
      await tx.movimientoInstancia.createMany({ data: movimientos });
      return { affected: ids.length };
    });
  }

  // ── Actualizar notas de instancia ──
  async updateNotas(id: number, notas: string) {
    const inst = await this.prisma.instanciaConjunto.findUnique({ where: { id } });
    if (!inst) throw new NotFoundException(`InstanciaConjunto #${id} no encontrada`);
    await this.prisma.instanciaConjunto.update({ where: { id }, data: { notas } });
    await this.prisma.movimientoInstancia.create({
      data: { instanciaId: id, tipo: 'NOTA', notas },
    });
    return { id, notas };
  }

  // ── Historial de instancia ──
  getHistorial(id: number) {
    return this.prisma.movimientoInstancia.findMany({
      where: { instanciaId: id },
      orderBy: { createdAt: 'desc' },
    });
  }
}
