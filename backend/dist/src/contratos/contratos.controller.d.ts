import { ContratosService } from './contratos.service.js';
export declare class ContratosController {
    private readonly svc;
    constructor(svc: ContratosService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        cliente: {
            id: number;
            nombre: string;
            celular: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
        } | null;
        participantes: {
            id: number;
            devuelto: boolean;
        }[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    })[]>;
    findAllGarantias(): import(".prisma/client").Prisma.PrismaPromise<({
        contrato: {
            id: number;
            codigo: string;
            estado: import(".prisma/client").$Enums.EstadoContrato;
            cliente: {
                id: number;
                nombre: string;
                celular: string | null;
                ci: string | null;
            };
        };
        participante: {
            id: number;
            nombre: string;
            ci: string | null;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoGarantia;
        descripcion: string | null;
        contratoId: number;
        participanteId: number | null;
        valor: import("@prisma/client/runtime/library").Decimal | null;
        retenida: boolean;
        motivo_retencion: string | null;
    })[]>;
    findOne(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    create(body: any): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    update(id: number, body: any): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    confirmar(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    entregar(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    iniciarUso(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    devolver(id: number, body: any): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    cerrar(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    cancelar(id: number): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    retenerGarantia(id: number, body: {
        motivo: string;
    }): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    registrarPago(id: number, body: any): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    registrarEgreso(id: number, body: any): Promise<{
        movimientosCaja: {
            id: number;
            sucursalId: number | null;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            userId: number | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
        }[];
        historial: {
            id: number;
            createdAt: Date;
            tipo: string;
            descripcion: string | null;
            contratoId: number;
        }[];
        cliente: {
            id: number;
            email: string | null;
            nombre: string;
            rol: string;
            createdAt: Date;
            updatedAt: Date;
            celular: string | null;
            ci: string | null;
        };
        _count: {
            prendas: number;
            garantias: number;
            participantes: number;
        };
        evento: {
            id: number;
            nombre: string;
            tipo: import(".prisma/client").$Enums.TipoEvento;
            fecha_inicio: Date;
        } | null;
        prendas: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
            } | null;
            variacion: {
                id: number;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
            } | null;
            participantes: ({
                instanciaConjunto: {
                    id: number;
                    codigo: string;
                    estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
                } | null;
            } & {
                id: number;
                nombre: string;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoParticipante;
                notas: string | null;
                instanciaConjuntoId: number | null;
                contratoId: number;
                fecha_devolucion: Date | null;
                ci: string | null;
                prendaId: number | null;
                devuelto: boolean;
            })[];
        } & {
            id: number;
            conjuntoId: number | null;
            variacionId: number | null;
            total: number;
            contratoId: number;
            modelo: string;
            cantidad_hombres: number;
            cantidad_cholitas: number;
            cantidad_machas: number;
            cantidad_ninos: number;
            costo_unitario: import("@prisma/client/runtime/library").Decimal;
            subtotal: import("@prisma/client/runtime/library").Decimal;
        })[];
        garantias: ({
            participante: {
                id: number;
                nombre: string;
            } | null;
        } & {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        })[];
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
            garantias: {
                id: number;
                createdAt: Date;
                tipo: import(".prisma/client").$Enums.TipoGarantia;
                descripcion: string | null;
                contratoId: number;
                participanteId: number | null;
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
            }[];
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        ciudad: import(".prisma/client").$Enums.CiudadContrato;
        tipo: import(".prisma/client").$Enums.TipoContrato;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        total: import("@prisma/client/runtime/library").Decimal;
        eventoId: number | null;
        clienteId: number;
        nombre_evento_ext: string | null;
        institucion: string | null;
        ubicacion: string | null;
        fecha_contrato: Date;
        fecha_entrega: Date;
        fecha_devolucion: Date;
        fecha_entrega_real: Date | null;
        fecha_devolucion_real: Date | null;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
        forma_pago: import(".prisma/client").$Enums.FormaPago | null;
        observaciones: string | null;
        condiciones: string | null;
    }>;
    addPrenda(id: number, body: any): Promise<{
        variacion: {
            id: number;
            codigo_variacion: string;
            nombre_variacion: string;
            talla: string | null;
            color: string | null;
        } | null;
        participantes: ({
            instanciaConjunto: {
                id: number;
                codigo: string;
                estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            } | null;
        } & {
            id: number;
            nombre: string;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoParticipante;
            notas: string | null;
            instanciaConjuntoId: number | null;
            contratoId: number;
            fecha_devolucion: Date | null;
            ci: string | null;
            prendaId: number | null;
            devuelto: boolean;
        })[];
    } & {
        id: number;
        conjuntoId: number | null;
        variacionId: number | null;
        total: number;
        contratoId: number;
        modelo: string;
        cantidad_hombres: number;
        cantidad_cholitas: number;
        cantidad_machas: number;
        cantidad_ninos: number;
        costo_unitario: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    updatePrenda(id: number, body: any): Promise<{
        id: number;
        conjuntoId: number | null;
        variacionId: number | null;
        total: number;
        contratoId: number;
        modelo: string;
        cantidad_hombres: number;
        cantidad_cholitas: number;
        cantidad_machas: number;
        cantidad_ninos: number;
        costo_unitario: import("@prisma/client/runtime/library").Decimal;
        subtotal: import("@prisma/client/runtime/library").Decimal;
    }>;
    removePrenda(id: number): Promise<void>;
    getInstanciasDisponibles(id: number): Promise<{
        id: number;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
    }[]>;
    getStockForVariacion(id: number): Promise<{
        variacionId: number;
        disponibles: number;
    }>;
    addGarantia(id: number, body: any): Promise<{
        participante: {
            id: number;
            nombre: string;
        } | null;
    } & {
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoGarantia;
        descripcion: string | null;
        contratoId: number;
        participanteId: number | null;
        valor: import("@prisma/client/runtime/library").Decimal | null;
        retenida: boolean;
        motivo_retencion: string | null;
    }>;
    updateGarantia(id: number, body: any): import(".prisma/client").Prisma.Prisma__ContratoGarantiaClient<{
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoGarantia;
        descripcion: string | null;
        contratoId: number;
        participanteId: number | null;
        valor: import("@prisma/client/runtime/library").Decimal | null;
        retenida: boolean;
        motivo_retencion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    removeGarantia(id: number): Promise<void>;
    addParticipante(id: number, body: any): Promise<{
        instanciaConjunto: {
            id: number;
            codigo: string;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        } | null;
        garantias: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        }[];
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoParticipante;
        notas: string | null;
        instanciaConjuntoId: number | null;
        contratoId: number;
        fecha_devolucion: Date | null;
        ci: string | null;
        prendaId: number | null;
        devuelto: boolean;
    }>;
    updateParticipante(id: number, body: any): Promise<{
        instanciaConjunto: {
            id: number;
            codigo: string;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        } | null;
        garantias: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        }[];
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoParticipante;
        notas: string | null;
        instanciaConjuntoId: number | null;
        contratoId: number;
        fecha_devolucion: Date | null;
        ci: string | null;
        prendaId: number | null;
        devuelto: boolean;
    }>;
    removeParticipante(id: number): Promise<void>;
    marcarDevuelto(id: number, body: any): Promise<{
        instanciaConjunto: {
            id: number;
            codigo: string;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        } | null;
        garantias: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoGarantia;
            descripcion: string | null;
            contratoId: number;
            participanteId: number | null;
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
        }[];
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoParticipante;
        notas: string | null;
        instanciaConjuntoId: number | null;
        contratoId: number;
        fecha_devolucion: Date | null;
        ci: string | null;
        prendaId: number | null;
        devuelto: boolean;
    }>;
}
