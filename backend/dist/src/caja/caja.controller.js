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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajaController = void 0;
const common_1 = require("@nestjs/common");
const caja_service_js_1 = require("./caja.service.js");
const jwt_auth_guard_js_1 = require("../auth/jwt-auth.guard.js");
const client_1 = require("@prisma/client");
let CajaController = class CajaController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll(req, fechaDesde, fechaHasta, tipo, concepto, formaPago, contratoId) {
        const { id, rol, sucursalId } = req.user;
        const isAdmin = rol === 'ADMIN';
        return this.svc.findAll({
            fechaDesde,
            fechaHasta,
            tipo,
            concepto,
            formaPago,
            contratoId: contratoId ? parseInt(contratoId) : undefined,
            isAdmin,
            userId: isAdmin ? undefined : id,
            sucursalId: isAdmin ? undefined : (sucursalId ?? undefined),
        });
    }
    stats(req) {
        const { id, rol, sucursalId } = req.user;
        const isAdmin = rol === 'ADMIN';
        return this.svc.stats({
            isAdmin,
            userId: isAdmin ? undefined : id,
            sucursalId: isAdmin ? undefined : (sucursalId ?? undefined),
        });
    }
    cuentasPorCobrar() {
        return this.svc.cuentasPorCobrar();
    }
    recalcularPagados(req) {
        if (req.user.rol !== 'ADMIN')
            throw new common_1.ForbiddenException('Solo administradores');
        return this.svc.recalcularTodosPagados();
    }
    create(req, body) {
        return this.svc.create({
            ...body,
            userId: req.user.id,
            sucursalId: req.user.sucursalId ?? undefined,
        });
    }
    remove(id) {
        return this.svc.remove(id);
    }
};
exports.CajaController = CajaController;
__decorate([
    (0, common_1.Get)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Query)('fechaDesde')),
    __param(2, (0, common_1.Query)('fechaHasta')),
    __param(3, (0, common_1.Query)('tipo')),
    __param(4, (0, common_1.Query)('concepto')),
    __param(5, (0, common_1.Query)('formaPago')),
    __param(6, (0, common_1.Query)('contratoId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, String, String, String, String, String, String]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)('stats'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "stats", null);
__decorate([
    (0, common_1.Get)('cuentas-por-cobrar'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "cuentasPorCobrar", null);
__decorate([
    (0, common_1.Post)('recalcular-pagados'),
    __param(0, (0, common_1.Req)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "recalcularPagados", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Req)()),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object, Object]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "create", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CajaController.prototype, "remove", null);
exports.CajaController = CajaController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Controller)('caja'),
    __metadata("design:paramtypes", [caja_service_js_1.CajaService])
], CajaController);
//# sourceMappingURL=caja.controller.js.map