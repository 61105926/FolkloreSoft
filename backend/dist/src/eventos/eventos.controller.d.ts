import { EventosService } from './eventos.service.js';
export declare class EventosController {
    private readonly svc;
    constructor(svc: EventosService);
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
    create(body: any): import(".prisma/client").Prisma.Prisma__EventoFolcloricoClient<{
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
    update(id: number, body: any): Promise<{
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
