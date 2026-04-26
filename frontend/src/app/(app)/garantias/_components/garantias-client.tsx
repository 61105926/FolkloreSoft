"use client";

import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

type TipoGarantia = "EFECTIVO" | "DOCUMENTO_CARNET" | "CARTA_INSTITUCIONAL" | "OTRO";

interface Garantia {
  id: number;
  contratoId: number;
  participanteId: number | null;
  tipo: TipoGarantia;
  descripcion: string | null;
  valor: string | null;
  retenida: boolean;
  motivo_retencion: string | null;
  createdAt: string;
  contrato: {
    id: number; codigo: string; estado: string;
    cliente: { id: number; nombre: string; celular: string | null; ci: string | null };
  };
  participante: { id: number; nombre: string; ci: string | null } | null;
}

interface Props {
  initialGarantias: Garantia[];
}

// ── Constants ─────────────────────────────────────────────────────────────────

const TIPO_MAP: Record<TipoGarantia, { label: string; chip: string; icon: string }> = {
  EFECTIVO:             { label: "Efectivo",          chip: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20", icon: "💵" },
  DOCUMENTO_CARNET:     { label: "Carnet (doc.)",     chip: "bg-blue-500/10 text-blue-700 border-blue-500/20",         icon: "🪪" },
  CARTA_INSTITUCIONAL:  { label: "Carta institucional", chip: "bg-violet-500/10 text-violet-700 border-violet-500/20", icon: "📄" },
  OTRO:                 { label: "Otro",              chip: "bg-gray-500/10 text-gray-500 border-gray-500/20",         icon: "📦" },
};

const ESTADO_CONTRATO_CHIP: Record<string, string> = {
  RESERVADO:             "bg-blue-500/10 text-blue-600 border-blue-300/40",
  CONFIRMADO:            "bg-emerald-500/10 text-emerald-600 border-emerald-300/40",
  ENTREGADO:             "bg-primary/10 text-primary border-primary/30",
  EN_USO:                "bg-amber-500/10 text-amber-700 border-amber-300/40",
  DEVUELTO:              "bg-emerald-500/10 text-emerald-600 border-emerald-300/40",
  CERRADO:               "bg-gray-500/10 text-gray-500 border-gray-300/40",
  CON_DEUDA:             "bg-red-500/10 text-red-600 border-red-300/40",
  CON_GARANTIA_RETENIDA: "bg-orange-500/10 text-orange-600 border-orange-300/40",
  CANCELADO:             "bg-gray-100 text-gray-600 border-gray-300",
};

const ESTADO_CONTRATO_LABEL: Record<string, string> = {
  RESERVADO: "Reservado", CONFIRMADO: "Confirmado", ENTREGADO: "Entregado",
  EN_USO: "En uso", DEVUELTO: "Devuelto", CERRADO: "Cerrado",
  CON_DEUDA: "Con deuda", CON_GARANTIA_RETENIDA: "Garantía retenida", CANCELADO: "Cancelado",
};

const inp = "rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 font-medium placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/40 focus:border-primary/40 transition-all";

// ── GarantiasClient ───────────────────────────────────────────────────────────

export function GarantiasClient({ initialGarantias }: Props) {
  const [search,       setSearch]       = useState("");
  const [filterTipo,   setFilterTipo]   = useState("");
  const [filterEstado, setFilterEstado] = useState<"todas" | "retenidas" | "activas">("todas");

  // Stats
  const stats = useMemo(() => {
    const totalEfectivo = initialGarantias
      .filter((g) => g.tipo === "EFECTIVO" && g.valor)
      .reduce((s, g) => s + parseFloat(g.valor!), 0);
    const retenidas  = initialGarantias.filter((g) => g.retenida).length;
    const efectivo   = initialGarantias.filter((g) => g.tipo === "EFECTIVO").length;
    const documentos = initialGarantias.filter((g) => g.tipo !== "EFECTIVO").length;
    return { total: initialGarantias.length, retenidas, efectivo, documentos, totalEfectivo };
  }, [initialGarantias]);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return initialGarantias.filter((g) => {
      const matchQ = !q ||
        g.contrato.codigo.toLowerCase().includes(q) ||
        g.contrato.cliente.nombre.toLowerCase().includes(q) ||
        g.participante?.nombre.toLowerCase().includes(q) ||
        g.descripcion?.toLowerCase().includes(q);
      const matchTipo   = !filterTipo || g.tipo === filterTipo;
      const matchEstado = filterEstado === "todas" ? true : filterEstado === "retenidas" ? g.retenida : !g.retenida;
      return matchQ && matchTipo && matchEstado;
    });
  }, [initialGarantias, search, filterTipo, filterEstado]);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Garantías</h1>
        <p className="text-sm text-gray-500 font-medium mt-0.5">Depósitos de seguridad vinculados a contratos de alquiler</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-2xl border-2 border-primary/20 bg-primary/5 p-4">
          <p className="text-3xl font-bold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>{stats.total}</p>
          <p className="text-xs font-medium text-gray-500">Total garantías</p>
        </div>
        <div className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-4">
          <p className="text-3xl font-bold text-emerald-700" style={{ fontFamily: "var(--font-outfit)" }}>{stats.efectivo}</p>
          <p className="text-xs font-medium text-emerald-700">En efectivo</p>
          {stats.totalEfectivo > 0 && (
            <p className="text-xs font-semibold text-emerald-700 mt-1">Bs. {stats.totalEfectivo.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</p>
          )}
        </div>
        <div className="rounded-2xl border-2 border-blue-200 bg-blue-50 p-4">
          <p className="text-3xl font-bold text-blue-700" style={{ fontFamily: "var(--font-outfit)" }}>{stats.documentos}</p>
          <p className="text-xs font-medium text-blue-700">Documentos / otros</p>
        </div>
        <div className={`rounded-2xl border-2 p-4 ${stats.retenidas > 0 ? "border-orange-200 bg-orange-50" : "border-gray-200 bg-gray-50"}`}>
          <p className={`text-3xl font-bold ${stats.retenidas > 0 ? "text-orange-600" : "text-gray-900"}`} style={{ fontFamily: "var(--font-outfit)" }}>{stats.retenidas}</p>
          <p className={`text-xs font-medium ${stats.retenidas > 0 ? "text-orange-600" : "text-gray-500"}`}>Retenidas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input className={`${inp} flex-1 min-w-[200px]`} placeholder="Buscar por contrato, cliente, participante…"
          value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inp} cursor-pointer`} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {(Object.keys(TIPO_MAP) as TipoGarantia[]).map((t) => (
            <option key={t} value={t}>{TIPO_MAP[t].label}</option>
          ))}
        </select>
        <div className="flex rounded-xl border-2 border-gray-200 overflow-hidden text-xs font-semibold">
          {([["todas", "Todas"], ["activas", "Activas"], ["retenidas", "Retenidas"]] as const).map(([val, lbl]) => (
            <button key={val} onClick={() => setFilterEstado(val)}
              className={`px-3 py-2 transition-colors ${filterEstado === val ? "bg-primary text-white" : "bg-white text-gray-600 hover:bg-gray-50"}`}>
              {lbl}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Tipo</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Descripción</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden sm:table-cell">Valor</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Contrato</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden md:table-cell">Cliente</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden lg:table-cell">Participante</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden xl:table-cell">Fecha</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-gray-500 text-sm font-medium">Sin garantías</td></tr>
            ) : filtered.map((g) => {
              const tipoInfo = TIPO_MAP[g.tipo] ?? { label: g.tipo, chip: "bg-gray-100 text-gray-700 border-gray-300", icon: "?" };
              return (
                <tr key={g.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${tipoInfo.chip}`}>
                      <span>{tipoInfo.icon}</span> {tipoInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-500 font-medium max-w-40 truncate">
                    {g.descripcion ?? "—"}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {g.valor
                      ? <span className="font-semibold text-emerald-700">Bs. {parseFloat(g.valor).toLocaleString("es-BO", { minimumFractionDigits: 2 })}</span>
                      : <span className="text-gray-400 font-medium">—</span>}
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-mono font-bold text-xs text-gray-800">{g.contrato.codigo}</p>
                    <span className={`text-xs font-semibold px-1.5 py-0.5 rounded-full border ${ESTADO_CONTRATO_CHIP[g.contrato.estado] ?? "bg-gray-100 text-gray-600 border-gray-300"}`}>
                      {ESTADO_CONTRATO_LABEL[g.contrato.estado] ?? g.contrato.estado}
                    </span>
                  </td>
                  <td className="px-4 py-3 hidden md:table-cell">
                    <p className="font-semibold text-gray-800">{g.contrato.cliente.nombre}</p>
                    {g.contrato.cliente.celular && (
                      <p className="text-xs text-gray-500 font-medium">{g.contrato.cliente.celular}</p>
                    )}
                  </td>
                  <td className="px-4 py-3 hidden lg:table-cell text-gray-500 text-xs font-medium">
                    {g.participante ? (
                      <div>
                        <p className="font-semibold text-gray-800">{g.participante.nombre}</p>
                        {g.participante.ci && <p>{g.participante.ci}</p>}
                      </div>
                    ) : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {g.retenida ? (
                      <div>
                        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border bg-orange-500/10 text-orange-600 border-orange-500/20">
                          ⚠ Retenida
                        </span>
                        {g.motivo_retencion && (
                          <p className="text-[10px] text-orange-600/80 mt-0.5 max-w-[120px] truncate">{g.motivo_retencion}</p>
                        )}
                      </div>
                    ) : (
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-700 border-emerald-500/20">
                        ✓ Activa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground hidden xl:table-cell">
                    {new Date(g.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} de {initialGarantias.length} garantía{initialGarantias.length !== 1 ? "s" : ""}
            {stats.retenidas > 0 && <span className="ml-3 text-orange-600 font-semibold">· {stats.retenidas} retenida{stats.retenidas !== 1 ? "s" : ""}</span>}
          </div>
        )}
      </div>
    </div>
  );
}
