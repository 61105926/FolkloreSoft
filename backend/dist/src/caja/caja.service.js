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
var CajaService_1;
Object.defineProperty(exports, "__esModule", { value: true });
exports.CajaService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const MOV_INCLUDE = {
    contrato: { select: { id: true, codigo: true, cliente: { select: { nombre: true } } } },
    user: { select: { id: true, nombre: true, rol: true } },
    sucursal: { select: { id: true, nombre: true } },
};
let CajaService = class CajaService {
    static { CajaService_1 = this; }
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
        if (!params?.isAdmin) {
            if (params?.sucursalId)
                where['sucursalId'] = params.sucursalId;
            else if (params?.userId)
                where['userId'] = params.userId;
        }
        return this.prisma.movimientoCaja.findMany({
            where, include: MOV_INCLUDE, orderBy: { createdAt: 'desc' },
        });
    }
    async stats(filter) {
        const hoy = new Date();
        const inicioDia = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());
        const inicioSemana = new Date(inicioDia);
        inicioSemana.setDate(inicioDia.getDate() - inicioDia.getDay());
        const inicioMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
        const scope = {};
        if (!filter?.isAdmin) {
            if (filter?.sucursalId)
                scope['sucursalId'] = filter.sucursalId;
            else if (filter?.userId)
                scope['userId'] = filter.userId;
        }
        const [todosHoy, todosSemana, todosMes, todosIngresos] = await Promise.all([
            this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioDia } } }),
            this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioSemana } } }),
            this.prisma.movimientoCaja.findMany({ where: { ...scope, createdAt: { gte: inicioMes } } }),
            this.prisma.movimientoCaja.findMany({ where: { ...scope, tipo: 'INGRESO' }, select: { concepto: true, monto: true } }),
        ]);
        const sumar = (movs, tipo) => movs.filter((m) => m.tipo === tipo).reduce((s, m) => s + Number(m.monto), 0);
        const porFormaPago = (movs, tipo) => {
            const map = {};
            movs.filter((m) => m.tipo === tipo).forEach((m) => {
                map[m.forma_pago] = (map[m.forma_pago] ?? 0) + Number(m.monto);
            });
            return map;
        };
        const sumarConcepto = (conceptos) => todosIngresos.filter((m) => conceptos.includes(m.concepto)).reduce((s, m) => s + Number(m.monto), 0);
        return {
            hoy: {
                ingresos: sumar(todosHoy, 'INGRESO'), egresos: sumar(todosHoy, 'EGRESO'),
                balance: sumar(todosHoy, 'INGRESO') - sumar(todosHoy, 'EGRESO'),
                porFormaPago: porFormaPago(todosHoy, 'INGRESO'),
            },
            semana: {
                ingresos: sumar(todosSemana, 'INGRESO'), egresos: sumar(todosSemana, 'EGRESO'),
                balance: sumar(todosSemana, 'INGRESO') - sumar(todosSemana, 'EGRESO'),
            },
            mes: {
                ingresos: sumar(todosMes, 'INGRESO'), egresos: sumar(todosMes, 'EGRESO'),
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
    static CONCEPTOS_PAGO = [
        'ANTICIPO_CONTRATO',
        'PAGO_SALDO_CONTRATO',
        'DEUDA_COBRADA',
    ];
    async create(data) {
        const movimiento = await this.prisma.movimientoCaja.create({
            data: {
                tipo: data.tipo,
                concepto: data.concepto,
                monto: data.monto,
                descripcion: data.descripcion,
                forma_pago: data.forma_pago ?? 'EFECTIVO',
                referencia: data.referencia,
                contratoId: data.contratoId ?? null,
                userId: data.userId ?? null,
                sucursalId: data.sucursalId ?? null,
            },
            include: MOV_INCLUDE,
        });
        if (data.contratoId &&
            data.tipo === 'INGRESO' &&
            CajaService_1.CONCEPTOS_PAGO.includes(data.concepto)) {
            await this.prisma.contratoAlquiler.update({
                where: { id: data.contratoId },
                data: { total_pagado: { increment: data.monto } },
            });
        }
        return movimiento;
    }
    async remove(id) {
        const m = await this.prisma.movimientoCaja.findUnique({ where: { id } });
        if (!m)
            throw new common_1.NotFoundException(`Movimiento #${id} no encontrado`);
        if (m.contratoId &&
            m.tipo === 'INGRESO' &&
            CajaService_1.CONCEPTOS_PAGO.includes(m.concepto)) {
            await this.prisma.contratoAlquiler.update({
                where: { id: m.contratoId },
                data: { total_pagado: { decrement: Number(m.monto) } },
            });
        }
        return this.prisma.movimientoCaja.delete({ where: { id } });
    }
    async recalcularTodosPagados() {
        const contratos = await this.prisma.contratoAlquiler.findMany({
            select: { id: true, codigo: true, total_pagado: true },
        });
        const resultados = [];
        for (const c of contratos) {
            const movs = await this.prisma.movimientoCaja.findMany({
                where: {
                    contratoId: c.id,
                    tipo: 'INGRESO',
                    concepto: { in: CajaService_1.CONCEPTOS_PAGO },
                },
                select: { monto: true },
            });
            const totalCaja = movs.reduce((s, m) => s + Number(m.monto), 0);
            await this.prisma.contratoAlquiler.update({
                where: { id: c.id },
                data: { total_pagado: totalCaja },
            });
            resultados.push({
                id: c.id,
                codigo: c.codigo,
                antes: Number(c.total_pagado),
                despues: totalCaja,
            });
        }
        return resultados;
    }
};
exports.CajaService = CajaService;
exports.CajaService = CajaService = CajaService_1 = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], CajaService);
//# sourceMappingURL=caja.service.js.map