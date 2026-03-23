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
exports.EventosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const client_1 = require("@prisma/client");
const INCLUDE_EVENTO = {
    sucursal: { select: { id: true, nombre: true, ciudad: true } },
    _count: { select: { contratos: true } },
};
let EventosService = class EventosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.eventoFolclorico.findMany({
            include: INCLUDE_EVENTO,
            orderBy: { fecha_inicio: 'desc' },
        });
    }
    async findOne(id) {
        const e = await this.prisma.eventoFolclorico.findUnique({
            where: { id },
            include: INCLUDE_EVENTO,
        });
        if (!e)
            throw new common_1.NotFoundException(`Evento #${id} no encontrado`);
        return e;
    }
    create(data) {
        return this.prisma.eventoFolclorico.create({
            data: {
                nombre: data.nombre,
                descripcion: data.descripcion,
                tipo: data.tipo ?? client_1.TipoEvento.FESTIVAL,
                estado: data.estado ?? client_1.EstadoEvento.PLANIFICADO,
                fecha_inicio: new Date(data.fecha_inicio),
                fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : undefined,
                lugar: data.lugar,
                sucursalId: data.sucursalId,
            },
            include: INCLUDE_EVENTO,
        });
    }
    async update(id, data) {
        await this.findOne(id);
        return this.prisma.eventoFolclorico.update({
            where: { id },
            data: {
                ...data,
                fecha_inicio: data.fecha_inicio ? new Date(data.fecha_inicio) : undefined,
                fecha_fin: data.fecha_fin ? new Date(data.fecha_fin) : data.fecha_fin === null ? null : undefined,
            },
            include: INCLUDE_EVENTO,
        });
    }
    async remove(id) {
        await this.findOne(id);
        return this.prisma.eventoFolclorico.delete({ where: { id } });
    }
};
exports.EventosService = EventosService;
exports.EventosService = EventosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], EventosService);
//# sourceMappingURL=eventos.service.js.map