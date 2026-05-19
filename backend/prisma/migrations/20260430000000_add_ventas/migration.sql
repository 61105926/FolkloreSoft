-- ════════════════════════════════════════════════════
-- Migration: add_ventas  (MySQL 8 compatible, idempotent)
-- ════════════════════════════════════════════════════

-- 1. Extend ConceptoCaja enum with venta values
ALTER TABLE `MovimientoCaja`
  MODIFY `concepto` ENUM(
    'ANTICIPO_CONTRATO','PAGO_SALDO_CONTRATO','DEUDA_COBRADA',
    'GARANTIA_EFECTIVO','DEVOLUCION_GARANTIA','GASTO_OPERATIVO',
    'OTRO_INGRESO','OTRO_EGRESO','VENTA_COBRO','VENTA_DEVOLUCION'
  ) NOT NULL;

-- 2. Drop FKs that reference Venta (conditional — may not exist on fresh DB)
SET @fk1 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'VentaItem' AND CONSTRAINT_NAME = 'VentaItem_ventaId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s1 = IF(@fk1 > 0, 'ALTER TABLE `VentaItem` DROP FOREIGN KEY `VentaItem_ventaId_fkey`', 'SELECT 1');
PREPARE stmt FROM @s1; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk2 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoCaja' AND CONSTRAINT_NAME = 'MovimientoCaja_ventaId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s2 = IF(@fk2 > 0, 'ALTER TABLE `MovimientoCaja` DROP FOREIGN KEY `MovimientoCaja_ventaId_fkey`', 'SELECT 1');
PREPARE stmt FROM @s2; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk3 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoStock' AND CONSTRAINT_NAME = 'MovimientoStock_ventaId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s3 = IF(@fk3 > 0, 'ALTER TABLE `MovimientoStock` DROP FOREIGN KEY `MovimientoStock_ventaId_fkey`', 'SELECT 1');
PREPARE stmt FROM @s3; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Drop VentaItem and Venta (VentaItem first — has FK to Venta)
DROP TABLE IF EXISTS `VentaItem`;
DROP TABLE IF EXISTS `Venta`;

-- 4. Create Venta
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

-- 5. Create VentaItem
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

-- 6. Create MovimientoStock (IF NOT EXISTS — may already exist)
CREATE TABLE IF NOT EXISTS `MovimientoStock` (
    `id`          INTEGER NOT NULL AUTO_INCREMENT,
    `variacionId` INTEGER NOT NULL,
    `tipo`        ENUM('COMPRA','BAJA','AJUSTE','VENTA') NOT NULL,
    `cantidad`    INTEGER NOT NULL,
    `motivo`      VARCHAR(191) NULL,
    `userId`      INTEGER NULL,
    `ventaId`     INTEGER NULL,
    `createdAt`   DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- 7. Add ventaId column to MovimientoCaja (conditional)
SET @col1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoCaja' AND COLUMN_NAME = 'ventaId');
SET @s4 = IF(@col1 = 0, 'ALTER TABLE `MovimientoCaja` ADD COLUMN `ventaId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @s4; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 8. FKs for Venta
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_clienteId_fkey`  FOREIGN KEY (`clienteId`)  REFERENCES `Cliente`(`id`)  ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Venta` ADD CONSTRAINT `Venta_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 9. FKs for VentaItem
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_ventaId_fkey`     FOREIGN KEY (`ventaId`)     REFERENCES `Venta`(`id`)             ON DELETE CASCADE  ON UPDATE CASCADE;
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_conjuntoId_fkey`  FOREIGN KEY (`conjuntoId`)  REFERENCES `Conjunto`(`id`)          ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE `VentaItem` ADD CONSTRAINT `VentaItem_variacionId_fkey` FOREIGN KEY (`variacionId`) REFERENCES `VariacionConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- 10. FKs for MovimientoStock (conditional — table may already have them)
SET @fk4 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoStock' AND CONSTRAINT_NAME = 'MovimientoStock_variacionId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s5 = IF(@fk4 = 0, 'ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_variacionId_fkey` FOREIGN KEY (`variacionId`) REFERENCES `VariacionConjunto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @s5; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk5 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoStock' AND CONSTRAINT_NAME = 'MovimientoStock_userId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s6 = IF(@fk5 = 0, 'ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @s6; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @fk6 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoStock' AND CONSTRAINT_NAME = 'MovimientoStock_ventaId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s7 = IF(@fk6 = 0, 'ALTER TABLE `MovimientoStock` ADD CONSTRAINT `MovimientoStock_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @s7; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 11. FK MovimientoCaja -> Venta (conditional)
SET @fk7 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'MovimientoCaja' AND CONSTRAINT_NAME = 'MovimientoCaja_ventaId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s8 = IF(@fk7 = 0, 'ALTER TABLE `MovimientoCaja` ADD CONSTRAINT `MovimientoCaja_ventaId_fkey` FOREIGN KEY (`ventaId`) REFERENCES `Venta`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @s8; EXECUTE stmt; DEALLOCATE PREPARE stmt;
