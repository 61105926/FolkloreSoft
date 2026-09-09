-- Pasa a "cantidad" los conteos que quedaron guardados como monto.
--
-- Antes de separar los campos, la etiqueta del formulario decía "Cantidad (Bs.)"
-- y el número iba siempre a "valor". Un contrato con 1 carnet quedaba como
-- valor=1 y el comprobante lo imprimía "Bs. 1.00".
--
-- Se convierten sólo los casos donde el número no puede ser un monto declarado:
-- enteros de 1 a 10. Nadie declara una credencial en 1 boliviano; un valor real
-- de respaldo son cientos. Los montos grandes se dejan como están.
UPDATE "ContratoGarantia"
SET "cantidad" = "valor"::INTEGER,
    "valor"    = NULL
WHERE "tipo" IN ('DOCUMENTO_CARNET', 'CARTA_INSTITUCIONAL')
  AND "cantidad" IS NULL
  AND "valor" IS NOT NULL
  AND "valor" > 0
  AND "valor" <= 10
  AND "valor" = TRUNC("valor");
