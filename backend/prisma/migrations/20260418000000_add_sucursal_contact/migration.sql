-- AlterTable: add contact fields to Sucursal
ALTER TABLE `Sucursal`
  ADD COLUMN `telefono` VARCHAR(191) NULL,
  ADD COLUMN `email`    VARCHAR(191) NULL;

-- AlterEnum: add SUPERADMIN to Rol
ALTER TABLE `User`
  MODIFY `rol` ENUM('SUPERADMIN','ADMIN','VENDEDOR','BODEGUERO','CAJERO') NOT NULL DEFAULT 'VENDEDOR';
