-- ══════════════════════════════════════════════════════
-- Fix missing columns/tables not covered by 0_init
-- ══════════════════════════════════════════════════════

-- 1. Add sucursalId to ContratoAlquiler
SET @c1 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ContratoAlquiler' AND COLUMN_NAME = 'sucursalId');
SET @s1 = IF(@c1 = 0, 'ALTER TABLE `ContratoAlquiler` ADD COLUMN `sucursalId` INTEGER NULL', 'SELECT 1');
PREPARE stmt FROM @s1; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @f1 = (SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ContratoAlquiler' AND CONSTRAINT_NAME = 'ContratoAlquiler_sucursalId_fkey' AND CONSTRAINT_TYPE = 'FOREIGN KEY');
SET @s2 = IF(@f1 = 0, 'ALTER TABLE `ContratoAlquiler` ADD CONSTRAINT `ContratoAlquiler_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE SET NULL ON UPDATE CASCADE', 'SELECT 1');
PREPARE stmt FROM @s2; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 2. Add celular to ContratoParticipante
SET @c2 = (SELECT COUNT(*) FROM information_schema.COLUMNS WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'ContratoParticipante' AND COLUMN_NAME = 'celular');
SET @s3 = IF(@c2 = 0, 'ALTER TABLE `ContratoParticipante` ADD COLUMN `celular` VARCHAR(191) NULL', 'SELECT 1');
PREPARE stmt FROM @s3; EXECUTE stmt; DEALLOCATE PREPARE stmt;

-- 3. Create SolicitudReservaWeb
CREATE TABLE IF NOT EXISTS `SolicitudReservaWeb` (
    `id`             INTEGER NOT NULL AUTO_INCREMENT,
    `nombre`         VARCHAR(191) NOT NULL,
    `ci`             VARCHAR(191) NULL,
    `celular`        VARCHAR(191) NOT NULL,
    `evento`         VARCHAR(191) NULL,
    `fecha_evento`   DATETIME(3) NULL,
    `items`          JSON NOT NULL,
    `total_estimado` DECIMAL(10, 2) NOT NULL,
    `anticipo_min`   DECIMAL(10, 2) NOT NULL,
    `estado`         VARCHAR(191) NOT NULL DEFAULT 'PENDIENTE',
    `notas`          TEXT NULL,
    `createdAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt`      DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3) ON UPDATE CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
