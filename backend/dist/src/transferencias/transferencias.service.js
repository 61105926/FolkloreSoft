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
exports.TransferenciasService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const INSTANCIA_INCLUDE = {
    instanciaConjunto: {
        include: {
            variacion: { include: { conjunto: true } },
        },
    },
    sucursalOrigen: true,
    sucursalDestino: true,
};
let TransferenciasService = class TransferenciasService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.transferencia.findMany({
            include: INSTANCIA_INCLUDE,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
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
        if (!t)
            throw new common_1.NotFoundException(`Transferencia #${id} no encontrada`);
        return t;
    }
    async create(data) {
        const instancia = await this.prisma.instanciaConjunto.findUnique({
            where: { id: data.instanciaConjuntoId },
        });
        if (!instancia)
            throw new common_1.NotFoundException(`InstanciaConjunto #${data.instanciaConjuntoId} no encontrada`);
        if (instancia.estado !== 'DISPONIBLE') {
            throw new common_1.BadRequestException(`La instancia no está disponible (estado: ${instancia.estado})`);
        }
        if (instancia.sucursalId !== data.sucursalOrigenId) {
            throw new common_1.BadRequestException('La instancia no pertenece a la sucursal de origen indicada');
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
    async marcarEnTransito(id) {
        const t = await this.findOne(id);
        if (t.estado !== 'SOLICITADO') {
            throw new common_1.BadRequestException(`La transferencia no está en estado SOLICITADO (estado: ${t.estado})`);
        }
        return this.prisma.transferencia.update({
            where: { id },
            data: { estado: 'EN_TRANSITO' },
            include: INSTANCIA_INCLUDE,
        });
    }
    async recibir(id) {
        const t = await this.findOne(id);
        if (t.estado !== 'EN_TRANSITO') {
            throw new common_1.BadRequestException(`La transferencia no está EN_TRANSITO (estado: ${t.estado})`);
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
};
exports.TransferenciasService = TransferenciasService;
exports.TransferenciasService = TransferenciasService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], TransferenciasService);
//# sourceMappingURL=transferencias.service.js.map