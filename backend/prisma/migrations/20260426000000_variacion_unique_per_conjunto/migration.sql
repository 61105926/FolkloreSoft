-- Drop the global unique constraint on codigo_variacion
ALTER TABLE `VariacionConjunto` DROP INDEX `VariacionConjunto_codigo_variacion_key`;

-- Add compound unique constraint: unique per conjunto
ALTER TABLE `VariacionConjunto` ADD CONSTRAINT `VariacionConjunto_conjuntoId_codigo_variacion_key` UNIQUE (`conjuntoId`, `codigo_variacion`);
