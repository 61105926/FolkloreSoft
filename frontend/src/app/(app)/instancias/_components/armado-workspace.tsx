"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext, DragEndEvent, DragOverEvent, DragStartEvent,
  PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, DragOverlay,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Componente { tipo: string; nombre: string }
interface RecetaItem  { cantidad: number; componente: Componente }
interface Conjunto    { id: number; nombre: string; danza: string; componentes: RecetaItem[] }
interface Sucursal    { id: number; nombre: string }

interface PiezaFisica {
  id: number; serial: string; talla: string | null;
  componente: Componente; estado: string;
}

interface InstanciaConjunto {
  id: number; codigo: string; estado: string; notas?: string | null;
  sucursalId: number;
  variacion: { id?: number; nombre_variacion?: string; conjunto: Conjunto };
  sucursal: Sucursal;
  componentes: PiezaFisica[];
}

interface InstanciaComponente {
  id: number; serial: string; talla: string | null;
  estado: string; notas?: string | null;
  componente: Componente;
  sucursal: { id: number; nombre: string };
  instanciaConjunto?: { id: number; codigo: string } | null;
}

interface SucursalBasic { id: number; nombre: string; ciudad: string }

interface StatsSucursal {
  sucursalId: number; nombre: string; ciudad: string;
  disponible: number; alquilado: number; enTransferencia: number; dadoDeBaja: number; total: number;
}

interface MovimientoInstancia {
  id: number; tipo: string;
  estadoAntes: string | null; estadoDespues: string | null;
  notas: string | null; createdAt: string;
}

interface Props {
  sucursales: SucursalBasic[];
  instanciasConjunto: InstanciaConjunto[];
  statsSucursales: StatsSucursal[];
  token: string;
  backendUrl: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ESTADO_CHIP: Record<string, string> = {
  DISPONIBLE:       "bg-emerald-500/10 text-emerald-700 border-emerald-500/20",
  ALQUILADO:        "bg-red-500/10 text-red-700 border-red-500/20",
  EN_TRANSFERENCIA: "bg-amber-500/10 text-amber-700 border-amber-500/20",
  DADO_DE_BAJA:     "bg-gray-500/10 text-gray-500 border-gray-500/20",
  DISPONIBLE_POOL:  "bg-blue-500/10 text-blue-700 border-blue-500/20",
  ASIGNADO:         "bg-violet-500/10 text-violet-700 border-violet-500/20",
  DANADO:           "bg-orange-500/10 text-orange-700 border-orange-500/20",
};

const inp = "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

// ── GlobalStatsBar ─────────────────────────────────────────────────────────────

function GlobalStatsBar({ stats }: { stats: StatsSucursal[] }) {
  const t = stats.reduce(
    (a, s) => ({ disp: a.disp + s.disponible, alq: a.alq + s.alquilado, tran: a.tran + s.enTransferencia, baja: a.baja + s.dadoDeBaja, total: a.total + s.total }),
    { disp: 0, alq: 0, tran: 0, baja: 0, total: 0 }
  );
  const pct = t.total > 0 ? Math.round((t.alq / t.total) * 100) : 0;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
      <div className="sm:col-span-1 bg-card rounded-2xl border border-border p-4">
        <p className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>{t.total}</p>
        <p className="text-xs text-muted-foreground">Conjuntos totales</p>
        <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
          <div className="h-full bg-crimson rounded-full" style={{ width: `${pct}%` }} />
        </div>
        <p className="text-[10px] text-muted-foreground mt-0.5">{pct}% en uso</p>
      </div>
      {([
        ["Disponibles",   t.disp, "bg-emerald-500/10 border-emerald-500/20", "text-emerald-700"],
        ["Alquilados",    t.alq,  "bg-red-500/10 border-red-500/20",         "text-red-700"],
        ["En tránsito",   t.tran, "bg-amber-500/10 border-amber-500/20",     "text-amber-700"],
        ["Dados de baja", t.baja, "bg-gray-500/10 border-gray-500/20",       "text-gray-500"],
      ] as const).map(([label, value, cls, txtCls]) => (
        <div key={label} className={`rounded-2xl border p-4 ${cls}`}>
          <p className={`text-2xl font-bold ${txtCls}`} style={{ fontFamily: "var(--font-outfit)" }}>{value}</p>
          <p className={`text-xs ${txtCls} opacity-80`}>{label}</p>
        </div>
      ))}
    </div>
  );
}

// ── SucursalStatsRow ───────────────────────────────────────────────────────────

