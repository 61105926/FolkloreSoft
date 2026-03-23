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
exports.CatalogoController = void 0;
const common_1 = require("@nestjs/common");
const catalogo_service_js_1 = require("./catalogo.service.js");
const jwt_auth_guard_js_1 = require("../auth/jwt-auth.guard.js");
let CatalogoController = class CatalogoController {
    svc;
    constructor(svc) {
        this.svc = svc;
    }
    findAllConjuntos() { return this.svc.findAllConjuntos(); }
    findConjunto(id) { return this.svc.findConjunto(id); }
    createConjunto(body) { return this.svc.createConjunto(body); }
    updateConjunto(id, body) { return this.svc.updateConjunto(id, body); }
    updateComponentes(id, body) { return this.svc.updateComponentes(id, body.componentes ?? []); }
    removeConjunto(id) { return this.svc.removeConjunto(id); }
    createVariacion(id, body) { return this.svc.createVariacion(id, body); }
    updateVariacion(id, body) { return this.svc.updateVariacion(id, body); }
    removeVariacion(id) { return this.svc.removeVariacion(id); }
    findAllComponentes() { return this.svc.findAllComponentes(); }
    findComponente(id) { return this.svc.findComponente(id); }
    createComponente(body) { return this.svc.createComponente(body); }
    updateComponente(id, body) { return this.svc.updateComponente(id, body); }
    removeComponente(id) { return this.svc.removeComponente(id); }
};
exports.CatalogoController = CatalogoController;
__decorate([
    (0, common_1.Get)('conjuntos'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findAllConjuntos", null);
__decorate([
    (0, common_1.Get)('conjuntos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findConjunto", null);
__decorate([
    (0, common_1.Post)('conjuntos'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "createConjunto", null);
__decorate([
    (0, common_1.Patch)('conjuntos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateConjunto", null);
__decorate([
    (0, common_1.Patch)('conjuntos/:id/componentes'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateComponentes", null);
__decorate([
    (0, common_1.Delete)('conjuntos/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "removeConjunto", null);
__decorate([
    (0, common_1.Post)('conjuntos/:id/variaciones'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "createVariacion", null);
__decorate([
    (0, common_1.Patch)('variaciones/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateVariacion", null);
__decorate([
    (0, common_1.Delete)('variaciones/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "removeVariacion", null);
__decorate([
    (0, common_1.Get)('componentes'),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findAllComponentes", null);
__decorate([
    (0, common_1.Get)('componentes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "findComponente", null);
__decorate([
    (0, common_1.Post)('componentes'),
    __param(0, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "createComponente", null);
__decorate([
    (0, common_1.Patch)('componentes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __param(1, (0, common_1.Body)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number, Object]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "updateComponente", null);
__decorate([
    (0, common_1.Delete)('componentes/:id'),
    __param(0, (0, common_1.Param)('id', common_1.ParseIntPipe)),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Number]),
    __metadata("design:returntype", void 0)
], CatalogoController.prototype, "removeComponente", null);
exports.CatalogoController = CatalogoController = __decorate([
    (0, common_1.UseGuards)(jwt_auth_guard_js_1.JwtAuthGuard),
    (0, common_1.Controller)('catalogo'),
    __metadata("design:paramtypes", [catalogo_service_js_1.CatalogoService])
], CatalogoController);
//# sourceMappingURL=catalogo.controller.js.map