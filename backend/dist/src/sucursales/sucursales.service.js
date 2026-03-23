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
exports.SucursalesService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let SucursalesService = class SucursalesService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll() {
        return this.prisma.sucursal.findMany({ orderBy: { nombre: 'asc' } });
    }
    async findOne(id) {
        const s = await this.prisma.sucursal.findUnique({ where: { id } });
        if (!s)
            throw new common_1.NotFoundException(`Sucursal #${id} no encontrada`);
        return s;
    }
    create(data) {
        return this.prisma.sucursal.create({ data });
    }
    update(id, data) {
        return this.prisma.sucursal.update({ where: { id }, data });
    }
    remove(id) {
        return this.prisma.sucursal.delete({ where: { id } });
    }
};
exports.SucursalesService = SucursalesService;
exports.SucursalesService = SucursalesService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], SucursalesService);
//# sourceMappingURL=sucursales.service.js.map