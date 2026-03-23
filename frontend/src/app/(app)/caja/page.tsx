import { cookies } from "next/headers";
import { CajaClient } from "./_components/caja-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

const DEFAULT_STATS = {
  hoy:    { ingresos: 0, egresos: 0, balance: 0, porFormaPago: {} },
  semana: { ingresos: 0, egresos: 0, balance: 0 },
  mes:    { ingresos: 0, egresos: 0, balance: 0 },
};

export default async function CajaPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [movimientos, stats, cuentas] = await Promise.all([
    fetchJson(`${BACKEND}/caja`, token, []),
    fetchJson(`${BACKEND}/caja/stats`, token, DEFAULT_STATS),
    fetchJson(`${BACKEND}/caja/cuentas-por-cobrar`, token, []),
  ]);

  return (
    <CajaClient
      initialMovimientos={movimientos as any[]}
      initialStats={stats as any}
      initialCuentas={cuentas as any[]}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
