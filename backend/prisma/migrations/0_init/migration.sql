-- CreateEnum
CREATE TYPE "Rol" AS ENUM ('SUPERADMIN', 'ADMIN', 'VENDEDOR', 'BODEGUERO', 'CAJERO');

-- CreateEnum
CREATE TYPE "TipoMovimientoStock" AS ENUM ('COMPRA', 'BAJA', 'AJUSTE', 'VENTA');

-- CreateEnum
CREATE TYPE "EstadoInstanciaComponente" AS ENUM ('DISPONIBLE_POOL', 'ASIGNADO', 'DANADO', 'EN_TRANSFERENCIA');

-- CreateEnum
CREATE TYPE "TipoEvento" AS ENUM ('FESTIVAL', 'CONCURSO', 'DESFILE', 'CEREMONIA', 'OTRO');

-- CreateEnum
CREATE TYPE "EstadoEvento" AS ENUM ('PLANIFICADO', 'CONFIRMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO');

-- CreateEnum
CREATE TYPE "TipoContrato" AS ENUM ('DIRECTO', 'RESERVA');

-- CreateEnum
CREATE TYPE "EstadoContrato" AS ENUM ('RESERVADO', 'CONFIRMADO', 'ENTREGADO', 'EN_USO', 'DEVUELTO', 'CERRADO', 'CON_DEUDA', 'CON_GARANTIA_RETENIDA', 'CANCELADO');

-- CreateEnum
CREATE TYPE "CiudadContrato" AS ENUM ('LA_PAZ', 'EL_ALTO', 'INTERIOR');

-- CreateEnum
CREATE TYPE "TipoGarantia" AS ENUM ('EFECTIVO', 'DOCUMENTO_CARNET', 'CARTA_INSTITUCIONAL', 'OTRO');

-- CreateEnum
CREATE TYPE "FormaPago" AS ENUM ('EFECTIVO', 'TRANSFERENCIA', 'QR', 'TARJETA');

-- CreateEnum
CREATE TYPE "TipoParticipante" AS ENUM ('HOMBRE', 'CHOLITA', 'MACHA', 'NINO', 'OTRO');

-- CreateEnum
CREATE TYPE "TipoMovimiento" AS ENUM ('INGRESO', 'EGRESO');

-- CreateEnum
CREATE TYPE "ConceptoCaja" AS ENUM ('ANTICIPO_CONTRATO', 'PAGO_SALDO_CONTRATO', 'DEUDA_COBRADA', 'GARANTIA_EFECTIVO', 'DEVOLUCION_GARANTIA', 'GASTO_OPERATIVO', 'OTRO_INGRESO', 'OTRO_EGRESO', 'VENTA_COBRO', 'VENTA_DEVOLUCION');

