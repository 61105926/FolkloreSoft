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
    `nombre` VARCHAR(191) NOT NULL,
    `danza` VARCHAR(191) NOT NULL,
    `descripcion` TEXT NULL,
    `imagen_url` VARCHAR(191) NULL,
    `precio_base` DECIMAL(10, 2) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

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

    UNIQUE INDEX `ConjuntoComponente_conjuntoId_componenteId_key`(`conjuntoId`, `componenteId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `InstanciaConjunto` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `codigo` VARCHAR(191) NOT NULL,
    `conjuntoId` INTEGER NOT NULL,
    `sucursalId` INTEGER NOT NULL,
    `estado` ENUM('DISPONIBLE', 'ALQUILADO', 'EN_TRANSFERENCIA', 'DADO_DE_BAJA') NOT NULL DEFAULT 'DISPONIBLE',
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `InstanciaConjunto_codigo_key`(`codigo`),
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
ALTER TABLE `ConjuntoComponente` ADD CONSTRAINT `ConjuntoComponente_conjuntoId_fkey` FOREIGN KEY (`conjuntoId`) REFERENCES `Conjunto`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ConjuntoComponente` ADD CONSTRAINT `ConjuntoComponente_componenteId_fkey` FOREIGN KEY (`componenteId`) REFERENCES `Componente`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaConjunto` ADD CONSTRAINT `InstanciaConjunto_conjuntoId_fkey` FOREIGN KEY (`conjuntoId`) REFERENCES `Conjunto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaConjunto` ADD CONSTRAINT `InstanciaConjunto_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_componenteId_fkey` FOREIGN KEY (`componenteId`) REFERENCES `Componente`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_sucursalId_fkey` FOREIGN KEY (`sucursalId`) REFERENCES `Sucursal`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `InstanciaComponente` ADD CONSTRAINT `InstanciaComponente_instanciaConjuntoId_fkey` FOREIGN KEY (`instanciaConjuntoId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Transferencia` ADD CONSTRAINT `Transferencia_instanciaConjuntoId_fkey` FOREIGN KEY (`instanciaConjuntoId`) REFERENCES `InstanciaConjunto`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
