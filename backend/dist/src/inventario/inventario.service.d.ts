import { PrismaService } from '../prisma/prisma.service.js';
import { EstadoInstanciaComponente } from '@prisma/client';
export declare class InventarioService {
    private readonly prisma;
    constructor(prisma: PrismaService);
    findAllInstanciasConjunto(sucursalId?: number): import(".prisma/client").Prisma.PrismaPromise<({
        sucursal: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
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
            createdAt: Date;
            updatedAt: Date;
            componenteId: number;
            talla: string | null;
            sucursalId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
            notas: string | null;
            serial: string;
            instanciaConjuntoId: number | null;
        })[];
        variacion: {
            conjunto: {
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
                    cantidad: number;
                    es_obligatorio: boolean;
                    es_intercambiable: boolean;
                    orden_ensamblaje: number;
                    componenteId: number;
                    conjuntoId: number;
                })[];
            } & {
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
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        variacionId: number;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        notas: string | null;
    })[]>;
    findInstanciaConjunto(id: number): Promise<{
        sucursal: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
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
            createdAt: Date;
            updatedAt: Date;
            componenteId: number;
            talla: string | null;
            sucursalId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
            notas: string | null;
            serial: string;
            instanciaConjuntoId: number | null;
        })[];
        variacion: {
            conjunto: {
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
                    cantidad: number;
                    es_obligatorio: boolean;
                    es_intercambiable: boolean;
                    orden_ensamblaje: number;
                    componenteId: number;
                    conjuntoId: number;
                })[];
            } & {
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
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        variacionId: number;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        notas: string | null;
    }>;
    createInstanciaConjunto(data: {
        codigo: string;
        variacionId: number;
        sucursalId: number;
    }): import(".prisma/client").Prisma.Prisma__InstanciaConjuntoClient<{
        sucursal: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
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
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        variacionId: number;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        notas: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    ensamblar(instanciaConjuntoId: number, componenteIds: number[]): Promise<({
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
            createdAt: Date;
            updatedAt: Date;
            componenteId: number;
            talla: string | null;
            sucursalId: number;
            estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
            notas: string | null;
            serial: string;
            instanciaConjuntoId: number | null;
        })[];
    } & {
        id: number;
        createdAt: Date;
        updatedAt: Date;
        codigo: string;
        variacionId: number;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaConjunto;
        notas: string | null;
    }) | null>;
    desensamblar(instanciaConjuntoId: number): Promise<{
        message: string;
    }>;
    findPool(sucursalId: number): import(".prisma/client").Prisma.PrismaPromise<({
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
        createdAt: Date;
        updatedAt: Date;
        componenteId: number;
        talla: string | null;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
        notas: string | null;
        serial: string;
        instanciaConjuntoId: number | null;
    })[]>;
    findAllInstanciasComponente(sucursalId?: number): import(".prisma/client").Prisma.PrismaPromise<({
        sucursal: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
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
        createdAt: Date;
        updatedAt: Date;
        componenteId: number;
        talla: string | null;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
        notas: string | null;
        serial: string;
        instanciaConjuntoId: number | null;
    })[]>;
    createInstanciaComponente(data: {
        serial: string;
        talla?: string;
        componenteId: number;
        sucursalId: number;
        notas?: string;
    }): import(".prisma/client").Prisma.Prisma__InstanciaComponenteClient<{
        sucursal: {
            id: number;
            nombre: string;
            createdAt: Date;
            updatedAt: Date;
            ciudad: string;
            direccion: string | null;
        };
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
        createdAt: Date;
        updatedAt: Date;
        componenteId: number;
        talla: string | null;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
        notas: string | null;
        serial: string;
        instanciaConjuntoId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateEstadoComponente(id: number, estado: EstadoInstanciaComponente, notas?: string): import(".prisma/client").Prisma.Prisma__InstanciaComponenteClient<{
        id: number;
        createdAt: Date;
        updatedAt: Date;
        componenteId: number;
        talla: string | null;
        sucursalId: number;
        estado: import(".prisma/client").$Enums.EstadoInstanciaComponente;
        notas: string | null;
        serial: string;
        instanciaConjuntoId: number | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    statsPorSucursal(): Promise<{
        sucursalId: number;
        nombre: string;
        ciudad: string;
        disponible: number;
        alquilado: number;
        enTransferencia: number;
        dadoDeBaja: number;
        total: number;
    }[]>;
    darDeBaja(ids: number[], motivo?: string): Promise<{
        affected: number;
    }>;
    updateNotas(id: number, notas: string): Promise<{
        id: number;
        notas: string;
    }>;
    getHistorial(id: number): import(".prisma/client").Prisma.PrismaPromise<{
        id: number;
        createdAt: Date;
        tipo: string;
        notas: string | null;
        estadoAntes: import(".prisma/client").$Enums.EstadoInstanciaConjunto | null;
        estadoDespues: import(".prisma/client").$Enums.EstadoInstanciaConjunto | null;
        instanciaId: number;
    }[]>;
}
