import { cookies } from "next/headers";
import { StockClient } from "./_components/stock-client";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json();
}

export default async function StockPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const resumen = await fetchJson<
    {
      id: number;
      nombre: string;
      danza: string;
      imagen_url: string | null;
      stockTotal: number;
      variaciones: {
        id: number;
        nombre_variacion: string;
        talla: string | null;
        color: string | null;
        stock: number;
      }[];
    }[]
  >(`${BACKEND}/inventario/stock`, token).catch(() => []);

  const movimientos = await fetchJson<
    {
      id: number;
      tipo: string;
      cantidad: number;
      motivo: string | null;
      createdAt: string;
      variacion: {
        id: number;
        nombre_variacion: string;
        talla: string | null;
        conjunto: { id: number; nombre: string; danza: string };
      };
      user: { id: number; nombre: string } | null;
    }[]
  >(`${BACKEND}/inventario/movimientos`, token).catch(() => []);

  return (
    <StockClient
      resumen={resumen}
      movimientos={movimientos}
      token={token}
      backendUrl="/api/backend"
    />
  );
}
