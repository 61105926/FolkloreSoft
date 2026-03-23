"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const auth_module_js_1 = require("./auth/auth.module.js");
const users_module_js_1 = require("./users/users.module.js");
const prisma_module_js_1 = require("./prisma/prisma.module.js");
const sucursales_module_js_1 = require("./sucursales/sucursales.module.js");
const catalogo_module_js_1 = require("./catalogo/catalogo.module.js");
const inventario_module_js_1 = require("./inventario/inventario.module.js");
const transferencias_module_js_1 = require("./transferencias/transferencias.module.js");
const eventos_module_js_1 = require("./eventos/eventos.module.js");
const contratos_module_js_1 = require("./contratos/contratos.module.js");
const clientes_module_js_1 = require("./clientes/clientes.module.js");
const caja_module_js_1 = require("./caja/caja.module.js");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({ isGlobal: true }),
            prisma_module_js_1.PrismaModule,
            users_module_js_1.UsersModule,
            auth_module_js_1.AuthModule,
            sucursales_module_js_1.SucursalesModule,
            catalogo_module_js_1.CatalogoModule,
            inventario_module_js_1.InventarioModule,
            transferencias_module_js_1.TransferenciasModule,
            eventos_module_js_1.EventosModule,
            contratos_module_js_1.ContratosModule,
            clientes_module_js_1.ClientesModule,
            caja_module_js_1.CajaModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map