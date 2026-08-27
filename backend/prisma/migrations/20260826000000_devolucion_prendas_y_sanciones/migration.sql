-- CreateEnum
CREATE TYPE "TipoSancion" AS ENUM ('DANO', 'PERDIDA', 'RETRASO', 'OTRO');

-- AlterTable
ALTER TABLE "ContratoPrenda"
  ADD COLUMN "cantidad_devuelta" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "cantidad_danada"   INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "cantidad_perdida"  INTEGER NOT NULL DEFAULT 0;

-- Los contratos ya devueltos/cerrados se dan por devueltos completos
UPDATE "ContratoPrenda" p
SET "cantidad_devuelta" = p."total"
FROM "ContratoAlquiler" c
WHERE p."contratoId" = c."id"
  AND c."estado" IN ('DEVUELTO', 'CERRADO');

-- CreateTable
CREATE TABLE "SancionContrato" (
    "id" SERIAL NOT NULL,
    "contratoId" INTEGER NOT NULL,
    "prendaId" INTEGER,
    "participanteId" INTEGER,
    "tipo" "TipoSancion" NOT NULL,
    "descripcion" TEXT,
    "monto" DECIMAL(10,2) NOT NULL,
    "cantidad" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SancionContrato_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "SancionContrato" ADD CONSTRAINT "SancionContrato_contratoId_fkey" FOREIGN KEY ("contratoId") REFERENCES "ContratoAlquiler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SancionContrato" ADD CONSTRAINT "SancionContrato_prendaId_fkey" FOREIGN KEY ("prendaId") REFERENCES "ContratoPrenda"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SancionContrato" ADD CONSTRAINT "SancionContrato_participanteId_fkey" FOREIGN KEY ("participanteId") REFERENCES "ContratoParticipante"("id") ON DELETE SET NULL ON UPDATE CASCADE;
