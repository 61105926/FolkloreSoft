-- ventas migration

-- 1. Drop existing FK from MovimientoCaja -> old Venta (so we can drop Venta)
ALTER TABLE `MovimientoCaja` DROP FOREIGN KEY `MovimientoCaja_ventaId_fkey`;

-- 2. Drop old Venta table (different schema, no data)
DROP TABLE IF EXISTS `Venta`;

-- 3. Recreate Venta with correct schema
CREATE TABLE `Venta` (
    `id`            INTEGER NOT NULL AUTO_INCREMENT,
    `codigo`        VARCHAR(191) NOT NULL,
    `clienteId`     INTEGER NOT NULL,
    `sucursalId`    INTEGER NULL,
    `userId`        INTEGER NULL,
    `estado`        ENUM('PENDIENTE','PAGADO','ENTREGADO','CANCELADO') NOT NULL DEFAULT 'PENDIENTE',
    `total`         DECIMAL(10, 2) NOT NULL,
    `total_pagado`  DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `descuento`     DECIMAL(10, 2) NOT NULL DEFAULT 0,
    `forma_pago`    ENUM('EFECTIVO','TRANSFERENCIA','QR','TARJETA') NULL,
    `observaciones` TEXT NULL,
    `createdAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`     DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    UNIQUE INDEX `Venta_codigo_key`(`codigo`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 4. Create VentaItem
CREATE TABLE `VentaItem` (
    `id`          INTEGER NOT NULL AUTO_INCREMENT,
    `ventaId`     INTEGER NOT NULL,
    `descripcion` VARCHAR(191) NOT NULL,
    `conjuntoId`  INTEGER NULL,
    `variacionId` INTEGER NULL,
    `cantidad`    INTEGER NOT NULL DEFAULT 1,
    `precio_unit` DECIMAL(10, 2) NOT NULL,
    `subtotal`    DECIMAL(10, 2) NOT NULL,
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 5. Foreign keys Venta
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey`  FOREIGN KEY (`clienteId`)  REFERENCES `Cliente`(`id`)   ON DELETE RESTRICT  ON UPDATE CASCADE;
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`)  ON DELETE SET NULL  ON UPDATE CASCADE;

-- 6. Foreign keys VentaItem
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_ventaId_fkey`     FOREIGN KEY (`ventaId`)     REFERENCES `Venta`(`id`)             ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_conjuntoId_fkey`  FOREIGN KEY (`conjuntoId`)  REFERENCES `Conjunto`(`id`)          ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_variacionId_fkey` FOREIGN KEY (`variacionId`) REFERENCES `VariacionConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 7. Re-add FK MovimientoCaja -> Venta
ALTER TABLE `MovimientoCaja` ADD CONSTRAINT `MovimientoCaja_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
