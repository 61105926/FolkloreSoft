import { cookies } from "next/headers";
import { ContratosClient } from "./_components/eventos-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [] as unknown as T;
    return res.json();
  } catch {
    return [] as unknown as T;
  }
}

export default async function ContratosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [contratos, clientes, eventos, sucursales, conjuntos] = await Promise.all([
    fetchJson(`${BACKEND}/contratos`, token),
    fetchJson(`${BACKEND}/clientes`, token),
    fetchJson(`${BACKEND}/eventos`, token),
    fetchJson(`${BACKEND}/sucursales`, token),
    fetchJson(`${BACKEND}/catalogo/conjuntos`, token),
  ]);

  return (
    <ContratosClient
      initialContratos={contratos as any[]}
      initialClientes={clientes as any[]}
      initialEventos={eventos as any[]}
      sucursales={sucursales as any[]}
      conjuntos={conjuntos as any[]}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
