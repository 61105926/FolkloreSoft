-- Cuántos documentos se retuvieron, separado del monto declarado.
-- Antes ambas cosas competían por la columna "valor" y el comprobante las
-- imprimía siempre como plata: un contrato con 1 carnet salía como "Bs. 1.00".
-- Se deja en NULL: no hay forma de saber, para las filas existentes, si el
-- número cargado era un conteo o un monto.

-- AlterTable
ALTER TABLE "ContratoGarantia"
  ADD COLUMN "cantidad" INTEGER;
