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
exports.ContratosController = void 0;
const common_1 = require("@nestjs/common");
const contratos_service_js_1 = require("./contratos.service.js");
const jwt_auth_guard_js_1 = require("../auth/jwt-auth.guard.js");
let ContratosController = class ContratosController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAll() { return this.svc.findAll(); }
    findOne(id) { return this.svc.findOne(id); }
    create(body) { return this.svc.create(body); }
    update(id, body) { return this.svc.update(id, body); }
    remove(id) { return this.svc.remove(id); }
    confirmar(id) { return this.svc.confirmar(id); }
    entregar(id) { return this.svc.entregar(id); }
    iniciarUso(id) { return this.svc.iniciarUso(id); }
    devolver(id, body) { return this.svc.devolver(id, body); }
    cerrar(id) { return this.svc.cerrar(id); }
    cancelar(id) { return this.svc.cancelar(id); }
    retenerGarantia(id, body) {
        return this.svc.retenerGarantia(id, body.motivo ?? '');
    }
    registrarPago(id, body) { return this.svc.registrarPago(id, body); }
    registrarEgreso(id, body) { return this.svc.registrarEgreso(id, body); }
    addPrenda(id, body) { return this.svc.addPrenda(id, body); }
    updatePrenda(id, body) { return this.svc.updatePrenda(id, body); }
    removePrenda(id) { return this.svc.removePrenda(id); }
    getInstanciasDisponibles(id) { return this.svc.getInstanciasDisponibles(id); }
    getStockForVariacion(id) { return this.svc.getStockForVariacion(id); }
    addGarantia(id, body) { return this.svc.addGarantia(id, body); }
    updateGarantia(id, body) { return this.svc.updateGarantia(id, body); }
    removeGarantia(id) { return this.svc.removeGarantia(id); }
    addParticipante(id, body) { return this.svc.addParticipante(id, body); }
    updateParticipante(id, body) { return this.svc.updateParticipante(id, body); }
    removeParticipante(id) { return this.svc.removeParticipante(id); }
    marcarDevuelto(id, body) { return this.svc.marcarDevuelto(id, body); }
};
exports.ContratosController = ContratosController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "findAll", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "findOne", null);
__decorate([
    (0, common_1.Post)(),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "create", null);
__decorate([
    (0, common_1.Patch)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "update", null);
__decorate([
    (0, common_1.Delete)(':id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "remove", null);
__decorate([
    (0, common_1.Patch)(':id/confirmar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "confirmar", null);
__decorate([
    (0, common_1.Patch)(':id/entregar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "entregar", null);
__decorate([
    (0, common_1.Patch)(':id/iniciar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "iniciarUso", null);
__decorate([
    (0, common_1.Patch)(':id/devolver'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "devolver", null);
__decorate([
    (0, common_1.Patch)(':id/cerrar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "cerrar", null);
__decorate([
    (0, common_1.Patch)(':id/cancelar'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "cancelar", null);
__decorate([
    (0, common_1.Patch)(':id/retener'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "retenerGarantia", null);
__decorate([
    (0, common_1.Post)(':id/registrar-pago'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "registrarPago", null);
__decorate([
    (0, common_1.Post)(':id/registrar-egreso'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "registrarEgreso", null);
__decorate([
    (0, common_1.Post)(':id/prendas'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "addPrenda", null);
__decorate([
    (0, common_1.Patch)('prendas/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "updatePrenda", null);
__decorate([
    (0, common_1.Delete)('prendas/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "removePrenda", null);
__decorate([
    (0, common_1.Get)('prendas/:id/instancias-disponibles'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "getInstanciasDisponibles", null);
__decorate([
    (0, common_1.Get)('variacion/:id/stock'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "getStockForVariacion", null);
__decorate([
    (0, common_1.Post)(':id/garantias'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "addGarantia", null);
__decorate([
    (0, common_1.Patch)('garantias/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "updateGarantia", null);
__decorate([
    (0, common_1.Delete)('garantias/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "removeGarantia", null);
__decorate([
    (0, common_1.Post)(':id/participantes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "addParticipante", null);
__decorate([
    (0, common_1.Patch)('participantes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "updateParticipante", null);
__decorate([
    (0, common_1.Delete)('participantes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "removeParticipante", null);
__decorate([
    (0, common_1.Patch)('participantes/:id/devolver'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], ContratosController.prototype, "marcarDevuelto", null);
exports.ContratosController = ContratosController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Controller)('contratos'),
    __metadata("design:paramtypes", [contratos_service_js_1.ContratosService])
], ContratosController);
//# sourceMappingURL=contratos.controller.js.map