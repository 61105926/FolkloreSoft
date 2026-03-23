import { PrismaService } from '../prisma/prisma.service.js';
export declare class ClientesService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    })[]>;
    findOne(id: number): Promise<{
        _count: {
            contratos: number;
        };
    } & {
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    }>;
    create(data: {
        nombre: string;
        celular?: string;
        ci?: string;
        email?: string;
        rol?: string;
    }): import(".prisma/client").Prisma.Prisma__ClienteClient<{
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, data: {
        nombre?: string;
        celular?: string;
        ci?: string;
        email?: string;
        rol?: string;
    }): Promise<{
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    }>;
}
