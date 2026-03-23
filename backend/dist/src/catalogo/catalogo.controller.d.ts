import { CatalogoService } from './catalogo.service.js';
export declare class CatalogoController {
    private readonly svc;
    constructor(svc: CatalogoService);
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
    createConjunto(body: any): import(".prisma/client").Prisma.Prisma__ConjuntoClient<{
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
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateConjunto(id: number, body: any): import(".prisma/client").Prisma.Prisma__ConjuntoClient<{
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
    updateComponentes(id: number, body: any): Promise<{
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
    createVariacion(id: number, body: any): import(".prisma/client").Prisma.Prisma__VariacionConjuntoClient<{
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
    updateVariacion(id: number, body: any): import(".prisma/client").Prisma.Prisma__VariacionConjuntoClient<{
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
    createComponente(body: any): import(".prisma/client").Prisma.Prisma__ComponenteClient<{
        id: number;
        nombre: string;
        createdAt: Date;
        updatedAt: Date;
        tipo: string;
        descripcion: string | null;
    }, never, import("@prisma/client/runtime/library").DefaultArgs>;
    updateComponente(id: number, body: any): import(".prisma/client").Prisma.Prisma__ComponenteClient<{
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
