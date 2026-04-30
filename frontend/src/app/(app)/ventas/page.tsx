import { cookies } from "next/headers";
import { VentasClient } from "./_components/ventas-client";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const CLIENT_BACKEND = "/api/backend";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return [] as unknown as T;
    return res.json();
  } catch {
    return [] as unknown as T;
  }
}

export default async function VentasPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [ventas, clientes, conjuntos, sucursales] = await Promise.all([
    fetchJson(`${BACKEND}/ventas`, token),
    fetchJson(`${BACKEND}/clientes`, token),
    fetchJson(`${BACKEND}/catalogo/conjuntos`, token),
    fetchJson<any[]>(`${BACKEND}/sucursales`, token),
  ]);

  const sucursal = (sucursales as any[])[0] ?? null;

  return (
    <VentasClient
      initialVentas={ventas as any[]}
      initialClientes={clientes as any[]}
      conjuntos={conjuntos as any[]}
      sucursal={sucursal}
      token={token}
      backendUrl={CLIENT_BACKEND}
    />
  );
}
