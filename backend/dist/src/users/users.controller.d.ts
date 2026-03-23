import { UsersService } from './users.service.js';
export declare class UsersController {
    private readonly svc;
    constructor(svc: UsersService);
    findAll(): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(body: {
        nombre: string;
        email: string;
        password: string;
        rol?: string;
    }): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    update(id: number, body: {
        nombre?: string;
        email?: string;
        rol?: string;
        activo?: boolean;
        password?: string;
    }): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
    }>;
}