function SucursalStatsRow({ stats }: { stats: StatsSucursal[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => {
        const pct = s.total > 0 ? Math.round((s.alquilado / s.total) * 100) : 0;
        return (
          <div key={s.sucursalId} className="flex-1 min-w-[200px] rounded-2xl border border-border bg-card p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-sm">{s.nombre}</p>
                <p className="text-xs text-muted-foreground">{s.ciudad}</p>
              </div>
              <span className="text-xs font-bold">{s.total} total</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-crimson rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              <span className="text-emerald-600">✓ {s.disponible} disp.</span>
              <span className="text-red-600">⊗ {s.alquilado} alq.</span>
              <span className="text-amber-600">⇆ {s.enTransferencia} trán.</span>
              <span className="text-gray-500">✕ {s.dadoDeBaja} baja</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── InstanciaDrawer ────────────────────────────────────────────────────────────

function InstanciaDrawer({ instancia, token, backendUrl, onClose, onUpdated }: {
  instancia: InstanciaConjunto;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onUpdated: (updated: Partial<InstanciaConjunto> & { id: number }) => void;
}) {
  const [notas, setNotas]           = useState(instancia.notas ?? "");
  const [savingNotas, setSavingNotas] = useState(false);
  const [desamblando, setDesamblando] = useState(false);
  const [historial, setHistorial]   = useState<MovimientoInstancia[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  const loadHistorial = useCallback(async () => {
    setLoadingHist(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${instancia.id}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistorial(await res.json() as MovimientoInstancia[]);
    } finally { setLoadingHist(false); }
  }, [backendUrl, instancia.id, token]);

  useEffect(() => { void loadHistorial(); }, [loadHistorial]);

  const handleSaveNotas = async () => {
    setSavingNotas(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${instancia.id}/notas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notas }),
      });
      if (res.ok) { onUpdated({ id: instancia.id, notas }); await loadHistorial(); }
    } finally { setSavingNotas(false); }
  };

  const handleDesensamblar = async () => {
    if (!confirm("¿Desensamblar este conjunto? Las piezas volverán al pool.")) return;
    setDesamblando(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${instancia.id}/desensamblar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { onUpdated({ id: instancia.id, componentes: [] }); await loadHistorial(); }
    } finally { setDesamblando(false); }
  };

  const chip = ESTADO_CHIP[instancia.estado] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-bold text-base font-mono">{instancia.codigo}</p>
            <p className="text-xs text-muted-foreground">{instancia.variacion.conjunto.nombre} · {instancia.sucursal.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Estado</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${chip}`}>{instancia.estado.replace(/_/g, " ")}</span>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Sucursal</p>
              <p className="text-sm font-medium">{instancia.sucursal.nombre}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Danza</p>
              <p className="text-sm font-medium">{instancia.variacion.conjunto.danza}</p>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground mb-1">Prendas ensambladas</p>
              <p className="text-sm font-bold">{instancia.componentes.length} <span className="text-muted-foreground font-normal">piezas</span></p>
            </div>
          </div>

          {instancia.componentes.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Prendas ensambladas</p>
                <button onClick={() => void handleDesensamblar()} disabled={desamblando} className="text-xs text-red-600 hover:text-red-700 font-semibold disabled:opacity-50">
                  {desamblando ? "Desensamblando…" : "↩ Desensamblar"}
                </button>
              </div>
              <div className="space-y-1.5">
                {instancia.componentes.map((p) => (
                  <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-xs font-medium flex-1">{p.componente.tipo}</span>
                    <span className="font-mono text-xs text-muted-foreground">{p.serial}</span>
                    {p.talla && <span className="text-xs text-muted-foreground">T:{p.talla}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas</p>
            <textarea className={`${inp} w-full resize-none`} rows={3} value={notas} onChange={(e) => setNotas(e.target.value)} placeholder="Estado, daños, observaciones…" />
            <button onClick={() => void handleSaveNotas()} disabled={savingNotas} className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {savingNotas ? "Guardando…" : "Guardar notas"}
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historial</p>
            {loadingHist ? (
              <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : historial.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin movimientos</p>
            ) : (
              <div className="space-y-2">
                {historial.map((m) => (
                  <div key={m.id} className="rounded-xl border border-border p-3 space-y-0.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold">{m.tipo.replace(/_/g, " ")}</span>
                      <span className="text-[11px] text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}</span>
                    </div>
                    {(m.estadoAntes || m.estadoDespues) && (
                      <p className="text-xs text-muted-foreground">{m.estadoAntes?.replace(/_/g, " ")}{m.estadoAntes && m.estadoDespues && " → "}{m.estadoDespues?.replace(/_/g, " ")}</p>
                    )}
                    {m.notas && <p className="text-xs text-muted-foreground italic">{m.notas}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── CreateInstanciaModal ───────────────────────────────────────────────────────

function CreateInstanciaModal({ sucursales, token, backendUrl, onCreated, onClose }: {
  sucursales: SucursalBasic[];
  token: string;
  backendUrl: string;
  onCreated: (inst: InstanciaConjunto) => void;
  onClose: () => void;
}) {
  const [codigo, setCodigo]         = useState("");
  const [sucursalId, setSucursalId] = useState(sucursales[0]?.id.toString() ?? "");
  const [variacionId, setVariacionId] = useState("");
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState("");
  const [variaciones, setVariaciones] = useState<{ id: number; nombre_variacion: string; conjunto: { nombre: string; danza: string } }[]>([]);

  useEffect(() => {
    fetch(`${backendUrl}/catalogo/conjuntos`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: { id: number; nombre: string; danza: string; variaciones: { id: number; nombre_variacion: string }[] }[]) => {
        const vars = data.flatMap((c) => (c.variaciones ?? []).map((v) => ({ id: v.id, nombre_variacion: v.nombre_variacion, conjunto: { nombre: c.nombre, danza: c.danza } })));
        setVariaciones(vars);
        if (vars.length > 0) setVariacionId(vars[0].id.toString());
      })
      .catch(() => {});
  }, [backendUrl, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!codigo.trim() || !variacionId || !sucursalId) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ codigo: codigo.trim(), variacionId: Number(variacionId), sucursalId: Number(sucursalId) }),
      });
      if (res.ok) { onCreated(await res.json() as InstanciaConjunto); onClose(); }
      else { const err = await res.json().catch(() => ({})) as { message?: string }; setError(err.message ?? "Error al crear"); }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold text-base">Nueva instancia de conjunto</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Código único</label>
            <input className={`${inp} w-full font-mono`} placeholder="Ej: CAP-003" value={codigo} onChange={(e) => setCodigo(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Variación de conjunto</label>
            <select className={`${inp} w-full cursor-pointer`} value={variacionId} onChange={(e) => setVariacionId(e.target.value)} required>
              {variaciones.length === 0 && <option value="">Cargando…</option>}
              {variaciones.map((v) => <option key={v.id} value={v.id}>{v.conjunto.nombre} — {v.nombre_variacion}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Sucursal</label>
            <select className={`${inp} w-full cursor-pointer`} value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} required>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.ciudad}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Creando…" : "Crear instancia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── CreateComponenteModal ──────────────────────────────────────────────────────

function CreateComponenteModal({ sucursales, token, backendUrl, onCreated, onClose }: {
  sucursales: SucursalBasic[];
  token: string;
  backendUrl: string;
  onCreated: (c: InstanciaComponente) => void;
  onClose: () => void;
}) {
  const [serial, setSerial]             = useState("");
  const [talla, setTalla]               = useState("");
  const [componenteId, setComponenteId] = useState("");
  const [sucursalId, setSucursalId]     = useState(sucursales[0]?.id.toString() ?? "");
  const [notas, setNotas]               = useState("");
  const [saving, setSaving]             = useState(false);
  const [error, setError]               = useState("");
  const [componentes, setComponentes]   = useState<{ id: number; nombre: string; tipo: string }[]>([]);

  useEffect(() => {
    fetch(`${backendUrl}/catalogo/componentes`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: { id: number; nombre: string; tipo: string }[]) => {
        setComponentes(data);
        if (data.length > 0) setComponenteId(data[0].id.toString());
      })
      .catch(() => {});
  }, [backendUrl, token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serial.trim() || !componenteId || !sucursalId) return;
    setSaving(true); setError("");
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-componente`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ serial: serial.trim(), talla: talla.trim() || undefined, componenteId: Number(componenteId), sucursalId: Number(sucursalId), notas: notas.trim() || undefined }),
      });
      if (res.ok) { onCreated(await res.json() as InstanciaComponente); onClose(); }
      else { const err = await res.json().catch(() => ({})) as { message?: string }; setError(err.message ?? "Error al crear"); }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h3 className="font-bold text-base">Nueva pieza física</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Serial único</label>
            <input className={`${inp} w-full font-mono`} placeholder="Ej: SOMB-005" value={serial} onChange={(e) => setSerial(e.target.value)} required />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Tipo de componente</label>
            <select className={`${inp} w-full cursor-pointer`} value={componenteId} onChange={(e) => setComponenteId(e.target.value)} required>
              {componentes.length === 0 && <option value="">Cargando…</option>}
              {componentes.map((c) => <option key={c.id} value={c.id}>{c.tipo} — {c.nombre}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Talla</label>
              <input className={`${inp} w-full`} placeholder="S / M / L / 40…" value={talla} onChange={(e) => setTalla(e.target.value)} />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">Sucursal</label>
              <select className={`${inp} w-full cursor-pointer`} value={sucursalId} onChange={(e) => setSucursalId(e.target.value)} required>
                {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
              </select>
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground">Notas (opcional)</label>
            <input className={`${inp} w-full`} placeholder="Observaciones iniciales…" value={notas} onChange={(e) => setNotas(e.target.value)} />
          </div>
          {error && <p className="text-xs text-red-600 bg-red-50 rounded-xl px-3 py-2">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Creando…" : "Crear pieza"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── InventarioTab ──────────────────────────────────────────────────────────────

function InventarioTab({ initialInstancias, sucursales, token, backendUrl }: {
  initialInstancias: InstanciaConjunto[];
  sucursales: SucursalBasic[];
  token: string;
  backendUrl: string;
}) {
  const [instancias, setInstancias]         = useState(initialInstancias);
  const [search, setSearch]                 = useState("");
  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterEstado, setFilterEstado]     = useState("");
  const [selected, setSelected]             = useState<Set<number>>(new Set());
  const [darBajaMotivo, setDarBajaMotivo]   = useState("");
  const [showBajaConfirm, setShowBajaConfirm] = useState(false);
  const [savingBaja, setSavingBaja]         = useState(false);
  const [drawer, setDrawer]                 = useState<InstanciaConjunto | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const counts: Record<string, number> = { DISPONIBLE: 0, ALQUILADO: 0, EN_TRANSFERENCIA: 0, DADO_DE_BAJA: 0 };
  instancias.forEach((i) => { if (i.estado in counts) counts[i.estado]++; });

  const filtered = instancias.filter((inst) => {
    const q = search.toLowerCase();
    return (
      (!q || inst.codigo.toLowerCase().includes(q) || inst.variacion.conjunto.nombre.toLowerCase().includes(q) || inst.variacion.conjunto.danza.toLowerCase().includes(q)) &&
      (!filterSucursal || inst.sucursalId.toString() === filterSucursal) &&
      (!filterEstado   || inst.estado === filterEstado)
    );
  });

  const toggleSelect = (id: number) => setSelected((prev) => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });
  const toggleAll    = () => setSelected(selected.size === filtered.length ? new Set() : new Set(filtered.map((i) => i.id)));

  const handleDarDeBaja = async () => {
    setSavingBaja(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/dar-de-baja`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected), motivo: darBajaMotivo || undefined }),
      });
      if (res.ok) {
        setInstancias((prev) => prev.map((i) => selected.has(i.id) ? { ...i, estado: "DADO_DE_BAJA" } : i));
        setSelected(new Set()); setShowBajaConfirm(false); setDarBajaMotivo("");
      }
    } finally { setSavingBaja(false); }
  };

  const handleUpdated = (updated: Partial<InstanciaConjunto> & { id: number }) => {
    setInstancias((prev) => prev.map((i) => i.id === updated.id ? { ...i, ...updated } : i));
    if (drawer?.id === updated.id) setDrawer((prev) => prev ? { ...prev, ...updated } : null);
  };

  return (
    <div className="space-y-4">
      {/* Quick filter chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterEstado("")} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${!filterEstado ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:border-primary/40"}`}>
          Todos ({instancias.length})
        </button>
        {([
          ["DISPONIBLE",       "text-emerald-700 border-emerald-500/30 bg-emerald-500/10", "Disponible"],
          ["ALQUILADO",        "text-red-700 border-red-500/30 bg-red-500/10",             "Alquilado"],
          ["EN_TRANSFERENCIA", "text-amber-700 border-amber-500/30 bg-amber-500/10",       "En tránsito"],
          ["DADO_DE_BAJA",     "text-gray-500 border-gray-500/30 bg-gray-500/10",          "Baja"],
        ] as const).map(([estado, cls, label]) => (
          <button key={estado} onClick={() => setFilterEstado(filterEstado === estado ? "" : estado)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filterEstado === estado ? cls : "border-border text-muted-foreground hover:border-primary/40"}`}>
            {label} ({counts[estado]})
          </button>
        ))}
      </div>

      {/* Filters + actions */}
      <div className="flex flex-wrap gap-2 items-center">
        <input className={`${inp} flex-1 min-w-[180px]`} placeholder="Buscar código, conjunto o danza…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inp} cursor-pointer`} value={filterSucursal} onChange={(e) => setFilterSucursal(e.target.value)}>
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        {selected.size > 0 && (
          <button onClick={() => setShowBajaConfirm(true)} className="px-4 py-2 rounded-xl bg-red-500 text-white text-xs font-semibold hover:bg-red-600 transition-colors">
            Dar de baja ({selected.size})
          </button>
        )}
        <button onClick={() => setShowCreateModal(true)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Nueva instancia
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 w-8"><input type="checkbox" className="rounded" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} /></th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conjunto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Sucursal</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Prendas</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden xl:table-cell">Notas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">Sin resultados</td></tr>
            ) : filtered.map((inst) => {
              const chip    = ESTADO_CHIP[inst.estado] ?? "bg-muted text-muted-foreground border-border";
              const receta  = inst.variacion.conjunto.componentes.reduce((s, r) => s + r.cantidad, 0);
              const ensam   = inst.componentes.length;
              const completo = receta > 0 && ensam >= receta;
              return (
                <tr key={inst.id} onClick={() => setDrawer(inst)} className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors">
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}><input type="checkbox" className="rounded" checked={selected.has(inst.id)} onChange={() => toggleSelect(inst.id)} /></td>
                  <td className="px-4 py-3 font-mono font-bold">{inst.codigo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inst.variacion.conjunto.nombre}</p>
                    <p className="text-xs text-muted-foreground">{inst.variacion.conjunto.danza}</p>
                  </td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${chip}`}>{inst.estado.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{inst.sucursal.nombre}</td>
                  <td className="px-4 py-3 hidden lg:table-cell text-center">
                    {receta > 0 ? (
                      <span className={`text-xs font-semibold ${completo ? "text-emerald-600" : ensam > 0 ? "text-amber-600" : "text-muted-foreground"}`}>
                        {ensam}/{receta}{completo ? " ✓" : ""}
                      </span>
                    ) : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[180px] truncate hidden xl:table-cell">{inst.notas ?? "—"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} instancia{filtered.length !== 1 ? "s" : ""}{selected.size > 0 && ` · ${selected.size} seleccionadas`}
          </div>
        )}
      </div>

      {drawer && <InstanciaDrawer instancia={drawer} token={token} backendUrl={backendUrl} onClose={() => setDrawer(null)} onUpdated={handleUpdated} />}
      {showCreateModal && <CreateInstanciaModal sucursales={sucursales} token={token} backendUrl={backendUrl} onCreated={(inst) => setInstancias((prev) => [inst, ...prev])} onClose={() => setShowCreateModal(false)} />}

      {showBajaConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-base">Dar de baja {selected.size} instancia(s)</h3>
            <p className="text-sm text-muted-foreground">Esta acción cambia el estado a DADO DE BAJA.</p>
            <textarea className={`${inp} w-full resize-none`} rows={3} value={darBajaMotivo} onChange={(e) => setDarBajaMotivo(e.target.value)} placeholder="Motivo (opcional)…" />
            <div className="flex gap-3">
              <button onClick={() => setShowBajaConfirm(false)} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
              <button onClick={() => void handleDarDeBaja()} disabled={savingBaja} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
                {savingBaja ? "Procesando…" : "Confirmar baja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── PoolTab ────────────────────────────────────────────────────────────────────

function PoolTab({ sucursales, token, backendUrl }: { sucursales: SucursalBasic[]; token: string; backendUrl: string }) {
  const [piezas, setPiezas]                 = useState<InstanciaComponente[]>([]);
  const [loading, setLoading]               = useState(true);
  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterEstado, setFilterEstado]     = useState("");
  const [filterTipo, setFilterTipo]         = useState("");
  const [search, setSearch]                 = useState("");
  const [showCreate, setShowCreate]         = useState(false);
  const [updatingId, setUpdatingId]         = useState<number | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const url = `${backendUrl}/inventario/instancias-componente${filterSucursal ? `?sucursalId=${filterSucursal}` : ""}`;
      const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPiezas(await res.json() as InstanciaComponente[]);
    } finally { setLoading(false); }
  }, [backendUrl, token, filterSucursal]);

  useEffect(() => { void load(); }, [load]);

  const tipos = Array.from(new Set(piezas.map((p) => p.componente.tipo))).sort();
  const estadoCounts: Record<string, number> = {};
  piezas.forEach((p) => { estadoCounts[p.estado] = (estadoCounts[p.estado] ?? 0) + 1; });

  const filtered = piezas.filter((p) => {
    const q = search.toLowerCase();
    return (
      (!q || p.serial.toLowerCase().includes(q) || p.componente.tipo.toLowerCase().includes(q)) &&
      (!filterEstado || p.estado === filterEstado) &&
      (!filterTipo   || p.componente.tipo === filterTipo)
    );
  });

  const handleEstadoChange = async (id: number, estado: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-componente/${id}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ estado }),
      });
      if (res.ok) setPiezas((prev) => prev.map((p) => p.id === id ? { ...p, estado } : p));
    } finally { setUpdatingId(null); }
  };

  return (
    <div className="space-y-4">
      {/* Estado chips */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(estadoCounts).map(([estado, cnt]) => (
          <span key={estado} className={`px-3 py-1.5 rounded-xl text-xs font-semibold border ${ESTADO_CHIP[estado] ?? "bg-muted text-muted-foreground border-border"}`}>
            {estado.replace(/_/g, " ")} ({cnt})
          </span>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input className={`${inp} flex-1 min-w-[160px]`} placeholder="Buscar serial o tipo…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <select className={`${inp} cursor-pointer`} value={filterTipo} onChange={(e) => setFilterTipo(e.target.value)}>
          <option value="">Todos los tipos</option>
          {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <select className={`${inp} cursor-pointer`} value={filterSucursal} onChange={(e) => setFilterSucursal(e.target.value)}>
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre}</option>)}
        </select>
        <select className={`${inp} cursor-pointer`} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {["DISPONIBLE_POOL", "ASIGNADO", "DANADO", "EN_TRANSFERENCIA"].map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
        </select>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Nueva pieza
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Serial</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden sm:table-cell">Talla</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden md:table-cell">Sucursal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide hidden lg:table-cell">Conjunto</th>
                <th className="text-right px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cambiar estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={7} className="text-center py-12 text-muted-foreground text-sm">Sin piezas</td></tr>
              ) : filtered.map((p) => (
                <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3 font-mono font-bold">{p.serial}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{p.componente.tipo}</p>
                    <p className="text-xs text-muted-foreground">{p.componente.nombre}</p>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{p.talla ?? "—"}</td>
                  <td className="px-4 py-3"><span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ESTADO_CHIP[p.estado] ?? "bg-muted text-muted-foreground border-border"}`}>{p.estado.replace(/_/g, " ")}</span></td>
                  <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{p.sucursal.nombre}</td>
                  <td className="px-4 py-3 hidden lg:table-cell">
                    {p.instanciaConjunto ? <span className="font-mono text-xs text-muted-foreground">{p.instanciaConjunto.codigo}</span> : <span className="text-xs text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <select value={p.estado} disabled={updatingId === p.id} onChange={(e) => void handleEstadoChange(p.id, e.target.value)}
                      className="text-xs rounded-lg border border-border bg-background px-2 py-1 cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40 disabled:opacity-50">
                      {["DISPONIBLE_POOL", "ASIGNADO", "DANADO", "EN_TRANSFERENCIA"].map((e) => <option key={e} value={e}>{e.replace(/_/g, " ")}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
        {!loading && filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-border bg-muted/20 text-xs text-muted-foreground">
            {filtered.length} pieza{filtered.length !== 1 ? "s" : ""} de {piezas.length} total
          </div>
        )}
      </div>

      {showCreate && <CreateComponenteModal sucursales={sucursales} token={token} backendUrl={backendUrl} onCreated={(c) => setPiezas((prev) => [c, ...prev])} onClose={() => setShowCreate(false)} />}
    </div>
  );
}

// ── DnD Components ─────────────────────────────────────────────────────────────

function PiezaCard({ pieza, isDragging }: { pieza: PiezaFisica; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({ id: `pieza-${pieza.id}`, data: { pieza } });
  const style = transform ? { transform: `translate3d(${transform.x}px,${transform.y}px,0)` } : undefined;
  return (
    <div ref={setNodeRef} style={style} {...listeners} {...attributes}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-card cursor-grab active:cursor-grabbing select-none transition-all ${isDragging ? "opacity-30" : "hover:border-primary/50 hover:shadow-sm"}`}>
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{pieza.componente.tipo}</p>
        <p className="text-xs text-muted-foreground font-mono truncate">{pieza.serial}</p>
        {pieza.talla && <p className="text-[10px] text-muted-foreground">T: {pieza.talla}</p>}
      </div>
    </div>
  );
}

function SlotDroppable({ tipo, index, filled, pieza, onRemove }: { tipo: string; index: number; filled: boolean; pieza?: PiezaFisica; onRemove?: () => void }) {
  const { isOver, setNodeRef } = useDroppable({ id: `slot-${tipo}-${index}`, data: { tipo, index } });
  return (
    <div ref={setNodeRef} className={`min-h-[3.5rem] rounded-xl border-2 border-dashed transition-all ${filled ? "border-coca/40 bg-coca/5" : isOver ? "border-primary bg-primary/5 scale-[1.01]" : "border-border bg-muted/20 hover:border-primary/30"}`}>
      {filled && pieza ? (
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-coca/20 flex items-center justify-center shrink-0">
            <svg className="h-3.5 w-3.5 text-coca" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">{pieza.componente.tipo}</p>
            <p className="text-xs text-muted-foreground font-mono">{pieza.serial}</p>
          </div>
          <button onClick={onRemove} className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-crimson hover:bg-crimson/10 transition-colors">
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0"><span className="text-xs text-muted-foreground">?</span></div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{tipo}</p>
            <p className="text-xs text-muted-foreground/50">{isOver ? "Soltar aquí" : "Arrastra una pieza"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── ArmadoTab ─────────────────────────────────────────────────────────────────

function ArmadoTab({ instanciasConjunto, sucursales, token, backendUrl }: {
  instanciasConjunto: InstanciaConjunto[]; sucursales: SucursalBasic[]; token: string; backendUrl: string;
}) {
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(sucursales[0]?.id ?? null);
  const [selectedInstancia, setSelectedInstancia] = useState<InstanciaConjunto | null>(null);
  const [slots, setSlots]         = useState<Record<string, PiezaFisica | null>>({});
  const [activeId, setActiveId]   = useState<string | null>(null);
  const [saving, setSaving]       = useState(false);
  const [desamblando, setDesamblando] = useState(false);
  const [message, setMessage]     = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [poolPiezas, setPoolPiezas] = useState<PiezaFisica[]>([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredInstancias = instanciasConjunto.filter((ic) => !selectedSucursal || ic.sucursal.id === selectedSucursal);

  const loadPool = useCallback(async (sucursalId: number) => {
    setLoadingPool(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/pool?sucursalId=${sucursalId}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setPoolPiezas(await res.json() as PiezaFisica[]);
    } finally { setLoadingPool(false); }
  }, [backendUrl, token]);

  const handleSelectInstancia = (inst: InstanciaConjunto) => {
    setSelectedInstancia(inst); setSlots({}); setMessage(null);
    if (selectedSucursal) void loadPool(selectedSucursal);
  };

  const requiredSlots = selectedInstancia
    ? selectedInstancia.variacion.conjunto.componentes.flatMap((rc) =>
        Array.from({ length: rc.cantidad }, (_, i) => ({ tipo: rc.componente.tipo, index: i, key: `${rc.componente.tipo}-${i}` }))
      )
    : [];

  const assignedIds  = new Set(Object.values(slots).filter(Boolean).map((p) => p!.id));
  const availablePool = poolPiezas.filter((p) => !assignedIds.has(p.id));

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const pieceData = active.data.current?.pieza as PiezaFisica | undefined;
    const slotData  = over.data.current as { tipo: string; index: number } | undefined;
    if (!pieceData || !slotData || pieceData.componente.tipo !== slotData.tipo) return;
    const slotKey = `${slotData.tipo}-${slotData.index}`;
    if (slots[slotKey]) return;
    setSlots((prev) => ({ ...prev, [slotKey]: pieceData }));
  };

  const handleEnsamblar = async () => {
    if (!selectedInstancia) return;
    setSaving(true); setMessage(null);
    try {
      const componenteIds = Object.values(slots).filter(Boolean).map((p) => p!.id);
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${selectedInstancia.id}/ensamblar`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ componenteIds }),
      });
      if (res.ok) {
        setMessage({ type: "success", text: `${selectedInstancia.codigo} ensamblado correctamente.` });
        setSlots({}); setSelectedInstancia(null);
        if (selectedSucursal) void loadPool(selectedSucursal);
      } else {
        const err = await res.json().catch(() => ({})) as { message?: string };
        setMessage({ type: "error", text: err.message ?? "Error al ensamblar." });
      }
    } finally { setSaving(false); }
  };

  const handleDesensamblar = async () => {
    if (!selectedInstancia || !confirm("¿Desensamblar? Las piezas volverán al pool.")) return;
    setDesamblando(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${selectedInstancia.id}/desensamblar`, {
        method: "POST", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setMessage({ type: "success", text: `${selectedInstancia.codigo} desensamblado. Piezas devueltas al pool.` });
        setSlots({}); setSelectedInstancia(null);
        if (selectedSucursal) void loadPool(selectedSucursal);
      }
    } finally { setDesamblando(false); }
  };

  const allSlotsFilled   = requiredSlots.length > 0 && requiredSlots.every((s) => slots[s.key]);
  const tieneComponentes = (selectedInstancia?.componentes.length ?? 0) > 0;
  const activePieza      = activeId ? poolPiezas.find((p) => `pieza-${p.id}` === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      onDragStart={({ active }: DragStartEvent) => setActiveId(active.id as string)}
      onDragOver={(_: DragOverEvent) => {}}
      onDragEnd={handleDragEnd}
    >
      <div className="space-y-4">
        {/* Sucursal tabs */}
        <div className="flex flex-wrap gap-2">
          {sucursales.map((s) => (
            <button key={s.id}
              onClick={() => { setSelectedSucursal(s.id); setSelectedInstancia(null); setSlots({}); void loadPool(s.id); }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all ${selectedSucursal === s.id ? "bg-primary text-primary-foreground border-primary" : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"}`}>
              {s.nombre} · {s.ciudad}
            </button>
          ))}
        </div>

        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${message.type === "success" ? "bg-coca/10 text-coca border border-coca/20" : "bg-crimson/10 text-crimson border border-crimson/20"}`}>
            {message.type === "success" ? "✓" : "⚠"} {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Instancias list */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Instancias ({filteredInstancias.length})</p>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
              {filteredInstancias.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No hay instancias en esta sucursal</p>
              ) : filteredInstancias.map((inst) => (
                <button key={inst.id} onClick={() => handleSelectInstancia(inst)}
                  className={`w-full text-left px-4 py-3 rounded-xl border transition-all ${selectedInstancia?.id === inst.id ? "border-primary bg-primary/5" : "border-border bg-card hover:border-primary/40"}`}>
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-sm font-bold">{inst.codigo}</span>
                    <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-full border ${ESTADO_CHIP[inst.estado] ?? ""}`}>{inst.estado.replace(/_/g, " ")}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{inst.variacion.conjunto.nombre}</p>
                  <p className="text-[11px] text-muted-foreground/60">{inst.variacion.conjunto.danza} · {inst.componentes.length} pieza(s)</p>
                </button>
              ))}
            </div>
          </div>

          {/* Maniquí */}
          <div className="space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Maniquí</p>
            {!selectedInstancia ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl">
                <svg className="h-10 w-10 text-muted-foreground/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                <p className="text-sm text-muted-foreground">Selecciona una instancia</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-xl bg-card border border-border">
                  <p className="font-bold text-sm">{selectedInstancia.variacion.conjunto.nombre}</p>
                  <p className="text-xs text-muted-foreground">{selectedInstancia.codigo} · {selectedInstancia.variacion.conjunto.danza}</p>
                  {tieneComponentes && <p className="text-xs text-amber-600 mt-1">⚠ Ya tiene {selectedInstancia.componentes.length} pieza(s)</p>}
                </div>
                {tieneComponentes ? (
                  <>
                    {selectedInstancia.componentes.map((p) => (
                      <div key={p.id} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/40 border border-border">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                        <span className="text-xs font-medium flex-1">{p.componente.tipo}</span>
                        <span className="font-mono text-xs text-muted-foreground">{p.serial}</span>
                      </div>
                    ))}
                    <button onClick={() => void handleDesensamblar()} disabled={desamblando}
                      className="w-full py-2 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                      {desamblando ? "Desensamblando…" : "↩ Desensamblar conjunto"}
                    </button>
                  </>
                ) : (
                  <>
                    {requiredSlots.map((slot) => (
                      <SlotDroppable key={slot.key} tipo={slot.tipo} index={slot.index} filled={!!slots[slot.key]} pieza={slots[slot.key] ?? undefined}
                        onRemove={() => setSlots((prev) => { const n = { ...prev }; delete n[slot.key]; return n; })} />
                    ))}
                    <button onClick={() => void handleEnsamblar()} disabled={!allSlotsFilled || saving}
                      className="w-full py-2 rounded-xl bg-coca text-white text-sm font-semibold hover:bg-coca/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                      {saving ? "Ensamblando…" : allSlotsFilled ? "✓ Ensamblar conjunto" : `Faltan ${requiredSlots.filter((s) => !slots[s.key]).length} pieza(s)`}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Pool */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Pool disponible ({availablePool.length})</p>
            {loadingPool ? (
              <div className="flex items-center justify-center py-8"><div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : availablePool.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Sin piezas disponibles</p>
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto pr-1">
                {availablePool.map((pieza) => <PiezaCard key={pieza.id} pieza={pieza} isDragging={`pieza-${pieza.id}` === activeId} />)}
              </div>
            )}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activePieza ? (
          <div className="px-3 py-2 rounded-xl border bg-card shadow-xl opacity-90 w-52">
            <p className="text-xs font-semibold">{activePieza.componente.tipo}</p>
            <p className="text-xs text-muted-foreground font-mono">{activePieza.serial}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

// ── ArmadoWorkspace (root) ────────────────────────────────────────────────────

export function ArmadoWorkspace({ sucursales, instanciasConjunto, statsSucursales, token, backendUrl }: Props) {
  const [tab, setTab] = useState<"inventario" | "armado" | "pool">("inventario");

  // suppress unused import warning
  void Badge;

  const TABS = [
    { id: "inventario" as const, label: "Inventario" },
    { id: "armado"     as const, label: "Armado" },
    { id: "pool"       as const, label: "Pool de Piezas" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Inventario Físico</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Conjuntos, prendas sueltas y armado de instancias</p>
      </div>

      <GlobalStatsBar stats={statsSucursales} />
      <SucursalStatsRow stats={statsSucursales} />

      <div className="flex border-b border-border gap-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "inventario" && <InventarioTab initialInstancias={instanciasConjunto} sucursales={sucursales} token={token} backendUrl={backendUrl} />}
      {tab === "armado"     && <ArmadoTab instanciasConjunto={instanciasConjunto} sucursales={sucursales} token={token} backendUrl={backendUrl} />}
      {tab === "pool"       && <PoolTab sucursales={sucursales} token={token} backendUrl={backendUrl} />}
    </div>
  );
}
