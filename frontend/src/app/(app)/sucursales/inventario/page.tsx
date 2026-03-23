import { cookies } from "next/headers";
import { TransferenciasKanban } from "./_components/transferencias-kanban";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export interface Transferencia {
  id: number;
  estado: "SOLICITADO" | "EN_TRANSITO" | "RECIBIDO";
  notas: string | null;
  createdAt: string;
  instanciaConjunto: {
    id: number;
    codigo: string;
    variacion: { conjunto: { nombre: string; danza: string } };
  };
  sucursalOrigen: { id: number; nombre: string; ciudad: string };
  sucursalDestino: { id: number; nombre: string; ciudad: string };
}

async function getTransferencias(token: string): Promise<Transferencia[]> {
  try {
    const res = await fetch(`${BACKEND}/transferencias`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

async function getSucursales(token: string) {
  try {
    const res = await fetch(`${BACKEND}/sucursales`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json() as Promise<{ id: number; nombre: string; ciudad: string }[]>;
  } catch {
    return [];
  }
}

async function getStatsSucursales(token: string) {
  try {
    const res = await fetch(`${BACKEND}/inventario/stats-sucursales`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json() as Promise<{ sucursalId: number; nombre: string; ciudad: string; disponible: number; alquilado: number; enTransferencia: number; dadoDeBaja: number; total: number }[]>;
  } catch {
    return [];
  }
}

async function getInstanciasDisponibles(token: string) {
  try {
    const res = await fetch(`${BACKEND}/inventario/instancias-conjunto`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    const data: { id: number; codigo: string; estado: string; variacion: { conjunto: { nombre: string; danza: string } }; sucursal: { id: number; nombre: string } }[] = await res.json();
    return data.filter((ic) => ic.estado === "DISPONIBLE");
  } catch {
    return [];
  }
}

export default async function SucursalesInventarioPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [transferencias, sucursales, instanciasDisponibles, statsSucursales] = await Promise.all([
    getTransferencias(token),
    getSucursales(token),
    getInstanciasDisponibles(token),
    getStatsSucursales(token),
  ]);

  return (
    <TransferenciasKanban
      initialTransferencias={transferencias}
      sucursales={sucursales}
      instanciasDisponibles={instanciasDisponibles}
      statsSucursales={statsSucursales}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
