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
exports.InventarioController = void 0;
const common_1 = require("@nestjs/common");
const inventario_service_js_1 = require("./inventario.service.js");
const jwt_auth_guard_js_1 = require("../auth/jwt-auth.guard.js");
let InventarioController = class InventarioController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    statsPorSucursal() {
        return this.svc.statsPorSucursal();
    }
    findAllConjuntos(sucursalId) {
        return this.svc.findAllInstanciasConjunto(sucursalId ? +sucursalId : undefined);
    }
    findConjunto(id) {
        return this.svc.findInstanciaConjunto(id);
    }
    getHistorial(id) {
        return this.svc.getHistorial(id);
    }
    createConjunto(body) {
        return this.svc.createInstanciaConjunto(body);
    }
    ensamblar(id, body) {
        return this.svc.ensamblar(id, body.componenteIds);
    }
    desensamblar(id) {
        return this.svc.desensamblar(id);
    }
    darDeBaja(body) {
        return this.svc.darDeBaja(body.ids, body.motivo);
    }
    updateNotas(id, body) {
        return this.svc.updateNotas(id, body.notas);
    }
    findPool(sucursalId) {
        return this.svc.findPool(sucursalId);
    }
    findAllComponentes(sucursalId) {
        return this.svc.findAllInstanciasComponente(sucursalId ? +sucursalId : undefined);
    }
    createComponente(body) {
        return this.svc.createInstanciaComponente(body);
    }
    updateEstado(id, body) {
        return this.svc.updateEstadoComponente(id, body.estado, body.notas);
    }
};
exports.InventarioController = InventarioController;
__decorate([
    (0, common_1.Get)('stats-sucursales'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "statsPorSucursal", null);
__decorate([
    (0, common_1.Get)('instancias-conjunto'),
    __param(0, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "findAllConjuntos", null);
__decorate([
    (0, common_1.Get)('instancias-conjunto/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "findConjunto", null);
__decorate([
    (0, common_1.Get)('instancias-conjunto/:id/historial'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "getHistorial", null);
__decorate([
    (0, common_1.Post)('instancias-conjunto'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "createConjunto", null);
__decorate([
    (0, common_1.Post)('instancias-conjunto/:id/ensamblar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "ensamblar", null);
__decorate([
    (0, common_1.Post)('instancias-conjunto/:id/desensamblar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "desensamblar", null);
__decorate([
    (0, common_1.Patch)('instancias-conjunto/dar-de-baja'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "darDeBaja", null);
__decorate([
    (0, common_1.Patch)('instancias-conjunto/:id/notas'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "updateNotas", null);
__decorate([
    (0, common_1.Get)('pool'),
    __param(0, (0, common_1.Query)('sucursalId', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "findPool", null);
__decorate([
    (0, common_1.Get)('instancias-componente'),
    __param(0, (0, common_1.Query)('sucursalId')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "findAllComponentes", null);
__decorate([
    (0, common_1.Post)('instancias-componente'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "createComponente", null);
__decorate([
    (0, common_1.Patch)('instancias-componente/:id/estado'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], InventarioController.prototype, "updateEstado", null);
exports.InventarioController = InventarioController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Controller)('inventario'),
    __metadata("design:paramtypes", [inventario_service_js_1.InventarioService])
], InventarioController);
//# sourceMappingURL=inventario.controller.js.map