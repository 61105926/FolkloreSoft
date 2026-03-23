import { PrismaService } from '../prisma/prisma.service.js';
import type { User } from '@prisma/client';
export declare class UsersService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findByEmail(email: string): Promise<User | null>;
    findById(id: number): Promise<User | null>;
    findAll(): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        createdAt: Date;
        updatedAt: Date;
    }[]>;
    create(data: {
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
    update(id: number, data: {
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
