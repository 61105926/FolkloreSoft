import { TransferenciasService } from './transferencias.service.js';
export declare class TransferenciasController {
    private readonly svc;
    constructor(svc: TransferenciasService);
    findAll(): import(".prisma/client").Prisma.PrismaPromise<({
        instanciaConjunto: {
            variacion: {
                conjunto: {
                    id: number;
                    nombre: string;
                    activo: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string | null;
                    danza: string;
                    genero: string;
                    imagen_url: string | null;
                    precio_base: import("@prisma/client/runtime/library").Decimal;
                    precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                    disponible_venta: boolean;
                    disponible_alquiler: boolean;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
                estilo: string | null;
                precio_alquiler: import("@prisma/client/runtime/library").Decimal | null;
                activa: boolean;
                conjuntoId: number;
            };
        } & {
            id: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            variacionId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            notas: string | null;
        };
        sucursalOrigen: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
        sucursalDestino: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        notas: string | null;
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
    })[]>;
    findOne(id: number): Promise<{
        instanciaConjunto: {
            componentes: ({
                componente: {
                    id: number;
                    nombre: string;
                    createdAt: Date;
                    updatedAt: Date;
                    tipo: string;
                    descripcion: string | null;
                };
            } & {
                id: number;
                sucursalId: number;
                createdAt: Date;
                updatedAt: Date;
                componenteId: number;
                talla: string | null;
                estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
                notas: string | null;
                serial: string;
                instanciaConjuntoId: number | null;
            })[];
            variacion: {
                conjunto: {
                    id: number;
                    nombre: string;
                    activo: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string | null;
                    danza: string;
                    genero: string;
                    imagen_url: string | null;
                    precio_base: import("@prisma/client/runtime/library").Decimal;
                    precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                    disponible_venta: boolean;
                    disponible_alquiler: boolean;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
                estilo: string | null;
                precio_alquiler: import("@prisma/client/runtime/library").Decimal | null;
                activa: boolean;
                conjuntoId: number;
            };
        } & {
            id: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            variacionId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            notas: string | null;
        };
        sucursalOrigen: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
        sucursalDestino: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        notas: string | null;
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
    }>;
    create(body: {
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
        notas?: string;
    }): Promise<{
        instanciaConjunto: {
            variacion: {
                conjunto: {
                    id: number;
                    nombre: string;
                    activo: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string | null;
                    danza: string;
                    genero: string;
                    imagen_url: string | null;
                    precio_base: import("@prisma/client/runtime/library").Decimal;
                    precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                    disponible_venta: boolean;
                    disponible_alquiler: boolean;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
                estilo: string | null;
                precio_alquiler: import("@prisma/client/runtime/library").Decimal | null;
                activa: boolean;
                conjuntoId: number;
            };
        } & {
            id: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            variacionId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            notas: string | null;
        };
        sucursalOrigen: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
        sucursalDestino: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        notas: string | null;
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
    }>;
    marcarEnTransito(id: number): Promise<{
        instanciaConjunto: {
            variacion: {
                conjunto: {
                    id: number;
                    nombre: string;
                    activo: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string | null;
                    danza: string;
                    genero: string;
                    imagen_url: string | null;
                    precio_base: import("@prisma/client/runtime/library").Decimal;
                    precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                    disponible_venta: boolean;
                    disponible_alquiler: boolean;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
                estilo: string | null;
                precio_alquiler: import("@prisma/client/runtime/library").Decimal | null;
                activa: boolean;
                conjuntoId: number;
            };
        } & {
            id: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            variacionId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            notas: string | null;
        };
        sucursalOrigen: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
        sucursalDestino: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        notas: string | null;
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
    }>;
    recibir(id: number): Promise<{
        instanciaConjunto: {
            variacion: {
                conjunto: {
                    id: number;
                    nombre: string;
                    activo: boolean;
                    createdAt: Date;
                    updatedAt: Date;
                    descripcion: string | null;
                    codigo: string | null;
                    danza: string;
                    genero: string;
                    imagen_url: string | null;
                    precio_base: import("@prisma/client/runtime/library").Decimal;
                    precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                    disponible_venta: boolean;
                    disponible_alquiler: boolean;
                };
            } & {
                id: number;
                createdAt: Date;
                updatedAt: Date;
                precio_venta: import("@prisma/client/runtime/library").Decimal | null;
                codigo_variacion: string;
                nombre_variacion: string;
                talla: string | null;
                color: string | null;
                estilo: string | null;
                precio_alquiler: import("@prisma/client/runtime/library").Decimal | null;
                activa: boolean;
                conjuntoId: number;
            };
        } & {
            id: number;
            sucursalId: number;
            createdAt: Date;
            updatedAt: Date;
            codigo: string;
            variacionId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
            notas: string | null;
        };
        sucursalOrigen: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
        sucursalDestino: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        estado: import(".prisma/client").$Enums.EstadoTransferencia;
        notas: string | null;
        instanciaConjuntoId: number;
        sucursalOrigenId: number;
        sucursalDestinoId: number;
    }>;
}
