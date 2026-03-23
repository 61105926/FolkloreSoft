import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoContrato, TipoContrato, CiudadContrato, TipoGarantia, FormaPago, TipoParticipante } from '@prisma/client';
export declare class ContratosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    private log;
    private generarCodigo;
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
    findOne(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    create(data: {
        tipo?: TipoContrato;
        eventoId?: number;
        clienteId: number;
        nombre_evento_ext?: string;
        institucion?: string;
        ubicacion?: string;
        ciudad?: CiudadContrato;
        fecha_entrega: string;
        fecha_devolucion: string;
        total?: number;
        anticipo?: number;
        forma_pago?: FormaPago;
        observaciones?: string;
        condiciones?: string;
        prendas?: {
            modelo: string;
            conjuntoId?: number;
            variacionId?: number;
            cantidad_hombres?: number;
            cantidad_cholitas?: number;
            cantidad_machas?: number;
            cantidad_ninos?: number;
            costo_unitario: number;
        }[];
        garantias?: {
            tipo: TipoGarantia;
            descripcion?: string;
            valor?: number;
            participanteId?: number;
        }[];
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    update(id: number, data: {
        tipo?: TipoContrato;
        estado?: EstadoContrato;
        eventoId?: number | null;
        clienteId?: number;
        nombre_evento_ext?: string;
        institucion?: string;
        ubicacion?: string;
        ciudad?: CiudadContrato;
        fecha_entrega?: string;
        fecha_devolucion?: string;
        total?: number;
        anticipo?: number;
        forma_pago?: FormaPago | null;
        observaciones?: string;
        condiciones?: string;
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    entregar(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    iniciarUso(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    devolver(id: number, data?: {
        observaciones?: string;
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    confirmar(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    cerrar(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    cancelar(id: number): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    retenerGarantia(id: number, motivo: string): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    addPrenda(contratoId: number, data: {
        modelo: string;
        conjuntoId?: number;
        variacionId?: number;
        cantidad_hombres?: number;
        cantidad_cholitas?: number;
        cantidad_machas?: number;
        cantidad_ninos?: number;
        costo_unitario: number;
    }): Promise<{
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
    updatePrenda(id: number, data: {
        modelo?: string;
        variacionId?: number | null;
        cantidad_hombres?: number;
        cantidad_cholitas?: number;
        cantidad_machas?: number;
        cantidad_ninos?: number;
        costo_unitario?: number;
    }): Promise<{
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
    addGarantia(contratoId: number, data: {
        tipo: TipoGarantia;
        descripcion?: string;
        valor?: number;
        participanteId?: number;
    }): Promise<{
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
        valor: import("@prisma/client/runtime/library").Decimal | null;
        retenida: boolean;
        motivo_retencion: string | null;
        participanteId: number | null;
    }>;
    updateGarantia(id: number, data: {
        tipo?: TipoGarantia;
        descripcion?: string;
        valor?: number;
        retenida?: boolean;
        motivo_retencion?: string;
        participanteId?: number | null;
    }): import(".prisma/client").Prisma.Prisma__ContratoGarantiaClient<{
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoGarantia;
        descripcion: string | null;
        contratoId: number;
        valor: import("@prisma/client/runtime/library").Decimal | null;
        retenida: boolean;
        motivo_retencion: string | null;
        participanteId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    removeGarantia(id: number): Promise<void>;
    addParticipante(contratoId: number, data: {
        nombre: string;
        ci?: string;
        tipo?: TipoParticipante;
        prendaId?: number;
        notas?: string;
        instanciaConjuntoId?: number;
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
    updateParticipante(id: number, data: {
        nombre?: string;
        ci?: string;
        tipo?: TipoParticipante;
        prendaId?: number | null;
        notas?: string;
        devuelto?: boolean;
        fecha_devolucion?: string | null;
        instanciaConjuntoId?: number | null;
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
    marcarDevuelto(id: number, data?: {
        condicion?: 'COMPLETO' | 'CON_DANOS' | 'PERDIDA';
        notas?: string;
        sancion_monto?: number;
        sancion_motivo?: string;
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
    registrarEgreso(contratoId: number, body: {
        monto: number;
        forma_pago?: FormaPago;
        referencia?: string;
        descripcion?: string;
        concepto?: 'DEVOLUCION_GARANTIA' | 'OTRO_EGRESO';
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    registrarPago(contratoId: number, body: {
        monto: number;
        forma_pago?: FormaPago;
        referencia?: string;
        descripcion?: string;
        concepto?: 'PAGO_SALDO_CONTRATO' | 'DEUDA_COBRADA' | 'ANTICIPO_CONTRATO';
    }): Promise<{
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
            valor: import("@prisma/client/runtime/library").Decimal | null;
            retenida: boolean;
            motivo_retencion: string | null;
            participanteId: number | null;
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
                valor: import("@prisma/client/runtime/library").Decimal | null;
                retenida: boolean;
                motivo_retencion: string | null;
                participanteId: number | null;
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
        movimientosCaja: {
            id: number;
            createdAt: Date;
            tipo: import(".prisma/client").$Enums.TipoMovimiento;
            descripcion: string | null;
            contratoId: number | null;
            forma_pago: import(".prisma/client").$Enums.FormaPago;
            concepto: import(".prisma/client").$Enums.ConceptoCaja;
            monto: import("@prisma/client/runtime/library").Decimal;
            referencia: string | null;
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
    }>;
    getInstanciasDisponibles(prendaId: number): Promise<{
        id: number;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
    }[]>;
    getStockForVariacion(variacionId: number): Promise<{
        variacionId: number;
        disponibles: number;
    }>;
}
