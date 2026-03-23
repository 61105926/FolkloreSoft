import { SucursalesService } from './sucursales.service.js';
export declare class SucursalesController {
    private readonly svc;
    constructor(svc: SucursalesService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        ciudad: string;
        direccion: string | null;
    }[]>;
    findOne(id: number): Promise<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        ciudad: string;
        direccion: string | null;
    }>;
    create(body: {
        nombre: string;
        ciudad: string;
        direccion?: string;
    }): import(".prisma/client").Prisma.Prisma__SucursalClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        ciudad: string;
        direccion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, body: {
        nombre?: string;
        ciudad?: string;
        direccion?: string;
    }): import(".prisma/client").Prisma.Prisma__SucursalClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        ciudad: string;
        direccion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    remove(id: number): import(".prisma/client").Prisma.Prisma__SucursalClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        ciudad: string;
        direccion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
