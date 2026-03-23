import { cookies } from "next/headers";
import { UsuariosClient } from "./_components/usuarios-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export interface UsuarioRow {
  id: number;
  nombre: string;
  email: string;
  rol: "ADMIN" | "VENDEDOR" | "BODEGUERO" | "CAJERO";
  activo: boolean;
  createdAt: string;
  updatedAt: string;
}

async function getUsuarios(token: string): Promise<UsuarioRow[]> {
  try {
    const res = await fetch(`${BACKEND}/users`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch {
    return [];
  }
}

export default async function UsuariosPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";
  const usuarios = await getUsuarios(token);

  return (
    <UsuariosClient
      initialUsuarios={usuarios}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
