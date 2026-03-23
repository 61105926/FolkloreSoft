import { PrismaService } from '../prisma/prisma.service.js';
export declare class SucursalesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
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
    create(data: {
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
    update(id: number, data: {
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
