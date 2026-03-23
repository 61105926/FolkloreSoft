"use client";

import { useState, useMemo } from "react";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { useTheme } from "next-themes";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Movimiento {
  id: number; tipo: "INGRESO" | "EGRESO"; monto: string; concepto: string;
  forma_pago: string; descripcion: string | null; referencia: string | null;
  createdAt: string;
  contrato?: { id: number; codigo: string; cliente: { nombre: string } } | null;
}

interface CajaStats {
  hoy:    { ingresos: number; egresos: number; balance: number; porFormaPago: Record<string, number> };
  semana: { ingresos: number; egresos: number; balance: number };
  mes:    { ingresos: number; egresos: number; balance: number };
  totales: { anticipo: number; garantia: number; saldo: number };
}

interface ContratoDeuda {
  id: number; codigo: string; estado: string;
  total: string; total_pagado: string; anticipo: string;
  cliente: { id: number; nombre: string; celular: string | null };
}

interface PorCobrar {
  clienteId: number; nombre: string; celular: string | null;
  totalDeuda: number; contratos: { id: number; codigo: string; saldo: number; estado: string }[];
}

interface Contrato {
  id: number; codigo: string; estado: string; ciudad: string; tipo: string;
  fecha_contrato: string; fecha_entrega: string; fecha_devolucion: string;
  total: string; anticipo: string; total_pagado: string; forma_pago: string | null;
  cliente: { id: number; nombre: string; celular: string | null };
  evento: { id: number; nombre: string } | null;
  nombre_evento_ext: string | null;
  _count: { prendas: number; garantias: number; participantes: number };
}

interface Cliente {
  id: number; nombre: string; celular: string | null; ci: string | null;
  rol: string; createdAt: string; _count: { contratos: number };
}

interface InventarioStat {
  sucursalId: number; nombre: string; ciudad: string;
  disponible: number; alquilado: number; enTransferencia: number; dadoDeBaja: number; total: number;
}

interface Garantia {
  id: number; tipo: string; descripcion: string | null; valor: string | null;
  retenida: boolean; createdAt: string;
  contrato: { id: number; codigo: string; estado: string; cliente: { nombre: string } };
}

