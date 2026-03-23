import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoEvento, TipoEvento } from '@prisma/client';
export declare class EventosService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: import(".prisma/client").$Enums.TipoEvento;
        descripcion: string | null;
        sucursalId: number | null;
        estado: import(".prisma/client").$Enums.EstadoEvento;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        lugar: string | null;
    })[]>;
    findOne(id: number): Promise<{
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: import(".prisma/client").$Enums.TipoEvento;
        descripcion: string | null;
        sucursalId: number | null;
        estado: import(".prisma/client").$Enums.EstadoEvento;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        lugar: string | null;
    }>;
    create(data: {
        nombre: string;
        descripcion?: string;
        tipo?: TipoEvento;
        estado?: EstadoEvento;
        fecha_inicio: string;
        fecha_fin?: string;
        lugar?: string;
        sucursalId?: number;
    }): import(".prisma/client").Prisma.Prisma__EventoFolcloricoClient<{
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: import(".prisma/client").$Enums.TipoEvento;
        descripcion: string | null;
        sucursalId: number | null;
        estado: import(".prisma/client").$Enums.EstadoEvento;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        lugar: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, data: {
        nombre?: string;
        descripcion?: string;
        tipo?: TipoEvento;
        estado?: EstadoEvento;
        fecha_inicio?: string;
        fecha_fin?: string | null;
        lugar?: string;
        sucursalId?: number | null;
    }): Promise<{
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: import(".prisma/client").$Enums.TipoEvento;
        descripcion: string | null;
        sucursalId: number | null;
        estado: import(".prisma/client").$Enums.EstadoEvento;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        lugar: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: import(".prisma/client").$Enums.TipoEvento;
        descripcion: string | null;
        sucursalId: number | null;
        estado: import(".prisma/client").$Enums.EstadoEvento;
        fecha_inicio: Date;
        fecha_fin: Date | null;
        lugar: string | null;
    }>;
}
