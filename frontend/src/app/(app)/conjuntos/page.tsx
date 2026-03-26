import { cookies } from "next/headers";
import { ConjuntosClient } from "./_components/conjuntos-client";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const CLIENT_BACKEND = "/api/backend";

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

export default async function ConjuntosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [conjuntos, componentes, sucursales] = await Promise.all([
    fetchJson(`${BACKEND}/catalogo/conjuntos`, token),
    fetchJson(`${BACKEND}/catalogo/componentes`, token),
    fetchJson(`${BACKEND}/sucursales`, token),
  ]);

  return (
    <ConjuntosClient
      initialConjuntos={conjuntos as any[]}
      componentes={componentes as any[]}
      sucursales={sucursales as any[]}
      token={token}
      backendUrl={CLIENT_BACKEND}
    />
  );
}
