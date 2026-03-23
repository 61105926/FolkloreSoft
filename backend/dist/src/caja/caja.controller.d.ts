import { CajaService } from './caja.service.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';
export declare class CajaController {
    private readonly svc;
    constructor(svc: CajaService);
    findAll(fechaDesde?: string, fechaHasta?: string, tipo?: TipoMovimiento, concepto?: ConceptoCaja, formaPago?: FormaPago, contratoId?: string): import(".prisma/client").Prisma.PrismaPromise<({
        contrato: {
            id: number;
            codigo: string;
            cliente: {
                nombre: string;
            };
        } | null;
    } & {
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        descripcion: string | null;
        contratoId: number | null;
        forma_pago: import(".prisma/client").$Enums.FormaPago;
        concepto: import(".prisma/client").$Enums.ConceptoCaja;
        monto: import("@prisma/client/runtime/library").Decimal;
        referencia: string | null;
    })[]>;
    stats(): Promise<{
        hoy: {
            ingresos: number;
            egresos: number;
            balance: number;
            porFormaPago: Record<string, number>;
        };
        semana: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
        mes: {
            ingresos: number;
            egresos: number;
            balance: number;
        };
        totales: {
            anticipo: number;
            garantia: number;
            saldo: number;
        };
    }>;
    cuentasPorCobrar(): Promise<{
        id: number;
        codigo: string;
        estado: import(".prisma/client").$Enums.EstadoContrato;
        cliente: {
            id: number;
            nombre: string;
            celular: string | null;
        };
        total: import("@prisma/client/runtime/library").Decimal;
        fecha_devolucion: Date;
        anticipo: import("@prisma/client/runtime/library").Decimal;
        total_pagado: import("@prisma/client/runtime/library").Decimal;
    }[]>;
    create(body: {
        tipo: TipoMovimiento;
        concepto: ConceptoCaja;
        monto: number;
        descripcion?: string;
        forma_pago?: FormaPago;
        referencia?: string;
        contratoId?: number;
    }): import(".prisma/client").Prisma.Prisma__MovimientoCajaClient<{
        contrato: {
            id: number;
            codigo: string;
            cliente: {
                nombre: string;
            };
        } | null;
    } & {
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        descripcion: string | null;
        contratoId: number | null;
        forma_pago: import(".prisma/client").$Enums.FormaPago;
        concepto: import(".prisma/client").$Enums.ConceptoCaja;
        monto: import("@prisma/client/runtime/library").Decimal;
        referencia: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): Promise<{
        id: number;
        createdAt: Date;
        tipo: import(".prisma/client").$Enums.TipoMovimiento;
        descripcion: string | null;
        contratoId: number | null;
        forma_pago: import(".prisma/client").$Enums.FormaPago;
        concepto: import(".prisma/client").$Enums.ConceptoCaja;
        monto: import("@prisma/client/runtime/library").Decimal;
        referencia: string | null;
    }>;
}
