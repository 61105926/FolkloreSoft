"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.InventarioService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let InventarioService = class InventarioService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAllInstanciasConjunto(sucursalId) {
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
    async findInstanciaConjunto(id) {
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
        if (!inst)
            throw new common_1.NotFoundException(`InstanciaConjunto #${id} no encontrada`);
        return inst;
    }
    createInstanciaConjunto(data) {
        return this.prisma.instanciaConjunto.create({
            data,
            include: {
                variacion: { include: { conjunto: true } },
                sucursal: true,
            },
        });
    }
    async ensamblar(instanciaConjuntoId, componenteIds) {
        const instancia = await this.findInstanciaConjunto(instanciaConjuntoId);
        return this.prisma.$transaction(async (tx) => {
            for (const componenteInstId of componenteIds) {
                const pieza = await tx.instanciaComponente.findUnique({
                    where: { id: componenteInstId },
                });
                if (!pieza)
                    throw new common_1.NotFoundException(`Pieza #${componenteInstId} no encontrada`);
                if (pieza.estado !== 'DISPONIBLE_POOL') {
                    throw new common_1.BadRequestException(`Pieza #${componenteInstId} no está disponible (estado: ${pieza.estado})`);
                }
                if (pieza.sucursalId !== instancia.sucursalId) {
                    throw new common_1.BadRequestException(`Pieza #${componenteInstId} pertenece a otra sucursal`);
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
    async desensamblar(instanciaConjuntoId) {
        return this.prisma.$transaction(async (tx) => {
            await tx.instanciaComponente.updateMany({
                where: { instanciaConjuntoId },
                data: { estado: 'DISPONIBLE_POOL', instanciaConjuntoId: null },
            });
            return { message: 'Piezas devueltas al pool' };
        });
    }
    findPool(sucursalId) {
        return this.prisma.instanciaComponente.findMany({
            where: { sucursalId, estado: 'DISPONIBLE_POOL' },
            include: { componente: true },
            orderBy: { serial: 'asc' },
        });
    }
    findAllInstanciasComponente(sucursalId) {
        return this.prisma.instanciaComponente.findMany({
            where: sucursalId ? { sucursalId } : undefined,
            include: { componente: true, sucursal: true },
            orderBy: { serial: 'asc' },
        });
    }
    createInstanciaComponente(data) {
        return this.prisma.instanciaComponente.create({
            data,
            include: { componente: true, sucursal: true },
        });
    }
    updateEstadoComponente(id, estado, notas) {
        return this.prisma.instanciaComponente.update({
            where: { id },
            data: { estado, ...(notas !== undefined ? { notas } : {}) },
        });
    }
    async statsPorSucursal() {
        const sucursales = await this.prisma.sucursal.findMany({
            select: { id: true, nombre: true, ciudad: true },
        });
        const stats = await Promise.all(sucursales.map(async (s) => {
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
        }));
        return stats;
    }
    async darDeBaja(ids, motivo) {
        return this.prisma.$transaction(async (tx) => {
            await tx.instanciaConjunto.updateMany({
                where: { id: { in: ids } },
                data: { estado: 'DADO_DE_BAJA' },
            });
            const movimientos = ids.map((instanciaId) => ({
                instanciaId,
                tipo: 'DADO_DE_BAJA',
                estadoDespues: 'DADO_DE_BAJA',
                notas: motivo ?? null,
            }));
            await tx.movimientoInstancia.createMany({ data: movimientos });
            return { affected: ids.length };
        });
    }
    async updateNotas(id, notas) {
        const inst = await this.prisma.instanciaConjunto.findUnique({ where: { id } });
        if (!inst)
            throw new common_1.NotFoundException(`InstanciaConjunto #${id} no encontrada`);
        await this.prisma.instanciaConjunto.update({ where: { id }, data: { notas } });
        await this.prisma.movimientoInstancia.create({
            data: { instanciaId: id, tipo: 'NOTA', notas },
        });
        return { id, notas };
    }
    getHistorial(id) {
        return this.prisma.movimientoInstancia.findMany({
            where: { instanciaId: id },
            orderBy: { createdAt: 'desc' },
        });
    }
};
exports.InventarioService = InventarioService;
exports.InventarioService = InventarioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], InventarioService);
//# sourceMappingURL=inventario.service.js.map