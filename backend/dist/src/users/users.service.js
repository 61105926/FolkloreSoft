"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const bcrypt = __importStar(require("bcrypt"));
const USER_SELECT = {
    id: true, nombre: true, email: true, rol: true, activo: true,
    sucursalId: true, createdAt: true, updatedAt: true,
    sucursal: { select: { id: true, nombre: true, ciudad: true } },
};
let UsersService = class UsersService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    async findByEmail(email) {
        return this.prisma.user.findUnique({ where: { email } });
    }
    async findById(id) {
        return this.prisma.user.findUnique({ where: { id } });
    }
    async findAll() {
        return this.prisma.user.findMany({
            select: USER_SELECT,
            orderBy: { nombre: 'asc' },
        });
    }
    async create(data) {
        const exists = await this.prisma.user.findUnique({ where: { email: data.email } });
        if (exists)
            throw new common_1.ConflictException('El email ya está registrado');
        const password_hash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.create({
            data: {
                nombre: data.nombre,
                email: data.email,
                password_hash,
                rol: data.rol ?? 'VENDEDOR',
                sucursalId: data.sucursalId ?? null,
            },
            select: USER_SELECT,
        });
    }
    async update(id, data) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`Usuario #${id} no encontrado`);
        const updateData = {};
        if (data.nombre !== undefined)
            updateData.nombre = data.nombre;
        if (data.email !== undefined)
            updateData.email = data.email;
        if (data.rol !== undefined)
            updateData.rol = data.rol;
        if (data.activo !== undefined)
            updateData.activo = data.activo;
        if ('sucursalId' in data)
            updateData.sucursalId = data.sucursalId ?? null;
        if (data.password)
            updateData.password_hash = await bcrypt.hash(data.password, 10);
        return this.prisma.user.update({ where: { id }, data: updateData, select: USER_SELECT });
    }
    async remove(id) {
        const user = await this.prisma.user.findUnique({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException(`Usuario #${id} no encontrado`);
        return this.prisma.user.update({
            where: { id },
            data: { activo: false },
            select: USER_SELECT,
        });
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], UsersService);
//# sourceMappingURL=users.service.js.map