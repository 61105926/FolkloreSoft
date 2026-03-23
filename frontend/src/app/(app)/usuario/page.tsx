import { cookies } from "next/headers";
import { UsuariosClient } from "./_components/usuarios-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export interface UsuarioRow {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "VENDEDOR" | "BODEGUERO" | "CAJERO";
  activo: boolean;
  sucursalId: number | null;
  sucursal?: { id: number; nombre: string; ciudad: string } | null;
  createdAt: string;
  updatedAt: string;
}

export interface SucursalOption {
  id: number;
  nombre: string;
  ciudad: string;
}

async function fetchJson<T>(url: string, token: string, fallback: T): Promise<T> {
  try {
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!res.ok) return fallback;
    return res.json();
  } catch {
    return fallback;
  }
}

export default async function UsuariosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [usuarios, sucursales] = await Promise.all([
    fetchJson<UsuarioRow[]>(`${BACKEND}/users`, token, []),
    fetchJson<SucursalOption[]>(`${BACKEND}/sucursales`, token, []),
  ]);

  return (
    <UsuariosClient
      initialUsuarios={usuarios}
      sucursales={sucursales}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
