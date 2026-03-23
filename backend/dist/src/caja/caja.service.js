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
exports.CajaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
let CajaService = class CajaService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    findAll(params) {
        const where = {};
        if (params?.tipo)
            where['tipo'] = params.tipo;
        if (params?.concepto)
            where['concepto'] = params.concepto;
        if (params?.formaPago)
            where['forma_pago'] = params.formaPago;
        if (params?.contratoId)
            where['contratoId'] = params.contratoId;
        if (params?.fechaDesde || params?.fechaHasta) {
            where['createdAt'] = {
                ...(params.fechaDesde ? { gte: new Date(params.fechaDesde) } : {}),
                ...(params.fechaHasta ? { lte: new Date(params.fechaHasta + 'T23:59:59') } : {}),
            };
        }
        return this.prisma.movimientoCaja.findMany({
            where,
            include: {
                contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
            },
            orderBy: { createdAt: 'desc' },
        });
    }
    async stats() {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioSemana = new Date(inicioDia);
        inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const [todosHoy, todosSemana, todosMes, todosIngresos] = await Promise.all([
            this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioDia } } }),
            this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioSemana } } }),
            this.prisma.movimientoCaja.findMany({ where: { createdAt: { gte: inicioMes } } }),
            this.prisma.movimientoCaja.findMany({
                where: { tipo: 'INGRESO' },
                select: { concepto: true, monto: true },
            }),
        ]);
        const sumar = (movs, tipo) => movs.filter((m) => m.tipo === tipo).reduce((s, m) => s + Number(m.monto), 0);
        const porFormaPago = (movs, tipo) => {
            const map = {};
            movs.filter((m) => m.tipo === tipo).forEach((m) => {
                map[m.forma_pago] = (map[m.forma_pago] ?? 0) + Number(m.monto);
            });
            return map;
        };
        const sumarConcepto = (conceptos) => todosIngresos
            .filter((m) => conceptos.includes(m.concepto))
            .reduce((s, m) => s + Number(m.monto), 0);
        return {
            hoy: {
                ingresos: sumar(todosHoy, 'INGRESO'),
                egresos: sumar(todosHoy, 'EGRESO'),
                balance: sumar(todosHoy, 'INGRESO') - sumar(todosHoy, 'EGRESO'),
                porFormaPago: porFormaPago(todosHoy, 'INGRESO'),
            },
            semana: {
                ingresos: sumar(todosSemana, 'INGRESO'),
                egresos: sumar(todosSemana, 'EGRESO'),
                balance: sumar(todosSemana, 'INGRESO') - sumar(todosSemana, 'EGRESO'),
            },
            mes: {
                ingresos: sumar(todosMes, 'INGRESO'),
                egresos: sumar(todosMes, 'EGRESO'),
                balance: sumar(todosMes, 'INGRESO') - sumar(todosMes, 'EGRESO'),
            },
            totales: {
                anticipo: sumarConcepto(['ANTICIPO_CONTRATO']),
                garantia: sumarConcepto(['GARANTIA_EFECTIVO']),
                saldo: sumarConcepto(['PAGO_SALDO_CONTRATO', 'DEUDA_COBRADA']),
            },
        };
    }
    async cuentasPorCobrar() {
        const contratos = await this.prisma.contratoAlquiler.findMany({
            where: { estado: { notIn: ['CERRADO', 'CANCELADO'] } },
            select: {
                id: true, codigo: true, estado: true, fecha_devolucion: true,
                total: true, total_pagado: true, anticipo: true,
                cliente: { select: { id: true, nombre: true, celular: true } },
            },
            orderBy: { fecha_devolucion: 'asc' },
        });
        return contratos.filter((c) => Number(c.total) - Number(c.total_pagado) > 0.01);
    }
    create(data) {
        return this.prisma.movimientoCaja.create({
            data: {
                tipo: data.tipo,
                concepto: data.concepto,
                monto: data.monto,
                descripcion: data.descripcion,
                forma_pago: data.forma_pago ?? 'EFECTIVO',
                referencia: data.referencia,
                contratoId: data.contratoId ?? null,
            },
            include: {
                contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
            },
        });
    }
    async remove(id) {
        const m = await this.prisma.movimientoCaja.findUnique({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException(`Movimiento #${id} no encontrado`);
        return this.prisma.movimientoCaja.delete({ where: { id } });
    }
};
exports.CajaService = CajaService;
exports.CajaService = CajaService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], CajaService);
//# sourceMappingURL=caja.service.js.map