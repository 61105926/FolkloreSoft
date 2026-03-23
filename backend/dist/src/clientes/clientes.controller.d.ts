import { ClientesService } from './clientes.service.js';
export declare class ClientesController {
    private readonly svc;
    constructor(svc: ClientesService);
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
    create(body: any): import(".prisma/client").Prisma.Prisma__ClienteClient<{
        id: number;
        email: string | null;
        nombre: string;
        rol: string;
        createdAt: Date;
        updatedAt: Date;
        celular: string | null;
        ci: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    update(id: number, body: any): Promise<{
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
