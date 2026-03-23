import { cookies } from "next/headers";
import { ClientesClient } from "./_components/clientes-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

export default async function ClientesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const clientes = await fetch(`${BACKEND}/clientes`, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  })
    .then((r) => r.ok ? r.json() : [])
    .catch(() => []) as {
      id: number; nombre: string; celular: string | null; ci: string | null;
      email: string | null; rol: string; createdAt: string;
      _count: { contratos: number };
    }[];

  return (
    <ClientesClient
      initialClientes={clientes}
      token={token}
      backendUrl={BACKEND}
    />
  );
}
