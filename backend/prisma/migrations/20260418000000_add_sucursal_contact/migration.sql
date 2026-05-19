-- AlterTable: add contact fields to Sucursal
ALTER TABLE `Sucursal`
  ADD COLUMN `telefono` VARCHAR(191) NULL,
  ADD COLUMN `email`    VARCHAR(191) NULL;