-- CreateEnum
CREATE TYPE "EstadoVenta" AS ENUM ('PENDIENTE', 'PAGADO', 'ENTREGADO', 'CANCELADO');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL DEFAULT 'Sin nombre',
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "rol" "Rol" NOT NULL DEFAULT 'VENDEDOR',
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "sucursalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RefreshToken" (
    "id" SERIAL NOT NULL,
    "token" VARCHAR(512) NOT NULL,
    "userId" INTEGER NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "RefreshToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Sucursal" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ciudad" TEXT NOT NULL,
    "direccion" TEXT,
    "telefono" TEXT,
    "email" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sucursal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Conjunto" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT,
    "nombre" TEXT NOT NULL,
    "danza" TEXT NOT NULL,
    "genero" TEXT NOT NULL DEFAULT 'UNISEX',
    "descripcion" TEXT,
    "imagen_url" TEXT,
    "precio_base" DECIMAL(10,2) NOT NULL,
    "precio_venta" DECIMAL(10,2),
    "disponible_venta" BOOLEAN NOT NULL DEFAULT true,
    "disponible_alquiler" BOOLEAN NOT NULL DEFAULT true,
    "activo" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Conjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VariacionConjunto" (
    "id" SERIAL NOT NULL,
    "codigo_variacion" TEXT NOT NULL,
    "nombre_variacion" TEXT NOT NULL,
    "talla" TEXT,
    "color" TEXT,
    "estilo" TEXT,
    "precio_venta" DECIMAL(10,2),
    "precio_alquiler" DECIMAL(10,2),
    "activa" BOOLEAN NOT NULL DEFAULT true,
    "conjuntoId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VariacionConjunto_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Componente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Componente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ConjuntoComponente" (
    "id" SERIAL NOT NULL,
    "conjuntoId" INTEGER NOT NULL,
    "componenteId" INTEGER NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "es_obligatorio" BOOLEAN NOT NULL DEFAULT true,
    "es_intercambiable" BOOLEAN NOT NULL DEFAULT false,
    "orden_ensamblaje" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "ConjuntoComponente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoStock" (
    "id" SERIAL NOT NULL,
    "variacionId" INTEGER NOT NULL,
    "tipo" "TipoMovimientoStock" NOT NULL,
    "cantidad" INTEGER NOT NULL,
    "motivo" TEXT,
    "userId" INTEGER,
    "ventaId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoStock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InstanciaComponente" (
    "id" SERIAL NOT NULL,
    "serial" TEXT NOT NULL,
    "talla" TEXT,
    "componenteId" INTEGER NOT NULL,
    "sucursalId" INTEGER NOT NULL,
    "estado" "EstadoInstanciaComponente" NOT NULL DEFAULT 'DISPONIBLE_POOL',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InstanciaComponente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventoFolclorico" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "descripcion" TEXT,
    "tipo" "TipoEvento" NOT NULL DEFAULT 'FESTIVAL',
    "estado" "EstadoEvento" NOT NULL DEFAULT 'PLANIFICADO',
    "fecha_inicio" TIMESTAMP(3) NOT NULL,
    "fecha_fin" TIMESTAMP(3),
    "lugar" TEXT,
    "sucursalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventoFolclorico_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Cliente" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "celular" TEXT,
    "ci" TEXT,
    "email" TEXT,
    "rol" TEXT NOT NULL DEFAULT 'OTRO',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Cliente_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoAlquiler" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "tipo" "TipoContrato" NOT NULL DEFAULT 'DIRECTO',
    "estado" "EstadoContrato" NOT NULL DEFAULT 'RESERVADO',
    "eventoId" INTEGER,
    "clienteId" INTEGER NOT NULL,
    "nombre_evento_ext" TEXT,
    "institucion" TEXT,
    "ubicacion" TEXT,
    "ciudad" "CiudadContrato" NOT NULL DEFAULT 'LA_PAZ',
    "fecha_contrato" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fecha_entrega" TIMESTAMP(3) NOT NULL,
    "fecha_devolucion" TIMESTAMP(3) NOT NULL,
    "fecha_entrega_real" TIMESTAMP(3),
    "fecha_devolucion_real" TIMESTAMP(3),
    "total" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "anticipo" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "total_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "forma_pago" "FormaPago",
    "observaciones" TEXT,
    "condiciones" TEXT,
    "sucursalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContratoAlquiler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoHistorial" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "tipo" TEXT NOT NULL,
    "descripcion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoHistorial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoPrenda" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "modelo" TEXT NOT NULL,
    "conjuntoId" INTEGER,
    "variacionId" INTEGER,
    "cantidad_hombres" INTEGER NOT NULL DEFAULT 0,
    "cantidad_cholitas" INTEGER NOT NULL DEFAULT 0,
    "cantidad_machas" INTEGER NOT NULL DEFAULT 0,
    "cantidad_ninos" INTEGER NOT NULL DEFAULT 0,
    "total" INTEGER NOT NULL,
    "costo_unitario" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "ContratoPrenda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoGarantia" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "participanteId" INTEGER,
    "tipo" "TipoGarantia" NOT NULL,
    "descripcion" TEXT,
    "valor" DECIMAL(10,2),
    "retenida" BOOLEAN NOT NULL DEFAULT false,
    "motivo_retencion" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoGarantia_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContratoParticipante" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "prendaId" INTEGER,
    "nombre" TEXT NOT NULL,
    "ci" TEXT,
    "celular" TEXT,
    "tipo" "TipoParticipante" NOT NULL DEFAULT 'OTRO',
    "notas" TEXT,
    "devuelto" BOOLEAN NOT NULL DEFAULT false,
    "fecha_devolucion" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContratoParticipante_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MovimientoCaja" (
    "id" SERIAL NOT NULL,
    "tipo" "TipoMovimiento" NOT NULL,
    "concepto" "ConceptoCaja" NOT NULL,
    "monto" DECIMAL(10,2) NOT NULL,
    "descripcion" TEXT,
    "forma_pago" "FormaPago" NOT NULL DEFAULT 'EFECTIVO',
    "referencia" TEXT,
    "contratoId" INTEGER,
    "ventaId" INTEGER,
    "userId" INTEGER,
    "sucursalId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MovimientoCaja_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Venta" (
    "id" SERIAL NOT NULL,
    "codigo" TEXT NOT NULL,
    "clienteId" INTEGER NOT NULL,
    "sucursalId" INTEGER,
    "userId" INTEGER,
    "estado" "EstadoVenta" NOT NULL DEFAULT 'PENDIENTE',
    "total" DECIMAL(10,2) NOT NULL,
    "total_pagado" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "descuento" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "forma_pago" "FormaPago",
    "observaciones" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Venta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VentaItem" (
    "id" SERIAL NOT NULL,
    "ventaId" INTEGER NOT NULL,
    "descripcion" TEXT NOT NULL,
    "conjuntoId" INTEGER,
    "variacionId" INTEGER,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "precio_unit" DECIMAL(10,2) NOT NULL,
    "subtotal" DECIMAL(10,2) NOT NULL,

    CONSTRAINT "VentaItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SolicitudReservaWeb" (
    "id" SERIAL NOT NULL,
    "nombre" TEXT NOT NULL,
    "ci" TEXT,
    "celular" TEXT NOT NULL,
    "evento" TEXT,
    "fecha_evento" TIMESTAMP(3),
    "items" JSONB NOT NULL,
    "total_estimado" DECIMAL(10,2) NOT NULL,
    "anticipo_min" DECIMAL(10,2) NOT NULL,
    "estado" TEXT NOT NULL DEFAULT 'PENDIENTE',
    "notas" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SolicitudReservaWeb_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "RefreshToken_token_key" ON "RefreshToken"("token");

-- CreateIndex
CREATE UNIQUE INDEX "Conjunto_codigo_key" ON "Conjunto"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "VariacionConjunto_conjuntoId_codigo_variacion_key" ON "VariacionConjunto"("conjuntoId", "codigo_variacion");

-- CreateIndex
CREATE UNIQUE INDEX "ConjuntoComponente_conjuntoId_componenteId_key" ON "ConjuntoComponente"("conjuntoId", "componenteId");

-- CreateIndex
CREATE UNIQUE INDEX "InstanciaComponente_serial_key" ON "InstanciaComponente"("serial");

-- CreateIndex
CREATE UNIQUE INDEX "ContratoAlquiler_codigo_key" ON "ContratoAlquiler"("codigo");

-- CreateIndex
CREATE UNIQUE INDEX "Venta_codigo_key" ON "Venta"("codigo");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RefreshToken" ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VariacionConjunto" ADD CONSTRAINT "VariacionConjunto_conjuntoId_fkey" FOREIGN KEY ("conjuntoId") REFERENCES "Conjunto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConjuntoComponente" ADD CONSTRAINT "ConjuntoComponente_conjuntoId_fkey" FOREIGN KEY ("conjuntoId") REFERENCES "Conjunto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ConjuntoComponente" ADD CONSTRAINT "ConjuntoComponente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionConjunto"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoStock" ADD CONSTRAINT "MovimientoStock_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanciaComponente" ADD CONSTRAINT "InstanciaComponente_componenteId_fkey" FOREIGN KEY ("componenteId") REFERENCES "Componente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InstanciaComponente" ADD CONSTRAINT "InstanciaComponente_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventoFolclorico" ADD CONSTRAINT "EventoFolclorico_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAlquiler" ADD CONSTRAINT "ContratoAlquiler_eventoId_fkey" FOREIGN KEY ("eventoId") REFERENCES "EventoFolclorico"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAlquiler" ADD CONSTRAINT "ContratoAlquiler_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoAlquiler" ADD CONSTRAINT "ContratoAlquiler_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoHistorial" ADD CONSTRAINT "ContratoHistorial_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPrenda" ADD CONSTRAINT "ContratoPrenda_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPrenda" ADD CONSTRAINT "ContratoPrenda_conjuntoId_fkey" FOREIGN KEY ("conjuntoId") REFERENCES "Conjunto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoPrenda" ADD CONSTRAINT "ContratoPrenda_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionConjunto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoGarantia" ADD CONSTRAINT "ContratoGarantia_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoGarantia" ADD CONSTRAINT "ContratoGarantia_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "ContratoParticipante"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoParticipante" ADD CONSTRAINT "ContratoParticipante_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContratoParticipante" ADD CONSTRAINT "ContratoParticipante_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "ContratoPrenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MovimientoCaja" ADD CONSTRAINT "MovimientoCaja_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_clienteId_fkey" FOREIGN KEY ("clienteId") REFERENCES "Cliente"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Venta" ADD CONSTRAINT "Venta_sucursalId_fkey" FOREIGN KEY ("sucursalId") REFERENCES "Sucursal"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_ventaId_fkey" FOREIGN KEY ("ventaId") REFERENCES "Venta"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_conjuntoId_fkey" FOREIGN KEY ("conjuntoId") REFERENCES "Conjunto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VentaItem" ADD CONSTRAINT "VentaItem_variacionId_fkey" FOREIGN KEY ("variacionId") REFERENCES "VariacionConjunto"("id") ON DELETE SET NULL ON UPDATE CASCADE;

