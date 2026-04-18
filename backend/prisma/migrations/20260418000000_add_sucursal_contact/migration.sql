-- AlterTable: add contact fields to Sucursal (idempotent)
ALTER TABLE `Sucursal`
  ADD COLUMN IF NOT EXISTS `telefono` VARCHAR(191) NULL,
  ADD COLUMN IF NOT EXISTS `email`    VARCHAR(191) NULL;
