import { cookies } from "next/headers";
import { ReportesClient } from "./_components/reportes-client";

const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

export default async function ReportesPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [movimientos, stats, porCobrar, contratos, clientes, inventario, garantias] = await Promise.all([
    fetchJson<{
      id: number; tipo: "INGRESO" | "EGRESO"; monto: string; concepto: string;
      forma_pago: string; descripcion: string | null; referencia: string | null;
      createdAt: string;
      contrato?: { id: number; codigo: string; cliente: { nombre: string } } | null;
    }[]>(`${BACKEND}/caja`, token).catch(() => []),

    fetchJson<{
      hoy:    { ingresos: number; egresos: number; balance: number; porFormaPago: Record<string, number> };
      semana: { ingresos: number; egresos: number; balance: number };
      mes:    { ingresos: number; egresos: number; balance: number };
      totales: { anticipo: number; garantia: number; saldo: number };
    }>(`${BACKEND}/caja/stats`, token).catch(() => ({
      hoy: { ingresos: 0, egresos: 0, balance: 0, porFormaPago: {} },
      semana: { ingresos: 0, egresos: 0, balance: 0 },
      mes: { ingresos: 0, egresos: 0, balance: 0 },
      totales: { anticipo: 0, garantia: 0, saldo: 0 },
    })),

    fetchJson<{
      id: number; codigo: string; estado: string;
      total: string; total_pagado: string; anticipo: string;
      cliente: { id: number; nombre: string; celular: string | null };
    }[]>(`${BACKEND}/caja/cuentas-por-cobrar`, token).catch(() => []),

    fetchJson<{
      id: number; codigo: string; estado: string; ciudad: string; tipo: string;
      fecha_contrato: string; fecha_entrega: string; fecha_devolucion: string;
      total: string; anticipo: string; total_pagado: string; forma_pago: string | null;
      cliente: { id: number; nombre: string; celular: string | null };
      evento: { id: number; nombre: string } | null;
      nombre_evento_ext: string | null;
      _count: { prendas: number; garantias: number; participantes: number };
    }[]>(`${BACKEND}/contratos`, token).catch(() => []),

    fetchJson<{
      id: number; nombre: string; celular: string | null; ci: string | null;
      rol: string; createdAt: string; _count: { contratos: number };
    }[]>(`${BACKEND}/clientes`, token).catch(() => []),

    fetchJson<{
      sucursalId: number; nombre: string; ciudad: string;
      disponible: number; alquilado: number; enTransferencia: number; dadoDeBaja: number; total: number;
    }[]>(`${BACKEND}/inventario/stats-sucursales`, token).catch(() => []),

    fetchJson<{
      id: number; tipo: string; descripcion: string | null; valor: string | null;
      retenida: boolean; createdAt: string;
      contrato: { id: number; codigo: string; estado: string; cliente: { nombre: string } };
    }[]>(`${BACKEND}/contratos/garantias`, token).catch(() => []),
  ]);

  return (
    <ReportesClient
      movimientos={movimientos}
      stats={stats}
      porCobrar={porCobrar}
      contratos={contratos}
      clientes={clientes}
      inventario={inventario}
      garantias={garantias}
    />
  );
}
