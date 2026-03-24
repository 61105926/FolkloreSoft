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
exports.CatalogoService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const imagen_auto_service_js_1 = require("./imagen-auto.service.js");
let CatalogoService = class CatalogoService {
    prisma;
    imagenAuto;
    constructor(prisma, imagenAuto) {
        this.prisma = prisma;
        this.imagenAuto = imagenAuto;
    }
    findAllConjuntos() {
        return this.prisma.conjunto.findMany({
            where: { activo: true },
            include: {
                componentes: { include: { componente: true } },
                variaciones: {
                    where: { activa: true },
                    include: { instancias: { include: { sucursal: true } } },
                },
            },
            orderBy: { nombre: 'asc' },
        });
    }
    async findConjunto(id) {
        const c = await this.prisma.conjunto.findUnique({
            where: { id },
            include: {
                componentes: { include: { componente: true } },
                variaciones: {
                    where: { activa: true },
                    include: { instancias: { include: { sucursal: true } } },
                },
            },
        });
        if (!c || !c.activo)
            throw new common_1.NotFoundException(`Conjunto #${id} no encontrado`);
        return c;
    }
    async createConjunto(data) {
        const { componentes, variaciones, ...rest } = data;
        const imagen_url = await this.imagenAuto.resolverImagen(data.nombre, data.danza, data.imagen_url ?? undefined);
        return this.prisma.conjunto.create({
            data: {
                ...rest,
                imagen_url: imagen_url ?? undefined,
                componentes: componentes ? { create: componentes } : undefined,
                variaciones: variaciones ? { create: variaciones } : undefined,
            },
            include: {
                componentes: { include: { componente: true } },
            },
        });
    }
    updateConjunto(id, data) {
        return this.prisma.conjunto.update({ where: { id }, data });
    }
    removeConjunto(id) {
        return this.prisma.conjunto.update({ where: { id }, data: { activo: false } });
    }
    async updateComponentes(conjuntoId, componentes) {
        await this.prisma.conjuntoComponente.deleteMany({ where: { conjuntoId } });
        if (componentes.length > 0) {
            await this.prisma.conjuntoComponente.createMany({
                data: componentes.map((c) => ({ conjuntoId, componenteId: c.componenteId, cantidad: c.cantidad })),
            });
        }
        return this.findConjunto(conjuntoId);
    }
    createVariacion(conjuntoId, data) {
        return this.prisma.variacionConjunto.create({
            data: { ...data, conjuntoId },
        });
    }
    updateVariacion(id, data) {
        return this.prisma.variacionConjunto.update({ where: { id }, data });
    }
    removeVariacion(id) {
        return this.prisma.variacionConjunto.update({ where: { id }, data: { activa: false } });
    }
    findAllComponentes() {
        return this.prisma.componente.findMany({
            orderBy: { tipo: 'asc' },
            include: {
                _count: { select: { conjuntos: true, instancias: true } },
            },
        });
    }
    async findComponente(id) {
        const c = await this.prisma.componente.findUnique({
            where: { id },
            include: {
                _count: { select: { conjuntos: true, instancias: true } },
                conjuntos: { include: { conjunto: { select: { id: true, nombre: true, danza: true } } } },
            },
        });
        if (!c)
            throw new common_1.NotFoundException(`Componente #${id} no encontrado`);
        return c;
    }
    createComponente(data) {
        return this.prisma.componente.create({ data });
    }
    updateComponente(id, data) {
        return this.prisma.componente.update({ where: { id }, data });
    }
    removeComponente(id) {
        return this.prisma.componente.delete({ where: { id } });
    }
};
exports.CatalogoService = CatalogoService;
exports.CatalogoService = CatalogoService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService,
        imagen_auto_service_js_1.ImagenAutoService])
], CatalogoService);
//# sourceMappingURL=catalogo.service.js.map