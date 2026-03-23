import { cookies } from "next/headers";
import { GarantiasClient } from "./_components/garantias-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default async function GarantiasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const garantias = await fetch(`${BACKEND}/contratos/garantias`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((r) => r.ok ? r.json() : [])
    .catch(() => []) as {
      id: number;
      contratoId: number;
      participanteId: number | null;
      tipo: "EFECTIVO" | "DOCUMENTO_CARNET" | "CARTA_INSTITUCIONAL" | "OTRO";
      descripcion: string | null;
      valor: string | null;
      retenida: boolean;
      motivo_retencion: string | null;
      createdAt: string;
      contrato: {
        id: number; codigo: string; estado: string;
        cliente: { id: number; nombre: string; celular: string | null; ci: string | null };
      };
      participante: { id: number; nombre: string; ci: string | null } | null;
    }[];

  return <GarantiasClient initialGarantias={garantias} />;
}
