import { PrismaService } from '../prisma/prisma.service.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';
export declare class CajaService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(params?: {
        fechaDesde?: string;
        fechaHasta?: string;
        tipo?: TipoMovimiento;
        concepto?: ConceptoCaja;
        formaPago?: FormaPago;
        contratoId?: number;
        userId?: number;
        sucursalId?: number;
        isAdmin?: boolean;
    }): import(".prisma/client").Prisma.PrismaPromise<({
        sucursal: {
            id: number;
            nombre: string;
        } | null;
        user: {
            id: number;
            nombre: string;
            rol: import(".prisma/client").$Enums.Rol;
        } | null;
        contrato: {
            id: number;
            codigo: string;
            cliente: {
                nombre: string;
            };
        } | null;
    } & {
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
    })[]>;
    stats(filter?: {
        userId?: number;
        sucursalId?: number;
        isAdmin?: boolean;
    }): Promise<{
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
    private static readonly CONCEPTOS_PAGO;
    create(data: {
        tipo: TipoMovimiento;
        concepto: ConceptoCaja;
        monto: number;
        descripcion?: string;
        forma_pago?: FormaPago;
        referencia?: string;
        contratoId?: number;
        userId?: number;
        sucursalId?: number;
    }): Promise<{
        sucursal: {
            id: number;
            nombre: string;
        } | null;
        user: {
            id: number;
            nombre: string;
            rol: import(".prisma/client").$Enums.Rol;
        } | null;
        contrato: {
            id: number;
            codigo: string;
            cliente: {
                nombre: string;
            };
        } | null;
    } & {
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
    }>;
    remove(id: number): Promise<{
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
    }>;
    recalcularTodosPagados(): Promise<{
        id: number;
        codigo: string;
        antes: number;
        despues: number;
    }[]>;
}
