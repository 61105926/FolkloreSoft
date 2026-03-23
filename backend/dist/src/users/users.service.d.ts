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
        sucursalId: number | null;
        createdAt: Date;
        updatedAt: Date;
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
    }[]>;
    create(data: {
        nombre: string;
        email: string;
        password: string;
        rol?: string;
        sucursalId?: number;
    }): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        sucursalId: number | null;
        createdAt: Date;
        updatedAt: Date;
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
    }>;
    update(id: number, data: {
        nombre?: string;
        email?: string;
        rol?: string;
        activo?: boolean;
        password?: string;
        sucursalId?: number | null;
    }): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        sucursalId: number | null;
        createdAt: Date;
        updatedAt: Date;
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
    }>;
    remove(id: number): Promise<{
        id: number;
        email: string;
        nombre: string;
        rol: import(".prisma/client").$Enums.Rol;
        activo: boolean;
        sucursalId: number | null;
        createdAt: Date;
        updatedAt: Date;
        sucursal: {
            id: number;
            nombre: string;
            ciudad: string;
        } | null;
    }>;
}
