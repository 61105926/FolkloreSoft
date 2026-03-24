import { cookies } from "next/headers";
import { ComponentesClient } from "./_components/componentes-client";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";

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

export default async function ComponentesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const componentes = await fetchJson(`${BACKEND}/catalogo/componentes`, token);

  return (
    <ComponentesClient
      initialComponentes={componentes as any[]}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
