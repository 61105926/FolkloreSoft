import { cookies } from "next/headers";
import { Badge } from "@/components/ui/badge";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table";
import { WeeklyChart, type ChartDay } from "@/components/charts/weekly-chart";
import type { ReactNode } from "react";

const BACKEND = process.env.BACKEND_URL ?? "http://localhost:3001";

async function fetchJson<T>(url: string, token: string): Promise<T> {
  const res = await fetch(url, {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`${res.status}`);
  return res.json() as Promise<T>;
}

// ── Types ──────────────────────────────────────────────────────────────────────

interface CajaStats {
  hoy:    { ingresos: number; egresos: number; balance: number; porFormaPago: Record<string, number> };
  semana: { ingresos: number; egresos: number; balance: number };
  mes:    { ingresos: number; egresos: number; balance: number };
  totales: { anticipo: number; garantia: number; saldo: number };
}

interface Movimiento {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  monto: string;
  concepto: string;
  forma_pago: string;
  createdAt: string;
  contrato?: { id: number; codigo: string; cliente: { nombre: string } } | null;
}

interface Contrato {
  id: number;
  codigo: string;
  estado: string;
  ciudad: string;
  fecha_devolucion: string;
  total: string;
  total_pagado: string;
  cliente: { nombre: string };
  evento?: { nombre: string } | null;
  nombre_evento_ext?: string | null;
  _count: { prendas: number; participantes: number };
}

interface InventarioStat {
  conjuntos: number;
  variaciones: number;
  stockTotal: number;
  sinStock: number;
}

interface CuentaPorCobrar {
  id: number;
  codigo: string;
  estado: string;
  fecha_devolucion: string;
  total: string;
  total_pagado: string;
  cliente: { nombre: string; celular?: string };
}

// ── Helpers ───────────────────────────────────────────────────────────────────

function bs(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function fechaCorta(d: string) {
  return new Date(d).toLocaleDateString("es-BO", { day: "numeric", month: "short" });
}

const ESTADO_MAP: Record<string, { label: string; cls: string }> = {
  RESERVADO:             { label: "Reservado",    cls: "bg-blue-500/10 text-blue-700 border-blue-200" },
  CONFIRMADO:            { label: "Confirmado",   cls: "bg-violet-500/10 text-violet-700 border-violet-200" },
  ENTREGADO:             { label: "Entregado",    cls: "bg-amber-500/10 text-amber-700 border-amber-200" },
  EN_USO:                { label: "En uso",       cls: "bg-emerald-500/10 text-emerald-700 border-emerald-200" },
  DEVUELTO:              { label: "Devuelto",     cls: "bg-gray-100 text-gray-600 border-gray-200" },
  CERRADO:               { label: "Cerrado",      cls: "bg-gray-100 text-gray-500 border-gray-200" },
  CON_DEUDA:             { label: "Con deuda",    cls: "bg-red-500/10 text-red-700 border-red-200" },
  CON_GARANTIA_RETENIDA: { label: "Garan. ret.",  cls: "bg-orange-500/10 text-orange-700 border-orange-200" },
  CANCELADO:             { label: "Cancelado",    cls: "bg-gray-100 text-gray-400 border-gray-200" },
};

const DIAS = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

// ── Page ──────────────────────────────────────────────────────────────────────

export default async function DashboardPage() {
  const cookieStore = await cookies();
  const token = cookieStore.get("accessToken")?.value ?? "";

  const [cajaStats, movimientos, contratos, inventarioStats, cuentasPorCobrar, me] =
    await Promise.all([
      fetchJson<CajaStats>(`${BACKEND}/caja/stats`, token).catch(() => null),
      fetchJson<Movimiento[]>(`${BACKEND}/caja`, token).catch(() => [] as Movimiento[]),
      fetchJson<Contrato[]>(`${BACKEND}/contratos`, token).catch(() => [] as Contrato[]),
      fetchJson<InventarioStat>(`${BACKEND}/inventario/stats-sucursales`, token).catch(() => ({ conjuntos: 0, variaciones: 0, stockTotal: 0, sinStock: 0 })),
      fetchJson<CuentaPorCobrar[]>(`${BACKEND}/caja/cuentas-por-cobrar`, token).catch(() => [] as CuentaPorCobrar[]),
      fetchJson<{ id: number; nombre: string; rol: string; sucursal?: { nombre: string } | null }>(`${BACKEND}/auth/me`, token).catch(() => null),
    ]);

  const stats: CajaStats = cajaStats ?? {
    hoy:    { ingresos: 0, egresos: 0, balance: 0, porFormaPago: {} },
    semana: { ingresos: 0, egresos: 0, balance: 0 },
    mes:    { ingresos: 0, egresos: 0, balance: 0 },
    totales: { anticipo: 0, garantia: 0, saldo: 0 },
  };

  // Contratos
  const contratosActivos  = contratos.filter((c) => !["CERRADO", "CANCELADO"].includes(c.estado));
  const contratosRecientes = [...contratos].sort((a, b) => b.id - a.id).slice(0, 8);

  // Inventario agregado
  const invTotales = {
    total:      inventarioStats.stockTotal,
    disponible: inventarioStats.stockTotal,
    sinStock:   inventarioStats.sinStock,
  };

  // Por cobrar
  const totalDeuda = cuentasPorCobrar.reduce(
    (s, c) => s + Number(c.total) - Number(c.total_pagado), 0
  );

  // Chart: últimos 7 días
  const hoy = new Date();
  const chartDias = Array.from<unknown, ChartDay & { date: string }>({ length: 7 }, (_, i) => {
    const d = new Date(hoy);
    d.setDate(hoy.getDate() - (6 - i));
    return { date: d.toDateString(), day: DIAS[d.getDay()], ingresos: 0, egresos: 0 };
  });
  for (const m of movimientos) {
    const ds   = new Date(m.createdAt).toDateString();
    const slot = chartDias.find((d) => d.date === ds);
    if (slot) {
      if (m.tipo === "INGRESO") slot.ingresos += Number(m.monto);
      else                      slot.egresos  += Number(m.monto);
    }
  }
  const chartData: ChartDay[] = chartDias.map(({ day, ingresos, egresos }) => ({ day, ingresos, egresos }));

  const movRecientes = movimientos.slice(0, 8);

  // Forma de pago hoy
  const pagoHoy = stats.hoy.porFormaPago;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
          {me ? `Hola, ${me.nombre.split(" ")[0]}` : "Dashboard"}
        </h1>
        <p className="text-sm text-gray-600 font-medium mt-1">
          {me?.rol === "ADMIN" ? "Vista global del sistema" : me?.sucursal ? `Sucursal ${me.sucursal.nombre}` : "Mi resumen"}
          {" · "}
          {new Date().toLocaleDateString("es-BO", {
            weekday: "long", year: "numeric", month: "long", day: "numeric",
          })}
        </p>
      </div>

      {/* ── KPI Row 1 – financiero ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
        <KpiCard
          label="Ingresos del Mes"
          value={bs(stats.mes.ingresos)}
          sub={`Hoy: ${bs(stats.hoy.ingresos)}`}
          positive
          accent="bg-emerald-500/10 text-emerald-700"
          icon={<IconMoney />}
        />
        <KpiCard
          label="Egresos del Mes"
          value={bs(stats.mes.egresos)}
          sub={`Hoy: ${bs(stats.hoy.egresos)}`}
          positive={stats.mes.egresos === 0}
          accent="bg-red-500/10 text-red-600"
          icon={<IconArrowDown />}
        />
        <KpiCard
          label="Balance del Mes"
          value={bs(stats.mes.balance)}
          sub={`Semana: ${bs(stats.semana.balance)}`}
          positive={stats.mes.balance >= 0}
          accent={stats.mes.balance >= 0 ? "bg-coca/10 text-coca" : "bg-red-500/10 text-red-600"}
          icon={<IconBalance />}
        />
        <KpiCard
          label="Contratos Activos"
          value={String(contratosActivos.length)}
          sub={`Total: ${contratos.length} contratos`}
          positive
          accent="bg-crimson/10 text-crimson"
          icon={<IconDoc />}
        />
        <KpiCard
          label="Por Cobrar"
          value={bs(totalDeuda)}
          sub={`${cuentasPorCobrar.length} contratos con deuda`}
          positive={totalDeuda === 0}
          accent="bg-orange-500/10 text-orange-600"
          icon={<IconAlert />}
        />
        <KpiCard
          label="Stock Total"
          value={String(invTotales.total)}
          sub={`${invTotales.sinStock} conjuntos sin stock`}
          positive={invTotales.sinStock === 0}
          accent="bg-gold/10 text-amber-700"
          icon={<IconDress />}
        />
      </div>

      {/* ── Totales históricos + caja hoy ── */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-blue-50 rounded-2xl border-2 border-blue-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 font-medium">Anticipos cobrados</p>
            <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: "var(--font-outfit)" }}>{bs(stats.totales.anticipo)}</p>
          </div>
        </div>
        <div className="bg-violet-50 rounded-2xl border-2 border-violet-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-violet-500/10 flex items-center justify-center text-violet-600 shrink-0">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 font-medium">Garantías efectivo</p>
            <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: "var(--font-outfit)" }}>{bs(stats.totales.garantia)}</p>
          </div>
        </div>
        <div className="bg-emerald-50 rounded-2xl border-2 border-emerald-200 p-4 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <svg className="h-4.5 w-4.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="min-w-0">
            <p className="text-xs text-gray-600 font-medium">Saldos cobrados</p>
            <p className="text-sm font-bold text-gray-900 truncate" style={{ fontFamily: "var(--font-outfit)" }}>{bs(stats.totales.saldo)}</p>
          </div>
        </div>
        {/* Forma de pago hoy */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-4">
          <p className="text-xs text-gray-600 font-medium mb-2">Cobros de hoy por forma de pago</p>
          {Object.keys(pagoHoy).length === 0 ? (
            <p className="text-xs text-gray-500 italic">Sin movimientos hoy</p>
          ) : (
            <div className="space-y-1">
              {Object.entries(pagoHoy).map(([forma, monto]) => (
                <div key={forma} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-gray-600 font-medium">{forma}</span>
                  <span className="text-xs font-semibold text-emerald-600">{bs(monto)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Chart + Contratos recientes ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Chart flujo de caja */}
        <div className="lg:col-span-2 bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
            Flujo de caja — 7 días
          </h2>
          <p className="text-xs text-gray-600 font-medium mb-4">Ingresos vs Egresos en Bs.</p>
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-crimson inline-block" /> Ingresos
            </span>
            <span className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
              <span className="w-3 h-3 rounded-sm bg-gold inline-block" /> Egresos
            </span>
          </div>
          <WeeklyChart data={chartData} />
          <div className="aguayo-stripe h-1 w-full mt-4 rounded-full opacity-60" />
        </div>

        {/* Contratos recientes */}
        <div className="lg:col-span-3 bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                Contratos Recientes
              </h2>
              <p className="text-xs text-gray-600 font-medium">Últimos registrados</p>
            </div>
            <Badge variant="outline" className="text-xs border-crimson/30 text-crimson">
              {contratosActivos.length} activos
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-700 w-28">Código</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Cliente</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 hidden lg:table-cell">Dev.</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 text-right">Total</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {contratosRecientes.map((c) => {
                const est = ESTADO_MAP[c.estado] ?? { label: c.estado, cls: "" };
                const vencido = new Date(c.fecha_devolucion) < new Date() && !["CERRADO", "CANCELADO", "DEVUELTO"].includes(c.estado);
                return (
                  <TableRow key={c.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell className="font-mono text-xs text-gray-600">{c.codigo}</TableCell>
                    <TableCell>
                      <p className="text-sm font-medium truncate max-w-[140px]">{c.cliente.nombre}</p>
                      <p className="text-xs text-gray-600 truncate max-w-[140px]">
                        {c.evento?.nombre ?? c.nombre_evento_ext ?? c.ciudad.replace("_", " ")}
                      </p>
                    </TableCell>
                    <TableCell className={`text-xs hidden lg:table-cell ${vencido ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                      {fechaCorta(c.fecha_devolucion)}{vencido ? " ⚠" : ""}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-right">{bs(Number(c.total))}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className={`text-xs font-medium ${est.cls}`}>{est.label}</Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {contratosRecientes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-8">
                    Sin contratos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ── Cuentas por cobrar + Inventario ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Cuentas por cobrar */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
                Cuentas por Cobrar
              </h2>
              <p className="text-xs text-gray-600 font-medium">Contratos con saldo pendiente</p>
            </div>
            <Badge variant="outline" className="text-xs border-orange-400/40 text-orange-600 font-semibold">
              {bs(totalDeuda)}
            </Badge>
          </div>
          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
                <TableHead className="text-xs font-semibold text-gray-700">Cliente</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 hidden sm:table-cell">Dev.</TableHead>
                <TableHead className="text-xs font-semibold text-gray-700 text-right">Deuda</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cuentasPorCobrar.slice(0, 7).map((c) => {
                const deuda   = Number(c.total) - Number(c.total_pagado);
                const vencido = new Date(c.fecha_devolucion) < new Date();
                return (
                  <TableRow key={c.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <p className="text-sm font-medium truncate max-w-[150px]">{c.cliente.nombre}</p>
                      <p className="font-mono text-xs text-gray-600">{c.codigo}</p>
                    </TableCell>
                    <TableCell className={`text-xs hidden sm:table-cell ${vencido ? "text-red-600 font-semibold" : "text-gray-600"}`}>
                      {fechaCorta(c.fecha_devolucion)}{vencido ? " ⚠" : ""}
                    </TableCell>
                    <TableCell className="text-right">
                      <span className="text-sm font-bold text-red-600">{bs(deuda)}</span>
                    </TableCell>
                  </TableRow>
                );
              })}
              {cuentasPorCobrar.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-sm text-gray-500 py-8">
                    Sin deudas pendientes ✓
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Resumen de stock */}
        <div className="bg-white rounded-2xl border-2 border-gray-200 p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
            Resumen de Stock
          </h2>
          <p className="text-xs text-gray-600 font-medium mb-4">Inventario por cantidad de unidades</p>
          <div className="grid grid-cols-2 gap-4">
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-4 text-center">
              <p className="text-2xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-outfit)" }}>
                {inventarioStats.conjuntos}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">Conjuntos activos</p>
            </div>
            <div className="rounded-xl bg-blue-50 border border-blue-200 p-4 text-center">
              <p className="text-2xl font-bold text-blue-700" style={{ fontFamily: "var(--font-outfit)" }}>
                {inventarioStats.stockTotal}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">Unidades en stock</p>
            </div>
            <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 text-center">
              <p className="text-2xl font-bold text-amber-600" style={{ fontFamily: "var(--font-outfit)" }}>
                {inventarioStats.variaciones}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">Variaciones activas</p>
            </div>
            <div className={`rounded-xl p-4 text-center border ${inventarioStats.sinStock > 0 ? "bg-red-50 border-red-200" : "bg-emerald-50 border-emerald-200"}`}>
              <p className={`text-2xl font-bold ${inventarioStats.sinStock > 0 ? "text-red-600" : "text-emerald-700"}`} style={{ fontFamily: "var(--font-outfit)" }}>
                {inventarioStats.sinStock}
              </p>
              <p className="text-xs text-gray-600 font-medium mt-1">Sin stock</p>
            </div>
          </div>
        </div>
      </div>

      {/* ── Últimos movimientos de caja ── */}
      <div className="bg-white rounded-2xl border-2 border-gray-200 shadow-sm overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-200 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
              Últimos Movimientos de Caja
            </h2>
            <p className="text-xs text-gray-600 font-medium">Ingresos y egresos registrados</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500" />Ingreso</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Egreso</span>
          </div>
        </div>
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-transparent border-gray-200 bg-gray-50">
              <TableHead className="text-xs font-semibold text-gray-700">Concepto</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 hidden sm:table-cell">Contrato</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 hidden md:table-cell">Forma pago</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 hidden lg:table-cell">Fecha</TableHead>
              <TableHead className="text-xs font-semibold text-gray-700 text-right">Monto</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {movRecientes.map((m) => (
              <TableRow key={m.id} className="border-gray-200 hover:bg-gray-50 transition-colors">
                <TableCell>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${m.tipo === "INGRESO" ? "bg-emerald-500" : "bg-red-500"}`} />
                    <span className="text-sm font-medium">{m.concepto.replace(/_/g, " ")}</span>
                  </div>
                  {m.contrato && (
                    <p className="text-xs text-gray-600 ml-4 truncate max-w-[160px]">
                      {m.contrato.cliente.nombre}
                    </p>
                  )}
                </TableCell>
                <TableCell className="font-mono text-xs text-gray-600 hidden sm:table-cell">
                  {m.contrato?.codigo ?? "—"}
                </TableCell>
                <TableCell className="text-xs text-gray-600 hidden md:table-cell">
                  {m.forma_pago}
                </TableCell>
                <TableCell className="text-xs text-gray-600 hidden lg:table-cell">
                  {new Date(m.createdAt).toLocaleDateString("es-BO", {
                    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
                  })}
                </TableCell>
                <TableCell className="text-right">
                  <span className={`text-sm font-bold ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-red-600"}`}>
                    {m.tipo === "EGRESO" ? "−" : "+"}{bs(Number(m.monto))}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {movRecientes.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-sm text-gray-500 py-8">
                  Sin movimientos de caja
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

// ── Sub-components ────────────────────────────────────────────────────────────

function KpiCard({
  label, value, sub, positive, accent, icon,
}: {
  label: string; value: string; sub: string; positive: boolean; accent: string; icon: ReactNode;
}) {
  return (
    <div className="bg-white rounded-2xl border-2 border-gray-200 p-4 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <p className="text-xs font-medium text-gray-600 leading-tight pr-1">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${accent}`}>{icon}</div>
      </div>
      <p className="text-2xl font-bold text-gray-900 leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
        {value}
      </p>
      <p className={`text-xs mt-1.5 font-medium ${positive ? "text-coca" : "text-orange-600"}`}>{sub}</p>
    </div>
  );
}

// ── Icons ─────────────────────────────────────────────────────────────────────

function IconMoney() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function IconArrowDown() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
    </svg>
  );
}
function IconBalance() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
    </svg>
  );
}
function IconDoc() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  );
}
function IconAlert() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  );
}
function IconDress() {
  return (
    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
    </svg>
  );
}
