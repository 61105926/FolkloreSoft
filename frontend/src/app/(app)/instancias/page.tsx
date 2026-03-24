import { cookies } from "next/headers";
import { ArmadoWorkspace } from "./_components/armado-workspace";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Error ${res.status} en ${url}`);
  return res.json();
}

export default async function ArmadoPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [sucursales, instanciasConjunto, statsSucursales] = await Promise.all([
    fetchJson<{ id: number; nombre: string; ciudad: string }[]>(
      `${BACKEND}/sucursales`,
      token
    ).catch(() => []),
    fetchJson<{
      id: number;
      codigo: string;
      estado: string;
      notas: string | null;
      sucursalId: number;
      variacion: { conjunto: { id: number; nombre: string; danza: string; componentes: { cantidad: number; componente: { tipo: string; nombre: string } }[] } };
      sucursal: { id: number; nombre: string };
      componentes: { id: number; serial: string; talla: string | null; componente: { tipo: string; nombre: string }; estado: string }[];
    }[]>(`${BACKEND}/inventario/instancias-conjunto`, token).catch(() => []),
    fetchJson<{
      sucursalId: number; nombre: string; ciudad: string;
      disponible: number; alquilado: number; enTransferencia: number; dadoDeBaja: number; total: number;
    }[]>(`${BACKEND}/inventario/stats-sucursales`, token).catch(() => []),
  ]);

  return (
    <ArmadoWorkspace
      sucursales={sucursales}
      instanciasConjunto={instanciasConjunto}
      statsSucursales={statsSucursales}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
