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
exports.ContratosService = void 0;
const common_1 = require("@nestjs/common");
const prisma_service_js_1 = require("../prisma/prisma.service.js");
const client_1 = require("@prisma/client");
const INCLUDE_FULL = {
    cliente: true,
    evento: { select: { id: true, nombre: true, tipo: true, fecha_inicio: true } },
    prendas: {
        include: {
            conjunto: { select: { id: true, nombre: true, danza: true } },
            variacion: { select: { id: true, nombre_variacion: true, talla: true, color: true, codigo_variacion: true } },
            participantes: {
                include: { instanciaConjunto: { select: { id: true, codigo: true, estado: true } } },
                orderBy: { createdAt: 'asc' },
            },
        },
        orderBy: { id: 'asc' },
    },
    garantias: {
        include: { participante: { select: { id: true, nombre: true } } },
        orderBy: { createdAt: 'asc' },
    },
    participantes: {
        include: {
            garantias: true,
            instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
        },
        orderBy: { createdAt: 'asc' },
    },
    _count: { select: { prendas: true, garantias: true, participantes: true } },
    historial: { orderBy: { createdAt: 'desc' } },
    movimientosCaja: { orderBy: { createdAt: 'desc' } },
};
const INCLUDE_LIST = {
    cliente: { select: { id: true, nombre: true, celular: true } },
    evento: { select: { id: true, nombre: true } },
    participantes: { select: { id: true, devuelto: true } },
    _count: { select: { prendas: true, garantias: true, participantes: true } },
};
let ContratosService = class ContratosService {
    prisma;
    constructor(prisma) {
        this.prisma = prisma;
    }
    log(contratoId, tipo, descripcion) {
        return this.prisma.contratoHistorial.create({
            data: { contratoId, tipo, descripcion },
        });
    }
    async generarCodigo() {
        const year = new Date().getFullYear();
        const count = await this.prisma.contratoAlquiler.count();
        return `CONT-${year}-${String(count + 1).padStart(4, '0')}`;
    }
    findAll() {
        return this.prisma.contratoAlquiler.findMany({
            include: INCLUDE_LIST,
            orderBy: { createdAt: 'desc' },
        });
    }
    async findOne(id) {
        const c = await this.prisma.contratoAlquiler.findUnique({
            where: { id },
            include: INCLUDE_FULL,
        });
        if (!c)
            throw new common_1.NotFoundException(`Contrato #${id} no encontrado`);
        return c;
    }
    async create(data) {
        const codigo = await this.generarCodigo();
        const { prendas, garantias, ...rest } = data;
        const anticipoVal = Number(rest.anticipo ?? 0);
        const prendaCreate = (prendas ?? []).map((p) => {
            const total = (p.cantidad_hombres ?? 0) +
                (p.cantidad_cholitas ?? 0) +
                (p.cantidad_machas ?? 0) +
                (p.cantidad_ninos ?? 0);
            return {
                modelo: p.modelo,
                conjuntoId: p.conjuntoId,
                variacionId: p.variacionId,
                cantidad_hombres: p.cantidad_hombres ?? 0,
                cantidad_cholitas: p.cantidad_cholitas ?? 0,
                cantidad_machas: p.cantidad_machas ?? 0,
                cantidad_ninos: p.cantidad_ninos ?? 0,
                total,
                costo_unitario: p.costo_unitario,
                subtotal: total * p.costo_unitario,
            };
        });
        const totalAuto = prendaCreate.reduce((s, p) => s + Number(p.subtotal), 0);
        const contrato = await this.prisma.contratoAlquiler.create({
            data: {
                ...rest,
                codigo,
                fecha_entrega: new Date(data.fecha_entrega),
                fecha_devolucion: new Date(data.fecha_devolucion),
                total: data.total ?? totalAuto,
                total_pagado: anticipoVal,
                prendas: prendaCreate.length > 0 ? { create: prendaCreate } : undefined,
                garantias: garantias ? { create: garantias } : undefined,
            },
            include: INCLUDE_FULL,
        });
        await this.log(contrato.id, 'CREADO', `Contrato ${contrato.codigo} creado`);
        const clienteNombre = contrato.cliente.nombre;
        if (anticipoVal > 0) {
            await this.prisma.movimientoCaja.create({
                data: {
                    tipo: 'INGRESO',
                    concepto: 'ANTICIPO_CONTRATO',
                    monto: anticipoVal,
                    descripcion: `Anticipo — ${contrato.codigo} (${clienteNombre})`,
                    forma_pago: data.forma_pago ?? 'EFECTIVO',
                    contratoId: contrato.id,
                },
            });
            await this.log(contrato.id, 'PAGO_REGISTRADO', `Anticipo de Bs. ${anticipoVal.toFixed(2)} registrado en caja (${data.forma_pago ?? 'EFECTIVO'})`);
        }
        const garantiasEfectivo = (garantias ?? []).filter((g) => g.tipo === 'EFECTIVO' && g.valor && g.valor > 0);
        for (const g of garantiasEfectivo) {
            await this.prisma.movimientoCaja.create({
                data: {
                    tipo: 'INGRESO',
                    concepto: 'GARANTIA_EFECTIVO',
                    monto: g.valor,
                    descripcion: `Garantía en efectivo — ${contrato.codigo} (${clienteNombre})`,
                    forma_pago: 'EFECTIVO',
                    contratoId: contrato.id,
                },
            });
        }
        if (garantiasEfectivo.length > 0) {
            const totalGar = garantiasEfectivo.reduce((s, g) => s + g.valor, 0);
            await this.log(contrato.id, 'PAGO_REGISTRADO', `Garantía(s) en efectivo de Bs. ${totalGar.toFixed(2)} registradas en caja`);
        }
        return contrato;
    }
    async update(id, data) {
        await this.findOne(id);
        const { total_pagado: _tp, ...safeData } = data;
        return this.prisma.contratoAlquiler.update({
            where: { id },
            data: {
                ...safeData,
                fecha_entrega: safeData['fecha_entrega'] ? new Date(safeData['fecha_entrega']) : undefined,
                fecha_devolucion: safeData['fecha_devolucion'] ? new Date(safeData['fecha_devolucion']) : undefined,
            },
            include: INCLUDE_FULL,
        });
    }
    async entregar(id) {
        await this.findOne(id);
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.ENTREGADO, fecha_entrega_real: new Date() },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'ENTREGADO', 'Prendas entregadas al cliente');
        return result;
    }
    async iniciarUso(id) {
        await this.findOne(id);
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.EN_USO },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'EN_USO', 'Prendas en uso');
        return result;
    }
    async devolver(id, data) {
        const contrato = await this.findOne(id);
        const conDeuda = Number(contrato.total_pagado) < Number(contrato.total);
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: {
                estado: conDeuda ? client_1.EstadoContrato.CON_DEUDA : client_1.EstadoContrato.DEVUELTO,
                fecha_devolucion_real: new Date(),
                observaciones: data?.observaciones,
            },
            include: INCLUDE_FULL,
        });
        const deudaDesc = conDeuda
            ? `Deuda pendiente: Bs. ${(Number(contrato.total) - Number(contrato.total_pagado)).toFixed(2)}`
            : 'Pagado completo';
        await this.log(id, conDeuda ? 'CON_DEUDA' : 'DEVUELTO', conDeuda ? `Prendas devueltas — ${deudaDesc}` : 'Prendas devueltas correctamente');
        return result;
    }
    async confirmar(id) {
        await this.findOne(id);
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.CONFIRMADO },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'CONFIRMADO', 'Reserva confirmada');
        return result;
    }
    async cerrar(id) {
        await this.findOne(id);
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.CERRADO },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'CERRADO', 'Contrato cerrado');
        return result;
    }
    async cancelar(id) {
        const contrato = await this.findOne(id);
        const instanciaIds = (contrato.participantes ?? [])
            .map((p) => p.instanciaConjuntoId)
            .filter((id) => !!id);
        if (instanciaIds.length > 0) {
            await this.prisma.instanciaConjunto.updateMany({
                where: { id: { in: instanciaIds } },
                data: { estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
            });
        }
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.CANCELADO },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'CANCELADO', 'Contrato cancelado');
        return result;
    }
    async retenerGarantia(id, motivo) {
        await this.findOne(id);
        await this.prisma.contratoGarantia.updateMany({
            where: { contratoId: id },
            data: { retenida: true, motivo_retencion: motivo },
        });
        const result = await this.prisma.contratoAlquiler.update({
            where: { id },
            data: { estado: client_1.EstadoContrato.CON_GARANTIA_RETENIDA },
            include: INCLUDE_FULL,
        });
        await this.log(id, 'GARANTIA_RETENIDA', `Garantía retenida: ${motivo}`);
        return result;
    }
    async remove(id) {
        await this.findOne(id);
        await this.prisma.movimientoCaja.deleteMany({ where: { contratoId: id } });
        return this.prisma.contratoAlquiler.delete({ where: { id } });
    }
    async addPrenda(contratoId, data) {
        const total = (data.cantidad_hombres ?? 0) +
            (data.cantidad_cholitas ?? 0) +
            (data.cantidad_machas ?? 0) +
            (data.cantidad_ninos ?? 0);
        if (data.variacionId && total > 0) {
            const disponibles = await this.prisma.instanciaConjunto.count({
                where: { variacionId: data.variacionId, estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
            });
            if (disponibles < total) {
                throw new common_1.BadRequestException(`Stock insuficiente. Disponibles: ${disponibles}, solicitados: ${total}.`);
            }
        }
        const prenda = await this.prisma.contratoPrenda.create({
            data: {
                contratoId,
                modelo: data.modelo,
                conjuntoId: data.conjuntoId,
                variacionId: data.variacionId,
                cantidad_hombres: data.cantidad_hombres ?? 0,
                cantidad_cholitas: data.cantidad_cholitas ?? 0,
                cantidad_machas: data.cantidad_machas ?? 0,
                cantidad_ninos: data.cantidad_ninos ?? 0,
                total,
                costo_unitario: data.costo_unitario,
                subtotal: total * data.costo_unitario,
            },
            include: {
                participantes: {
                    include: { instanciaConjunto: { select: { id: true, codigo: true, estado: true } } },
                },
                variacion: { select: { id: true, nombre_variacion: true, talla: true, color: true, codigo_variacion: true } },
            },
        });
        await this.log(contratoId, 'PRENDA_AGREGADA', `Prenda agregada: ${data.modelo} (x${total})`);
        return prenda;
    }
    async updatePrenda(id, data) {
        const existing = await this.prisma.contratoPrenda.findUnique({ where: { id } });
        if (!existing)
            throw new common_1.NotFoundException(`Prenda #${id} no encontrada`);
        const hombres = data.cantidad_hombres ?? existing.cantidad_hombres;
        const cholitas = data.cantidad_cholitas ?? existing.cantidad_cholitas;
        const machas = data.cantidad_machas ?? existing.cantidad_machas;
        const ninos = data.cantidad_ninos ?? existing.cantidad_ninos;
        const total = hombres + cholitas + machas + ninos;
        const costo = data.costo_unitario ?? Number(existing.costo_unitario);
        const variacionId = data.variacionId !== undefined ? data.variacionId : existing.variacionId;
        if (variacionId && total > 0) {
            const disponibles = await this.prisma.instanciaConjunto.count({
                where: { variacionId, estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
            });
            if (disponibles < total) {
                throw new common_1.BadRequestException(`Stock insuficiente. Disponibles: ${disponibles}, solicitados: ${total}.`);
            }
        }
        return this.prisma.contratoPrenda.update({
            where: { id },
            data: { ...data, total, subtotal: total * costo },
        });
    }
    async removePrenda(id) {
        const p = await this.prisma.contratoPrenda.findUnique({ where: { id }, select: { contratoId: true, modelo: true } });
        await this.prisma.contratoPrenda.delete({ where: { id } });
        if (p)
            await this.log(p.contratoId, 'PRENDA_REMOVIDA', `Prenda removida: ${p.modelo}`);
    }
    async addGarantia(contratoId, data) {
        const g = await this.prisma.contratoGarantia.create({
            data: { contratoId, ...data },
            include: { participante: { select: { id: true, nombre: true } } },
        });
        const quien = g.participante?.nombre;
        await this.log(contratoId, 'GARANTIA_AGREGADA', `Garantía agregada: ${data.tipo}${quien ? ` — ${quien}` : ''}${data.descripcion ? ` (${data.descripcion})` : ''}`);
        if (data.tipo === client_1.TipoGarantia.EFECTIVO && data.valor && data.valor > 0) {
            const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
                where: { id: contratoId },
                select: { codigo: true, cliente: { select: { nombre: true } } },
            });
            await this.prisma.movimientoCaja.create({
                data: {
                    tipo: 'INGRESO',
                    concepto: 'GARANTIA_EFECTIVO',
                    monto: data.valor,
                    descripcion: `Garantía en efectivo — ${contrato.codigo} (${contrato.cliente.nombre})${quien ? ` · ${quien}` : ''}`,
                    forma_pago: 'EFECTIVO',
                    contratoId,
                },
            });
            await this.log(contratoId, 'PAGO_REGISTRADO', `Garantía en efectivo de Bs. ${data.valor.toFixed(2)} registrada en caja`);
        }
        return g;
    }
    updateGarantia(id, data) {
        return this.prisma.contratoGarantia.update({ where: { id }, data });
    }
    async removeGarantia(id) {
        const g = await this.prisma.contratoGarantia.findUnique({ where: { id }, select: { contratoId: true, tipo: true } });
        await this.prisma.contratoGarantia.delete({ where: { id } });
        if (g)
            await this.log(g.contratoId, 'GARANTIA_REMOVIDA', `Garantía removida: ${g.tipo}`);
    }
    async addParticipante(contratoId, data) {
        const p = await this.prisma.contratoParticipante.create({
            data: { contratoId, ...data },
            include: {
                garantias: true,
                instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
            },
        });
        if (data.instanciaConjuntoId) {
            await this.prisma.instanciaConjunto.update({
                where: { id: data.instanciaConjuntoId },
                data: { estado: client_1.EstadoInstanciaConjunto.ALQUILADO },
            });
        }
        await this.log(contratoId, 'PARTICIPANTE_AGREGADO', `Participante agregado: ${data.nombre}${data.tipo ? ` (${data.tipo})` : ''}`);
        return p;
    }
    async updateParticipante(id, data) {
        const { fecha_devolucion, instanciaConjuntoId, ...rest } = data;
        const old = await this.prisma.contratoParticipante.findUnique({
            where: { id },
            select: { instanciaConjuntoId: true },
        });
        if (old?.instanciaConjuntoId !== undefined && old.instanciaConjuntoId !== instanciaConjuntoId) {
            if (old.instanciaConjuntoId) {
                await this.prisma.instanciaConjunto.update({
                    where: { id: old.instanciaConjuntoId },
                    data: { estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
                });
            }
            if (instanciaConjuntoId) {
                await this.prisma.instanciaConjunto.update({
                    where: { id: instanciaConjuntoId },
                    data: { estado: client_1.EstadoInstanciaConjunto.ALQUILADO },
                });
            }
        }
        return this.prisma.contratoParticipante.update({
            where: { id },
            data: {
                ...rest,
                instanciaConjuntoId,
                fecha_devolucion: fecha_devolucion
                    ? new Date(fecha_devolucion)
                    : fecha_devolucion === null ? null : undefined,
            },
            include: {
                garantias: true,
                instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
            },
        });
    }
    async removeParticipante(id) {
        const p = await this.prisma.contratoParticipante.findUnique({
            where: { id },
            select: { instanciaConjuntoId: true, nombre: true, contratoId: true },
        });
        if (p?.instanciaConjuntoId) {
            await this.prisma.instanciaConjunto.update({
                where: { id: p.instanciaConjuntoId },
                data: { estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
            });
        }
        await this.prisma.contratoParticipante.delete({ where: { id } });
        if (p)
            await this.log(p.contratoId, 'PARTICIPANTE_REMOVIDO', `Participante removido: ${p.nombre}`);
    }
    async marcarDevuelto(id, data) {
        const p = await this.prisma.contratoParticipante.findUniqueOrThrow({
            where: { id },
            select: { instanciaConjuntoId: true, contratoId: true, notas: true, nombre: true },
        });
        if (p.instanciaConjuntoId) {
            const nuevoEstado = data?.condicion === 'PERDIDA'
                ? client_1.EstadoInstanciaConjunto.DADO_DE_BAJA
                : client_1.EstadoInstanciaConjunto.DISPONIBLE;
            await this.prisma.instanciaConjunto.update({
                where: { id: p.instanciaConjuntoId },
                data: { estado: nuevoEstado },
            });
        }
        let updatedNotas;
        const condicionLabel = data?.condicion === 'PERDIDA' ? 'Pérdida' : data?.condicion === 'CON_DANOS' ? 'Con daños' : undefined;
        const notaPrefix = condicionLabel ? `[${condicionLabel}]` : '[Devolución]';
        if (data?.notas?.trim()) {
            updatedNotas = p.notas
                ? `${p.notas}\n${notaPrefix}: ${data.notas.trim()}`
                : `${notaPrefix}: ${data.notas.trim()}`;
        }
        else if (condicionLabel) {
            updatedNotas = p.notas
                ? `${p.notas}\n${notaPrefix}`
                : notaPrefix;
        }
        const updated = await this.prisma.contratoParticipante.update({
            where: { id },
            data: {
                devuelto: true,
                fecha_devolucion: new Date(),
                ...(updatedNotas !== undefined ? { notas: updatedNotas } : {}),
            },
            include: {
                garantias: true,
                instanciaConjunto: { select: { id: true, codigo: true, estado: true } },
            },
        });
        const montoSancion = data?.sancion_monto && data.sancion_monto > 0 ? data.sancion_monto : undefined;
        if (montoSancion) {
            const motivoDefault = data?.condicion === 'PERDIDA' ? 'Pérdida de prenda' : 'Daños en la prenda';
            await this.prisma.contratoGarantia.create({
                data: {
                    contratoId: p.contratoId,
                    participanteId: id,
                    tipo: client_1.TipoGarantia.OTRO,
                    descripcion: data?.sancion_motivo?.trim() || motivoDefault,
                    valor: montoSancion,
                    retenida: true,
                    motivo_retencion: data?.sancion_motivo?.trim() || motivoDefault,
                },
            });
        }
        const condDesc = data?.condicion === 'PERDIDA' ? 'prenda perdida' : data?.condicion === 'CON_DANOS' ? 'con daños' : 'correctamente';
        await this.log(p.contratoId, 'PARTICIPANTE_DEVOLVIO', `${p.nombre} devolvió ${condDesc}${data?.notas ? ` — ${data.notas}` : ''}`);
        return updated;
    }
    async registrarEgreso(contratoId, body) {
        const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
            where: { id: contratoId },
            select: { id: true, codigo: true, cliente: { select: { nombre: true } } },
        });
        const concepto = body.concepto ?? 'DEVOLUCION_GARANTIA';
        await this.prisma.movimientoCaja.create({
            data: {
                tipo: 'EGRESO',
                concepto,
                monto: body.monto,
                descripcion: body.descripcion ?? `Devolución garantía — ${contrato.codigo}`,
                forma_pago: body.forma_pago ?? 'EFECTIVO',
                referencia: body.referencia,
                contratoId,
            },
        });
        const CONCEPTO_LABELS = {
            DEVOLUCION_GARANTIA: 'Garantía devuelta al cliente',
            OTRO_EGRESO: 'Egreso registrado',
        };
        await this.log(contratoId, 'GARANTIA_DEVUELTA', `${CONCEPTO_LABELS[concepto] ?? concepto}: Bs. ${body.monto.toFixed(2)} en ${body.forma_pago ?? 'EFECTIVO'}${body.referencia ? ` — Ref: ${body.referencia}` : ''}`);
        return this.findOne(contratoId);
    }
    async registrarPago(contratoId, body) {
        const contrato = await this.prisma.contratoAlquiler.findUniqueOrThrow({
            where: { id: contratoId },
            select: {
                id: true, codigo: true, total_pagado: true, total: true, estado: true,
                cliente: { select: { nombre: true } },
            },
        });
        const nuevoPagado = Number(contrato.total_pagado) + body.monto;
        const esDeudeaCobrada = ['DEVUELTO', 'CON_DEUDA'].includes(contrato.estado);
        const concepto = body.concepto ?? (esDeudeaCobrada ? 'DEUDA_COBRADA' : 'PAGO_SALDO_CONTRATO');
        const updated = await this.prisma.contratoAlquiler.update({
            where: { id: contratoId },
            data: { total_pagado: nuevoPagado },
            include: INCLUDE_FULL,
        });
        await this.prisma.movimientoCaja.create({
            data: {
                tipo: 'INGRESO',
                concepto,
                monto: body.monto,
                descripcion: body.descripcion ?? `Pago — ${contrato.codigo}`,
                forma_pago: body.forma_pago ?? 'EFECTIVO',
                referencia: body.referencia,
                contratoId,
            },
        });
        const CONCEPTO_LABELS = {
            ANTICIPO_CONTRATO: 'Anticipo',
            PAGO_SALDO_CONTRATO: 'Pago de saldo',
            DEUDA_COBRADA: 'Deuda cobrada',
        };
        await this.log(contratoId, 'PAGO_REGISTRADO', `${CONCEPTO_LABELS[concepto] ?? concepto}: Bs. ${body.monto.toFixed(2)} en ${body.forma_pago ?? 'EFECTIVO'}${body.referencia ? ` — Ref: ${body.referencia}` : ''}`);
        return updated;
    }
    async getInstanciasDisponibles(prendaId) {
        const prenda = await this.prisma.contratoPrenda.findUnique({
            where: { id: prendaId },
            select: { variacionId: true },
        });
        if (!prenda || !prenda.variacionId)
            return [];
        return this.prisma.instanciaConjunto.findMany({
            where: { variacionId: prenda.variacionId, estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
            select: { id: true, codigo: true, estado: true },
            orderBy: { codigo: 'asc' },
        });
    }
    async getStockForVariacion(variacionId) {
        const disponibles = await this.prisma.instanciaConjunto.count({
            where: { variacionId, estado: client_1.EstadoInstanciaConjunto.DISPONIBLE },
        });
        return { variacionId, disponibles };
    }
};
exports.ContratosService = ContratosService;
exports.ContratosService = ContratosService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_js_1.PrismaService])
], ContratosService);
//# sourceMappingURL=contratos.service.js.map