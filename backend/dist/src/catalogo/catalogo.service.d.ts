import { PrismaService } from '../prisma/prisma.service.js';
import { ImagenAutoService } from './imagen-auto.service.js';
export declare class CatalogoService {
    private readonly prisma;
    private readonly imagenAuto;
    constructor(prisma: PrismaService, imagenAuto: ImagenAutoService);
    findAllConjuntos(): import(".prisma/client").Prisma.PrismaPromise<({
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
        variaciones: ({
            instancias: ({
                sucursal: {
                    id: number;
                    nombre: string;
                    createdAt: Date;
                    updatedAt: Date;
                    ciudad: string;
                    direccion: string | null;
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
            })[];
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
    })[]>;
    findConjunto(id: number): Promise<{
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
        variaciones: ({
            instancias: ({
                sucursal: {
                    id: number;
                    nombre: string;
                    createdAt: Date;
                    updatedAt: Date;
                    ciudad: string;
                    direccion: string | null;
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
            })[];
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
    }>;
    createConjunto(data: {
        codigo?: string;
        nombre: string;
        danza: string;
        genero?: string;
        descripcion?: string;
        imagen_url?: string;
        precio_base: number;
        precio_venta?: number;
        disponible_venta?: boolean;
        disponible_alquiler?: boolean;
        componentes?: {
            componenteId: number;
            cantidad: number;
            es_obligatorio?: boolean;
            es_intercambiable?: boolean;
            orden_ensamblaje?: number;
        }[];
        variaciones?: {
            codigo_variacion: string;
            nombre_variacion: string;
            talla?: string;
            color?: string;
            estilo?: string;
            precio_venta?: number;
            precio_alquiler?: number;
        }[];
    }): Promise<{
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
    }>;
    updateConjunto(id: number, data: {
        codigo?: string;
        nombre?: string;
        danza?: string;
        genero?: string;
        descripcion?: string;
        imagen_url?: string;
        precio_base?: number;
        precio_venta?: number;
        disponible_venta?: boolean;
        disponible_alquiler?: boolean;
        activo?: boolean;
    }): import(".prisma/client").Prisma.Prisma__ConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    removeConjunto(id: number): import(".prisma/client").Prisma.Prisma__ConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateComponentes(conjuntoId: number, componentes: {
        componenteId: number;
        cantidad: number;
    }[]): Promise<{
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
        variaciones: ({
            instancias: ({
                sucursal: {
                    id: number;
                    nombre: string;
                    createdAt: Date;
                    updatedAt: Date;
                    ciudad: string;
                    direccion: string | null;
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
            })[];
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
    }>;
    createVariacion(conjuntoId: number, data: {
        codigo_variacion: string;
        nombre_variacion: string;
        talla?: string;
        color?: string;
        estilo?: string;
        precio_venta?: number;
        precio_alquiler?: number;
    }): import(".prisma/client").Prisma.Prisma__VariacionConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateVariacion(id: number, data: {
        nombre_variacion?: string;
        talla?: string;
        color?: string;
        estilo?: string;
        precio_venta?: number;
        precio_alquiler?: number;
        activa?: boolean;
    }): import(".prisma/client").Prisma.Prisma__VariacionConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    removeVariacion(id: number): import(".prisma/client").Prisma.Prisma__VariacionConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    findAllComponentes(): import(".prisma/client").Prisma.PrismaPromise<({
        _count: {
            conjuntos: number;
            instancias: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    })[]>;
    findComponente(id: number): Promise<{
        conjuntos: ({
            conjunto: {
                id: number;
                nombre: string;
                danza: string;
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
        _count: {
            conjuntos: number;
            instancias: number;
        };
    } & {
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    }>;
    createComponente(data: {
        nombre: string;
        tipo: string;
        descripcion?: string;
    }): import(".prisma/client").Prisma.Prisma__ComponenteClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateComponente(id: number, data: {
        nombre?: string;
        tipo?: string;
        descripcion?: string;
    }): import(".prisma/client").Prisma.Prisma__ComponenteClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    removeComponente(id: number): import(".prisma/client").Prisma.Prisma__ComponenteClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
}
