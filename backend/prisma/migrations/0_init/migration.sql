-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL DEFAULT 'Sin nombre',
    `email` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(191) NOT NULL,
    `rol` ENUM('ADMIN', 'VENDEDOR', 'BODEGUERO', 'CAJERO') NOT NULL DEFAULT 'VENDEDOR',
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `sucursalId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `RefreshToken` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `token` VARCHAR(512) NOT NULL,
    `userId` INTEGER NOT NULL,
    `expiresAt` DATETIME(3) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `RefreshToken_token_key`(`token`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Sucursal` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `ciudad` VARCHAR(191) NOT NULL,
    `direccion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Conjunto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `danza` VARCHAR(191) NOT NULL,
    `genero` VARCHAR(191) NOT NULL DEFAULT 'UNISEX',
    `descripcion` TEXT NULL,
    `imagen_url` VARCHAR(191) NULL,
    `precio_base` DECIMAL(10, 2) NOT NULL,
    `precio_venta` DECIMAL(10, 2) NULL,
    `disponible_venta` BOOLEAN NOT NULL DEFAULT true,
    `disponible_alquiler` BOOLEAN NOT NULL DEFAULT true,
    `activo` BOOLEAN NOT NULL DEFAULT true,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `Conjunto_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `VariacionConjunto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo_variacion` VARCHAR(191) NOT NULL,
    `nombre_variacion` VARCHAR(191) NOT NULL,
    `talla` VARCHAR(191) NULL,
    `color` VARCHAR(191) NULL,
    `estilo` VARCHAR(191) NULL,
    `precio_venta` DECIMAL(10, 2) NULL,
    `precio_alquiler` DECIMAL(10, 2) NULL,
    `activa` BOOLEAN NOT NULL DEFAULT true,
    `conjuntoId` INTEGER NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `VariacionConjunto_codigo_variacion_key`(`codigo_variacion`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Componente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ConjuntoComponente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `conjuntoId` INTEGER NOT NULL,
    `componenteId` INTEGER NOT NULL,
    `cantidad` INTEGER NOT NULL DEFAULT 1,
    `es_obligatorio` BOOLEAN NOT NULL DEFAULT true,
    `es_intercambiable` BOOLEAN NOT NULL DEFAULT false,
    `orden_ensamblaje` INTEGER NOT NULL DEFAULT 0,

    UNIQUE INDEX `ConjuntoComponente_conjuntoId_componenteId_key`(`conjuntoId`, `componenteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstanciaConjunto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `variacionId` INTEGER NOT NULL,
    `sucursalId` INTEGER NOT NULL,
    `estado` ENUM('DISPONIBLE', 'ALQUILADO', 'EN_TRANSFERENCIA', 'DADO_DE_BAJA') NOT NULL DEFAULT 'DISPONIBLE',
    `notas` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstanciaConjunto_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimientoInstancia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanciaId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `estadoAntes` ENUM('DISPONIBLE', 'ALQUILADO', 'EN_TRANSFERENCIA', 'DADO_DE_BAJA') NULL,
    `estadoDespues` ENUM('DISPONIBLE', 'ALQUILADO', 'EN_TRANSFERENCIA', 'DADO_DE_BAJA') NULL,
    `notas` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstanciaComponente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `serial` VARCHAR(191) NOT NULL,
    `talla` VARCHAR(191) NULL,
    `componenteId` INTEGER NOT NULL,
    `sucursalId` INTEGER NOT NULL,
    `instanciaConjuntoId` INTEGER NULL,
    `estado` ENUM('DISPONIBLE_POOL', 'ASIGNADO', 'DANADO', 'EN_TRANSFERENCIA') NOT NULL DEFAULT 'DISPONIBLE_POOL',
    `notas` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstanciaComponente_serial_key`(`serial`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `EventoFolclorico` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `tipo` ENUM('FESTIVAL', 'CONCURSO', 'DESFILE', 'CEREMONIA', 'OTRO') NOT NULL DEFAULT 'FESTIVAL',
    `estado` ENUM('PLANIFICADO', 'CONFIRMADO', 'EN_CURSO', 'FINALIZADO', 'CANCELADO') NOT NULL DEFAULT 'PLANIFICADO',
    `fecha_inicio` DATETIME(3) NOT NULL,
    `fecha_fin` DATETIME(3) NULL,
    `lugar` VARCHAR(191) NULL,
    `sucursalId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Cliente` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nombre` VARCHAR(191) NOT NULL,
    `celular` VARCHAR(191) NULL,
    `ci` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `rol` VARCHAR(191) NOT NULL DEFAULT 'OTRO',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoAlquiler` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `tipo` ENUM('DIRECTO', 'RESERVA') NOT NULL DEFAULT 'DIRECTO',
    `estado` ENUM('RESERVADO', 'CONFIRMADO', 'ENTREGADO', 'EN_USO', 'DEVUELTO', 'CERRADO', 'CON_DEUDA', 'CON_GARANTIA_RETENIDA', 'CANCELADO') NOT NULL DEFAULT 'RESERVADO',
    `eventoId` INTEGER NULL,
    `clienteId` INTEGER NOT NULL,
    `nombre_evento_ext` VARCHAR(191) NULL,
    `institucion` VARCHAR(191) NULL,
    `ubicacion` VARCHAR(191) NULL,
    `ciudad` ENUM('LA_PAZ', 'EL_ALTO', 'INTERIOR') NOT NULL DEFAULT 'LA_PAZ',
    `fecha_contrato` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `fecha_entrega` DATETIME(3) NOT NULL,
    `fecha_devolucion` DATETIME(3) NOT NULL,
    `fecha_entrega_real` DATETIME(3) NULL,
    `fecha_devolucion_real` DATETIME(3) NULL,
    `total` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `anticipo` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `total_pagado` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `forma_pago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'QR', 'TARJETA') NULL,
    `observaciones` TEXT NULL,
    `condiciones` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `ContratoAlquiler_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoHistorial` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contratoId` INTEGER NOT NULL,
    `tipo` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoPrenda` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contratoId` INTEGER NOT NULL,
    `modelo` VARCHAR(191) NOT NULL,
    `conjuntoId` INTEGER NULL,
    `variacionId` INTEGER NULL,
    `cantidad_hombres` INTEGER NOT NULL DEFAULT 0,
    `cantidad_cholitas` INTEGER NOT NULL DEFAULT 0,
    `cantidad_machas` INTEGER NOT NULL DEFAULT 0,
    `cantidad_ninos` INTEGER NOT NULL DEFAULT 0,
    `total` INTEGER NOT NULL,
    `costo_unitario` DECIMAL(10, 2) NOT NULL,
    `subtotal` DECIMAL(10, 2) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoGarantia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contratoId` INTEGER NOT NULL,
    `participanteId` INTEGER NULL,
    `tipo` ENUM('EFECTIVO', 'DOCUMENTO_CARNET', 'CARTA_INSTITUCIONAL', 'OTRO') NOT NULL,
    `descripcion` VARCHAR(191) NULL,
    `valor` DECIMAL(10, 2) NULL,
    `retenida` BOOLEAN NOT NULL DEFAULT false,
    `motivo_retencion` VARCHAR(191) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `ContratoParticipante` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `contratoId` INTEGER NOT NULL,
    `prendaId` INTEGER NULL,
    `instanciaConjuntoId` INTEGER NULL,
    `nombre` VARCHAR(191) NOT NULL,
    `ci` VARCHAR(191) NULL,
    `tipo` ENUM('HOMBRE', 'CHOLITA', 'MACHA', 'NINO', 'OTRO') NOT NULL DEFAULT 'OTRO',
    `notas` TEXT NULL,
    `devuelto` BOOLEAN NOT NULL DEFAULT false,
    `fecha_devolucion` DATETIME(3) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `MovimientoCaja` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `tipo` ENUM('INGRESO', 'EGRESO') NOT NULL,
    `concepto` ENUM('ANTICIPO_CONTRATO', 'PAGO_SALDO_CONTRATO', 'DEUDA_COBRADA', 'GARANTIA_EFECTIVO', 'DEVOLUCION_GARANTIA', 'GASTO_OPERATIVO', 'OTRO_INGRESO', 'OTRO_EGRESO') NOT NULL,
    `monto` DECIMAL(10, 2) NOT NULL,
    `descripcion` TEXT NULL,
    `forma_pago` ENUM('EFECTIVO', 'TRANSFERENCIA', 'QR', 'TARJETA') NOT NULL DEFAULT 'EFECTIVO',
    `referencia` VARCHAR(191) NULL,
    `contratoId` INTEGER NULL,
    `userId` INTEGER NULL,
    `sucursalId` INTEGER NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Transferencia` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `instanciaConjuntoId` INTEGER NOT NULL,
    `sucursalOrigenId` INTEGER NOT NULL,
    `sucursalDestinoId` INTEGER NOT NULL,
    `estado` ENUM('SOLICITADO', 'EN_TRANSITO', 'RECIBIDO') NOT NULL DEFAULT 'SOLICITADO',
    `notas` TEXT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RefreshToken` ADD CONSTRAINT `RefreshToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `VariacionConjunto` ADD CONSTRAINT `VariacionConjunto_conjuntoId_fkey` FOREIGN KEY (`conjuntoId`) REFERENCES `Conjunto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConjuntoComponente` ADD CONSTRAINT `ConjuntoComponente_conjuntoId_fkey` FOREIGN KEY (`conjuntoId`) REFERENCES `Conjunto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConjuntoComponente` ADD CONSTRAINT `ConjuntoComponente_componenteId_fkey` FOREIGN KEY (`componenteId`) REFERENCES `Componente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaConjunto` ADD CONSTRAINT `InstanciaConjunto_variacionId_fkey` FOREIGN KEY (`variacionId`) REFERENCES `VariacionConjunto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaConjunto` ADD CONSTRAINT `InstanciaConjunto_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoInstancia` ADD CONSTRAINT `MovimientoInstancia_instanciaId_fkey` FOREIGN KEY (`instanciaId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_componenteId_fkey` FOREIGN KEY (`componenteId`) REFERENCES `Componente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_instanciaConjuntoId_fkey` FOREIGN KEY (`instanciaConjuntoId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `EventoFolclorico` ADD CONSTRAINT `EventoFolclorico_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoAlquiler` ADD CONSTRAINT `ContratoAlquiler_eventoId_fkey` FOREIGN KEY (`eventoId`) REFERENCES `EventoFolclorico`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoAlquiler` ADD CONSTRAINT `ContratoAlquiler_clienteId_fkey` FOREIGN KEY (`clienteId`) REFERENCES `Cliente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoHistorial` ADD CONSTRAINT `ContratoHistorial_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoAlquiler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoPrenda` ADD CONSTRAINT `ContratoPrenda_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoAlquiler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoPrenda` ADD CONSTRAINT `ContratoPrenda_conjuntoId_fkey` FOREIGN KEY (`conjuntoId`) REFERENCES `Conjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoPrenda` ADD CONSTRAINT `ContratoPrenda_variacionId_fkey` FOREIGN KEY (`variacionId`) REFERENCES `VariacionConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoGarantia` ADD CONSTRAINT `ContratoGarantia_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoAlquiler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoGarantia` ADD CONSTRAINT `ContratoGarantia_participanteId_fkey` FOREIGN KEY (`participanteId`) REFERENCES `ContratoParticipante`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoParticipante` ADD CONSTRAINT `ContratoParticipante_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoAlquiler`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoParticipante` ADD CONSTRAINT `ContratoParticipante_prendaId_fkey` FOREIGN KEY (`prendaId`) REFERENCES `ContratoPrenda`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ContratoParticipante` ADD CONSTRAINT `ContratoParticipante_instanciaConjuntoId_fkey` FOREIGN KEY (`instanciaConjuntoId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoCaja` ADD CONSTRAINT `MovimientoCaja_contratoId_fkey` FOREIGN KEY (`contratoId`) REFERENCES `ContratoAlquiler`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoCaja` ADD CONSTRAINT `MovimientoCaja_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `MovimientoCaja` ADD CONSTRAINT `MovimientoCaja_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transferencia` ADD CONSTRAINT `Transferencia_instanciaConjuntoId_fkey` FOREIGN KEY (`instanciaConjuntoId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transferencia` ADD CONSTRAINT `Transferencia_sucursalOrigenId_fkey` FOREIGN KEY (`sucursalOrigenId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transferencia` ADD CONSTRAINT `Transferencia_sucursalDestinoId_fkey` FOREIGN KEY (`sucursalDestinoId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