interface Props {
  movimientos: Movimiento[];
  stats: CajaStats;
  porCobrar: ContratoDeuda[];
  contratos: Contrato[];
  clientes: Cliente[];
  inventario: InventarioStat[];
  garantias: Garantia[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ESTADO_CONTRATO_CHIP: Record<string, string> = {
  RESERVADO:             "bg-blue-500/10 text-blue-700 border-blue-300/40",
  CONFIRMADO:            "bg-emerald-500/10 text-emerald-700 border-emerald-300/40",
  ENTREGADO:             "bg-primary/10 text-primary border-primary/30",
  EN_USO:                "bg-amber-500/10 text-amber-700 border-amber-300/40",
  DEVUELTO:              "bg-emerald-500/10 text-emerald-600 border-emerald-300/40",
  CERRADO:               "bg-gray-500/10 text-gray-500 border-gray-300/40",
  CON_DEUDA:             "bg-red-500/10 text-red-700 border-red-300/40",
  CON_GARANTIA_RETENIDA: "bg-orange-500/10 text-orange-600 border-orange-300/40",
  CANCELADO:             "bg-muted text-muted-foreground border-border",
};

const ESTADO_LABEL: Record<string, string> = {
  RESERVADO: "Reservado", CONFIRMADO: "Confirmado", ENTREGADO: "Entregado",
  EN_USO: "En uso", DEVUELTO: "Devuelto", CERRADO: "Cerrado",
  CON_DEUDA: "Con deuda", CON_GARANTIA_RETENIDA: "G. Retenida", CANCELADO: "Cancelado",
};

const FORMA_PAGO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia", QR: "QR", TARJETA: "Tarjeta",
};

const bs = (n: number | undefined | null) => `Bs. ${(n ?? 0).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const MONTH_NAMES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

// ── Mini stat card ─────────────────────────────────────────────────────────────

function KpiCard({ label, value, sub, color = "default" }: {
  label: string; value: string; sub?: string;
  color?: "default" | "green" | "red" | "amber" | "blue";
}) {
  const colors: Record<string, string> = {
    default: "bg-card border-border",
    green:   "bg-emerald-500/5 border-emerald-500/20",
    red:     "bg-red-500/5 border-red-500/20",
    amber:   "bg-amber-500/5 border-amber-500/20",
    blue:    "bg-blue-500/5 border-blue-500/20",
  };
  const textColors: Record<string, string> = {
    default: "", green: "text-emerald-700", red: "text-red-700", amber: "text-amber-700", blue: "text-blue-700",
  };
  return (
    <div className={`rounded-2xl border p-4 ${colors[color]}`}>
      <p className={`text-xl font-bold ${textColors[color]}`} style={{ fontFamily: "var(--font-outfit)" }}>{value}</p>
      <p className="text-xs text-muted-foreground mt-0.5">{label}</p>
      {sub && <p className="text-[11px] text-muted-foreground/70 mt-1">{sub}</p>}
    </div>
  );
}

// ── Section header ─────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <p className="text-xs font-bold uppercase tracking-widest text-muted-foreground mb-3">{children}</p>;
}

// ── Chart tooltip ──────────────────────────────────────────────────────────────

function ChartTooltip({ active, payload, label, isDark }: {
  active?: boolean; payload?: { name: string; value: number; color: string }[]; label?: string; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl p-3 text-sm border"
      style={{ background: isDark ? "#1c1c1f" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb", color: isDark ? "#f0f0f0" : "#111" }}>
      {label && <p className="font-semibold mb-1.5 text-xs">{label}</p>}
      {payload.map((e) => (
        <p key={e.name} style={{ color: e.color }} className="text-xs font-medium">
          {e.name}: <strong>Bs. {e.value.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>
        </p>
      ))}
    </div>
  );
}

function PieTooltip({ active, payload, isDark }: {
  active?: boolean; payload?: { name: string; value: number; payload: { fill: string } }[]; isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-xl shadow-xl p-3 text-sm border"
      style={{ background: isDark ? "#1c1c1f" : "#fff", borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb", color: isDark ? "#f0f0f0" : "#111" }}>
      <p style={{ color: payload[0].payload.fill }} className="text-xs font-semibold">{payload[0].name}</p>
      <p className="text-xs font-bold">Bs. {payload[0].value.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p>
    </div>
  );
}

// ── FinanzasTab ────────────────────────────────────────────────────────────────

function FinanzasTab({ movimientos, stats, porCobrar, isDark }: {
  movimientos: Movimiento[]; stats: CajaStats; porCobrar: PorCobrar[]; isDark: boolean;
}) {
  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const tickColor  = isDark ? "#6b7280" : "#9ca3af";
  const cursorFill = isDark ? "rgba(212,175,55,0.06)" : "rgba(153,27,27,0.04)";
  const INGRESO_COLOR = isDark ? "#D4AF37" : "#991B1B";
  const EGRESO_COLOR  = isDark ? "rgba(153,27,27,0.80)" : "#D4AF37";

  // Monthly trend (last 12 months)
  const monthlyData = useMemo(() => {
    const map: Record<string, { ingresos: number; egresos: number }> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = { ingresos: 0, egresos: 0 };
    }
    movimientos.forEach((m) => {
      const d = new Date(m.createdAt);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in map) {
        const v = parseFloat(m.monto);
        if (m.tipo === "INGRESO") map[key].ingresos += v;
        else map[key].egresos += v;
      }
    });
    return Object.entries(map).map(([k, v]) => ({
      mes: MONTH_NAMES[parseInt(k.split("-")[1]) - 1],
      ingresos: v.ingresos, egresos: v.egresos,
    }));
  }, [movimientos]);

  // Payment method breakdown
  const formaData = useMemo(() => {
    const map: Record<string, number> = {};
    movimientos.filter((m) => m.tipo === "INGRESO").forEach((m) => {
      const fp = m.forma_pago ?? "SIN_FORMA";
      map[fp] = (map[fp] ?? 0) + parseFloat(m.monto);
    });
    return Object.entries(map).map(([k, v]) => ({ name: FORMA_PAGO_LABEL[k] ?? k, value: v }));
  }, [movimientos]);

  const FORMA_COLORS = ["#D4AF37", "#991B1B", "#3B82F6", "#8B5CF6", "#10B981"];

  const totalPorCobrar = porCobrar.reduce((s, c) => s + c.totalDeuda, 0);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Ingresos este mes"  value={bs(stats.mes.ingresos)}  color="green" />
        <KpiCard label="Egresos este mes"   value={bs(stats.mes.egresos)}   color="red"   />
        <KpiCard label="Balance mes"        value={bs(stats.mes.balance)}   color={stats.mes.balance >= 0 ? "green" : "red"} />
        <KpiCard label="Por cobrar"         value={bs(totalPorCobrar)}      color={totalPorCobrar > 0 ? "amber" : "default"} sub={`${porCobrar.length} contrato(s)`} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Anticipo acumulado"  value={bs(stats.totales.anticipo)}  color="blue" />
        <KpiCard label="Garantías retenidas" value={bs(stats.totales.garantia)} color="amber" />
        <KpiCard label="Saldos pendientes"   value={bs(stats.totales.saldo)}    color={stats.totales.saldo > 0 ? "red" : "default"} />
      </div>

      {/* Monthly chart */}
      <div className="rounded-2xl border border-border bg-card p-5">
        <SectionTitle>Tendencia mensual (últimos 12 meses)</SectionTitle>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={monthlyData} barSize={10} barGap={2}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis dataKey="mes" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={38}
              tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)} />
            <Tooltip content={(p) => <ChartTooltip active={p.active} payload={p.payload as { name: string; value: number; color: string }[]} label={p.label as string} isDark={isDark} />}
              cursor={{ fill: cursorFill }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="ingresos" name="Ingresos" fill={INGRESO_COLOR} radius={[4, 4, 0, 0]} />
            <Bar dataKey="egresos"  name="Egresos"  fill={EGRESO_COLOR}  radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Forma de pago + deudores */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Pie: forma de pago */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Ingresos por forma de pago</SectionTitle>
          {formaData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={150}>
                <PieChart>
                  <Pie data={formaData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {formaData.map((_, i) => <Cell key={i} fill={FORMA_COLORS[i % FORMA_COLORS.length]} />)}
                  </Pie>
                  <Tooltip content={(p) => <PieTooltip active={p.active} payload={p.payload as { name: string; value: number; payload: { fill: string } }[]} isDark={isDark} />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {formaData.map((d, i) => (
                  <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: FORMA_COLORS[i % FORMA_COLORS.length] }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-semibold">Bs. {d.value.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Deudores */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Cuentas por cobrar ({porCobrar.length})</SectionTitle>
          {porCobrar.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin deudas pendientes ✓</p>
          ) : (
            <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
              {porCobrar.map((d) => (
                <div key={d.clienteId} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-red-500/5 border border-red-500/10">
                  <div>
                    <p className="text-sm font-semibold">{d.nombre}</p>
                    <p className="text-xs text-muted-foreground">{d.contratos?.length ?? 0} contrato(s)</p>
                  </div>
                  <span className="text-sm font-bold text-red-600">{bs(d.totalDeuda)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Últimos movimientos */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <SectionTitle>Últimos 20 movimientos de caja</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Concepto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Forma</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Contrato</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.slice(0, 20).map((m) => (
              <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-medium truncate max-w-[200px]">{m.concepto}</p>
                  {m.descripcion && <p className="text-xs text-muted-foreground truncate max-w-[200px]">{m.descripcion}</p>}
                </td>
                <td className="px-4 py-3 hidden sm:table-cell">
                  <span className="text-xs bg-muted px-2 py-0.5 rounded-full">{FORMA_PAGO_LABEL[m.forma_pago] ?? m.forma_pago}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell">
                  {m.contrato ? <span className="font-mono">{m.contrato.codigo}</span> : "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <span className={`font-bold text-sm ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-red-600"}`}>
                    {m.tipo === "INGRESO" ? "+" : "−"} {bs(parseFloat(m.monto))}
                  </span>
                </td>
                <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                  {new Date(m.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "short" })}
                </td>
              </tr>
            ))}
            {movimientos.length === 0 && (
              <tr><td colSpan={5} className="text-center py-10 text-muted-foreground text-sm">Sin movimientos</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── ContratosTab ───────────────────────────────────────────────────────────────

function ContratosTab({ contratos, isDark }: { contratos: Contrato[]; isDark: boolean }) {
  const [search, setSearch] = useState("");
  const [filterEstado, setFilterEstado] = useState("");

  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const tickColor  = isDark ? "#6b7280" : "#9ca3af";
  const cursorFill = isDark ? "rgba(212,175,55,0.06)" : "rgba(153,27,27,0.04)";

  // By estado
  const estadoCounts = useMemo(() => {
    const m: Record<string, number> = {};
    contratos.forEach((c) => { m[c.estado] = (m[c.estado] ?? 0) + 1; });
    return Object.entries(m).map(([estado, count]) => ({ estado: ESTADO_LABEL[estado] ?? estado, count })).sort((a, b) => b.count - a.count);
  }, [contratos]);

  // Monthly
  const monthlyContratos = useMemo(() => {
    const map: Record<string, number> = {};
    const now = new Date();
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key] = 0;
    }
    contratos.forEach((c) => {
      const d = new Date(c.fecha_contrato);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (key in map) map[key]++;
    });
    return Object.entries(map).map(([k, v]) => ({ mes: MONTH_NAMES[parseInt(k.split("-")[1]) - 1], contratos: v }));
  }, [contratos]);

  // Revenue per contrato
  const totalFacturado = contratos.reduce((s, c) => s + parseFloat(c.total), 0);
  const totalCobrado   = contratos.reduce((s, c) => s + parseFloat(c.total_pagado), 0);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return contratos.filter((c) =>
      (!q || c.codigo.toLowerCase().includes(q) || c.cliente.nombre.toLowerCase().includes(q) || (c.evento?.nombre ?? c.nombre_evento_ext ?? "").toLowerCase().includes(q)) &&
      (!filterEstado || c.estado === filterEstado)
    );
  }, [contratos, search, filterEstado]);

  const BAR_COLOR = isDark ? "#D4AF37" : "#991B1B";

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total contratos"  value={String(contratos.length)} />
        <KpiCard label="Total facturado"  value={bs(totalFacturado)}  color="green" />
        <KpiCard label="Total cobrado"    value={bs(totalCobrado)}    color="blue"  />
        <KpiCard label="Por cobrar"       value={bs(totalFacturado - totalCobrado)} color={totalFacturado > totalCobrado ? "amber" : "default"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Por estado */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Contratos por estado</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={estadoCounts} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="estado" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={80} />
              <Tooltip cursor={{ fill: cursorFill }} formatter={(v) => [v, "Contratos"]} />
              <Bar dataKey="count" name="Contratos" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Por mes */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Contratos por mes (últimos 12)</SectionTitle>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={monthlyContratos}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis dataKey="mes" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={24} />
              <Tooltip formatter={(v) => [v, "Contratos"]} cursor={{ stroke: BAR_COLOR, strokeWidth: 1, strokeDasharray: "4 2" }} />
              <Line type="monotone" dataKey="contratos" stroke={BAR_COLOR} strokeWidth={2} dot={{ fill: BAR_COLOR, r: 3 }} activeDot={{ r: 5 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex flex-wrap gap-2 items-center">
          <SectionTitle>Listado de contratos</SectionTitle>
          <div className="flex gap-2 ml-auto flex-wrap">
            <input className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 min-w-[180px]"
              placeholder="Buscar…" value={search} onChange={(e) => setSearch(e.target.value)} />
            <select className="rounded-xl border border-border bg-background px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
              value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
              <option value="">Todos los estados</option>
              {Object.keys(ESTADO_LABEL).map((k) => <option key={k} value={k}>{ESTADO_LABEL[k]}</option>)}
            </select>
          </div>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Evento</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Total</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Cobrado</th>
              <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sin contratos</td></tr>
            ) : filtered.map((c) => {
              const saldo = parseFloat(c.total) - parseFloat(c.total_pagado);
              return (
                <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold text-xs">{c.codigo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{c.cliente.nombre}</p>
                    {c.cliente.celular && <p className="text-xs text-muted-foreground">{c.cliente.celular}</p>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden md:table-cell truncate max-w-[150px]">
                    {c.evento?.nombre ?? c.nombre_evento_ext ?? "—"}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ESTADO_CONTRATO_CHIP[c.estado] ?? "bg-muted text-muted-foreground border-border"}`}>
                      {ESTADO_LABEL[c.estado] ?? c.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right font-semibold hidden sm:table-cell">
                    {bs(parseFloat(c.total))}
                  </td>
                  <td className="px-4 py-3 text-right hidden lg:table-cell">
                    <p className="font-semibold text-emerald-600">{bs(parseFloat(c.total_pagado))}</p>
                    {saldo > 0 && <p className="text-xs text-red-500">Saldo: {bs(saldo)}</p>}
                  </td>
                  <td className="px-4 py-3 text-right text-xs text-muted-foreground hidden sm:table-cell">
                    {new Date(c.fecha_contrato).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} de {contratos.length} contratos
          </div>
        )}
      </div>
    </div>
  );
}

// ── ClientesTab ────────────────────────────────────────────────────────────────

function ClientesTab({ clientes, contratos, porCobrar, isDark }: {
  clientes: Cliente[]; contratos: Contrato[]; porCobrar: PorCobrar[]; isDark: boolean;
}) {
  const BAR_COLOR = isDark ? "#D4AF37" : "#991B1B";
  const gridColor = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const tickColor = isDark ? "#6b7280" : "#9ca3af";
  const cursorFill = isDark ? "rgba(212,175,55,0.06)" : "rgba(153,27,27,0.04)";

  // Top 10 clients by contract count
  const topClientes = useMemo(() =>
    [...clientes].sort((a, b) => b._count.contratos - a._count.contratos).slice(0, 10)
      .map((c) => ({ name: c.nombre.split(" ")[0], contratos: c._count.contratos })),
    [clientes]
  );

  // Top 10 by amount paid
  const clienteMontos = useMemo(() => {
    const map: Record<number, { nombre: string; total: number; cobrado: number }> = {};
    contratos.forEach((c) => {
      if (!map[c.cliente.id]) map[c.cliente.id] = { nombre: c.cliente.nombre, total: 0, cobrado: 0 };
      map[c.cliente.id].total   += parseFloat(c.total);
      map[c.cliente.id].cobrado += parseFloat(c.total_pagado);
    });
    return Object.values(map).sort((a, b) => b.cobrado - a.cobrado).slice(0, 8);
  }, [contratos]);

  const ROL_OPTIONS: Record<string, string> = {
    PADRE: "Padre", DOCENTE: "Docente", ORGANIZADOR: "Organizador", OTRO: "Otro",
  };
  const rolCounts = useMemo(() => {
    const m: Record<string, number> = {};
    clientes.forEach((c) => { m[c.rol] = (m[c.rol] ?? 0) + 1; });
    return m;
  }, [clientes]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Total clientes" value={String(clientes.length)} />
        {Object.entries(rolCounts).map(([rol, cnt]) => (
          <KpiCard key={rol} label={ROL_OPTIONS[rol] ?? rol} value={String(cnt)} color="blue" />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Top por contratos */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Top 10 clientes por contratos</SectionTitle>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topClientes} layout="vertical" barSize={14}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={60} />
              <Tooltip cursor={{ fill: cursorFill }} formatter={(v) => [v, "Contratos"]} />
              <Bar dataKey="contratos" name="Contratos" fill={BAR_COLOR} radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top por monto cobrado */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Top clientes por monto cobrado</SectionTitle>
          <div className="space-y-2 mt-1 max-h-[200px] overflow-y-auto pr-1">
            {clienteMontos.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">Sin datos</p>
            ) : clienteMontos.map((c, i) => {
              const pct = c.total > 0 ? Math.round((c.cobrado / c.total) * 100) : 0;
              return (
                <div key={c.nombre + i} className="flex items-center gap-3">
                  <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-xs font-semibold truncate">{c.nombre}</span>
                      <span className="text-xs font-bold text-emerald-600 shrink-0">{bs(c.cobrado)}</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Deudores detail */}
      {porCobrar.length > 0 && (
        <div className="rounded-2xl border border-border bg-card overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <SectionTitle>Detalle de cuentas por cobrar</SectionTitle>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Contratos</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Deuda total</th>
              </tr>
            </thead>
            <tbody>
              {porCobrar.map((d) => (
                <tr key={d.clienteId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{d.nombre}</p>
                    {d.celular && <p className="text-xs text-muted-foreground">{d.celular}</p>}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    <div className="flex flex-wrap gap-1">
                      {(d.contratos ?? []).map((c) => (
                        <span key={c.id} className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{c.codigo}</span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-red-600">{bs(d.totalDeuda)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* All clients table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <SectionTitle>Directorio de clientes ({clientes.length})</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rol</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Contratos</th>
            </tr>
          </thead>
          <tbody>
            {clientes.length === 0 ? (
              <tr><td colSpan={4} className="text-center py-10 text-muted-foreground text-sm">Sin clientes</td></tr>
            ) : clientes.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 font-medium">{c.nombre}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{c.celular ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{ROL_OPTIONS[c.rol] ?? c.rol}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`text-xs font-bold ${c._count.contratos > 0 ? "text-primary" : "text-muted-foreground"}`}>
                    {c._count.contratos}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── InventarioTab ─────────────────────────────────────────────────────────────

function InventarioTab({ inventario, garantias, isDark }: {
  inventario: InventarioStat[]; garantias: Garantia[]; isDark: boolean;
}) {
  const BAR_COLOR   = isDark ? "#D4AF37" : "#991B1B";
  const gridColor   = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const tickColor   = isDark ? "#6b7280" : "#9ca3af";
  const cursorFill  = isDark ? "rgba(212,175,55,0.06)" : "rgba(153,27,27,0.04)";

  const totals = inventario.reduce(
    (a, s) => ({ disp: a.disp + s.disponible, alq: a.alq + s.alquilado, tran: a.tran + s.enTransferencia, baja: a.baja + s.dadoDeBaja, total: a.total + s.total }),
    { disp: 0, alq: 0, tran: 0, baja: 0, total: 0 }
  );
  const pctOcupacion = totals.total > 0 ? Math.round((totals.alq / totals.total) * 100) : 0;

  const donutData = [
    { name: "Disponible",  value: totals.disp, fill: "#10B981" },
    { name: "Alquilado",   value: totals.alq,  fill: isDark ? "#D4AF37" : "#991B1B" },
    { name: "En tránsito", value: totals.tran, fill: "#F59E0B" },
    { name: "Dado de baja",value: totals.baja, fill: "#6B7280" },
  ].filter((d) => d.value > 0);

  const branchData = inventario.map((s) => ({
    nombre: s.nombre.length > 10 ? s.nombre.slice(0, 10) + "…" : s.nombre,
    disponible: s.disponible, alquilado: s.alquilado,
  }));

  // Garantías summary
  const garantiasStats = useMemo(() => {
    const efectivoTotal = garantias.filter((g) => g.tipo === "EFECTIVO" && g.valor).reduce((s, g) => s + parseFloat(g.valor!), 0);
    return { total: garantias.length, retenidas: garantias.filter((g) => g.retenida).length, efectivoTotal };
  }, [garantias]);

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <KpiCard label="Total conjuntos"  value={String(totals.total)} />
        <KpiCard label="Disponibles"      value={String(totals.disp)}  color="green" />
        <KpiCard label="Alquilados"       value={String(totals.alq)}   color="amber" sub={`${pctOcupacion}% ocupación`} />
        <KpiCard label="En tránsito"      value={String(totals.tran)}  color="blue" />
        <KpiCard label="Dados de baja"    value={String(totals.baja)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Donut estado */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Estado del inventario total</SectionTitle>
          {donutData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin inventario</p>
          ) : (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="55%" height={150}>
                <PieChart>
                  <Pie data={donutData} dataKey="value" cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={3}>
                    {donutData.map((d, i) => <Cell key={i} fill={d.fill} />)}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-2">
                {donutData.map((d) => (
                  <div key={d.name} className="flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: d.fill }} />
                      <span className="text-muted-foreground">{d.name}</span>
                    </div>
                    <span className="font-bold">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Por sucursal */}
        <div className="rounded-2xl border border-border bg-card p-5">
          <SectionTitle>Disponible vs alquilado por sucursal</SectionTitle>
          {branchData.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">Sin sucursales</p>
          ) : (
            <ResponsiveContainer width="100%" height={150}>
              <BarChart data={branchData} barSize={14} barGap={3}>
                <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
                <XAxis dataKey="nombre" tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} />
                <YAxis allowDecimals={false} tick={{ fontSize: 10, fill: tickColor }} axisLine={false} tickLine={false} width={24} />
                <Tooltip cursor={{ fill: cursorFill }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="disponible" name="Disponible" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="alquilado"  name="Alquilado"  fill={BAR_COLOR} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      {/* Branch detail */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <SectionTitle>Detalle por sucursal</SectionTitle>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sucursal</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disponible</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Alquilado</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">En tránsito</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Baja</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ocupación</th>
            </tr>
          </thead>
          <tbody>
            {inventario.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-10 text-muted-foreground text-sm">Sin datos de inventario</td></tr>
            ) : inventario.map((s) => {
              const pct = s.total > 0 ? Math.round((s.alquilado / s.total) * 100) : 0;
              return (
                <tr key={s.sucursalId} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold">{s.nombre}</p>
                    <p className="text-xs text-muted-foreground">{s.ciudad}</p>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">{s.total}</td>
                  <td className="px-4 py-3 text-center text-emerald-600 font-semibold">{s.disponible}</td>
                  <td className="px-4 py-3 text-center text-amber-600 font-semibold">{s.alquilado}</td>
                  <td className="px-4 py-3 text-center text-blue-600 font-semibold hidden sm:table-cell">{s.enTransferencia}</td>
                  <td className="px-4 py-3 text-center text-muted-foreground hidden sm:table-cell">{s.dadoDeBaja}</td>
                  <td className="px-4 py-3 w-32">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
                        <div className="h-full bg-amber-500 rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs font-semibold w-8 text-right">{pct}%</span>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Garantías */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <KpiCard label="Total garantías"     value={String(garantiasStats.total)} />
        <KpiCard label="Garantías retenidas" value={String(garantiasStats.retenidas)} color={garantiasStats.retenidas > 0 ? "amber" : "default"} />
        <KpiCard label="Efectivo en garantías" value={bs(garantiasStats.efectivoTotal)} color="green" />
      </div>

      {garantias.filter((g) => g.retenida).length > 0 && (
        <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-5">
          <SectionTitle>Garantías retenidas</SectionTitle>
          <div className="space-y-2">
            {garantias.filter((g) => g.retenida).map((g) => (
              <div key={g.id} className="flex items-center justify-between px-3 py-2.5 rounded-xl bg-background border border-orange-500/20">
                <div>
                  <p className="text-sm font-semibold">{g.contrato.cliente.nombre}</p>
                  <p className="text-xs text-muted-foreground">{g.contrato.codigo} · {g.tipo.replace(/_/g, " ")}</p>
                </div>
                <div className="text-right">
                  {g.valor && <p className="text-sm font-bold text-orange-600">{bs(parseFloat(g.valor))}</p>}
                  <p className="text-xs text-muted-foreground">Retenida</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── ReportesClient (root) ──────────────────────────────────────────────────────

export function ReportesClient({ movimientos, stats, porCobrar: rawPorCobrar, contratos, clientes, inventario, garantias }: Props) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [tab, setTab] = useState<"finanzas" | "contratos" | "clientes" | "inventario">("finanzas");

  // Group raw contrato debts by client
  const porCobrar: PorCobrar[] = useMemo(() => {
    const map: Record<number, PorCobrar> = {};
    rawPorCobrar.forEach((c) => {
      const saldo = parseFloat(c.total) - parseFloat(c.total_pagado);
      if (saldo <= 0.01) return;
      if (!map[c.cliente.id]) {
        map[c.cliente.id] = { clienteId: c.cliente.id, nombre: c.cliente.nombre, celular: c.cliente.celular, totalDeuda: 0, contratos: [] };
      }
      map[c.cliente.id].totalDeuda += saldo;
      map[c.cliente.id].contratos.push({ id: c.id, codigo: c.codigo, saldo, estado: c.estado });
    });
    return Object.values(map).sort((a, b) => b.totalDeuda - a.totalDeuda);
  }, [rawPorCobrar]);

  const TABS = [
    { id: "finanzas"   as const, label: "Finanzas" },
    { id: "contratos"  as const, label: "Contratos" },
    { id: "clientes"   as const, label: "Clientes" },
    { id: "inventario" as const, label: "Inventario" },
  ];

  const totalIngresosHoy = stats.hoy.ingresos;
  const totalPorCobrar   = porCobrar.reduce((s, c) => s + c.totalDeuda, 0);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Reportes</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Análisis financiero, operativo y de inventario</p>
        </div>
        <button onClick={() => window.print()}
          className="px-4 py-2 rounded-xl border border-border text-sm font-semibold hover:bg-muted transition-colors flex items-center gap-1.5 print:hidden">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
          </svg>
          Imprimir
        </button>
      </div>

      {/* Quick summary strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <KpiCard label="Ingresos hoy"     value={`Bs. ${totalIngresosHoy.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`} color="green" />
        <KpiCard label="Balance del mes"  value={`Bs. ${stats.mes.balance.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`} color={stats.mes.balance >= 0 ? "green" : "red"} />
        <KpiCard label="Contratos activos" value={String(contratos.filter((c) => ["ENTREGADO", "EN_USO", "RESERVADO", "CONFIRMADO"].includes(c.estado)).length)} color="blue" />
        <KpiCard label="Por cobrar total" value={`Bs. ${totalPorCobrar.toLocaleString("es-BO", { minimumFractionDigits: 2 })}`} color={totalPorCobrar > 0 ? "amber" : "default"} />
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1 print:hidden">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "finanzas"   && <FinanzasTab   movimientos={movimientos} stats={stats} porCobrar={porCobrar} isDark={isDark} />}
      {tab === "contratos"  && <ContratosTab  contratos={contratos} isDark={isDark} />}
      {tab === "clientes"   && <ClientesTab   clientes={clientes} contratos={contratos} porCobrar={porCobrar} isDark={isDark} />}
      {tab === "inventario" && <InventarioTab inventario={inventario} garantias={garantias} isDark={isDark} />}
    </div>
  );
}
