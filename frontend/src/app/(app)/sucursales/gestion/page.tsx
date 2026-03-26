import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SucursalesClient } from "./_components/sucursales-client";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";
const CLIENT_BACKEND = "/api/backend";

export interface SucursalRow {
  id: number;
  nombre: string;
  ciudad: string;
  direccion: string | null;
  createdAt: string;
  _count?: { instanciasConjunto: number; usuarios: number };
}

function decodeRol(token: string): string {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64url").toString("utf-8");
    return JSON.parse(decoded).rol ?? "";
  } catch { return ""; }
}

async function getSucursales(token: string): Promise<SucursalRow[]> {
  try {
    const res = await fetch(`${BACKEND}/sucursales`, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!res.ok) return [];
    return res.json();
  } catch { return []; }
}

export default async function SucursalesGestionPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";
  const rol = decodeRol(token);
  if (rol !== "SUPERADMIN") redirect("/dashboard");

  const sucursales = await getSucursales(token);

  return (
    <SucursalesClient
      initialSucursales={sucursales}
      token={token}
      backendUrl={CLIENT_BACKEND}
    />
  );
}
