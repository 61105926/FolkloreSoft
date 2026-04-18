"use client";

import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import {
  type Contrato, type Cliente, type Evento, type ContratoParticipante,
  type ContratoGarantia, type ContratoHistorial, type MovimientoCajaContrato,
  type ConjuntoCatalogo, type VariacionOption, type InstanciaOption,
  type TipoContrato, type EstadoContrato, type CiudadContrato,
  type TipoGarantia, type FormaPago, type TipoParticipante,
  ESTADO_CONTRATO_MAP, TIPO_GARANTIA_OPTIONS, FORMA_PAGO_OPTIONS,
  TIPO_PARTICIPANTE_OPTIONS,
  formatBs, formatFecha, isVencido,
} from "./eventos-client";
import { imprimirContrato } from "./print-contrato";

// ── Internal row types ────────────────────────────────────────────────────────

interface PrendaRow {
  _key: string;
  id?: number;
  conjuntoId?: number;
  variacionId?: number;
  modelo: string;
  cantidad: number;
  costoUnitario: string;
  deleted: boolean;
}

interface GarantiaRow {
  _key: string; id?: number;
  tipo: TipoGarantia; descripcion: string; valor: string;
  deleted: boolean;
}

// ── Props ─────────────────────────────────────────────────────────────────────

interface Props {
  contrato: Contrato | null;
  eventoPreset: Evento | null;
  clientes: Cliente[];
  conjuntos: ConjuntoCatalogo[];
  token: string; backendUrl: string;
  onClose: () => void;
  onSaved: (c: Contrato) => void;
  onDeleted?: (id: number) => void;
  onClienteCreado: (cl: Cliente) => void;
}

type TabKey = "info" | "prendas" | "personas" | "finanzas" | "historial";
const TABS: { key: TabKey; label: string }[] = [
  { key: "info",      label: "Información" },
  { key: "prendas",   label: "Prendas" },
  { key: "personas",  label: "Personas" },
  { key: "finanzas",  label: "Finanzas" },
  { key: "historial", label: "Historial" },
];

const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

// ── Historial styling ─────────────────────────────────────────────────────────

const HISTORIAL_LABEL: Record<string, string> = {
  CREADO:                  "Contrato creado",
  CONFIRMADO:              "Reserva confirmada",
  ENTREGADO:               "Prendas entregadas",
  EN_USO:                  "En uso",
  DEVUELTO:                "Prendas devueltas",
  CON_DEUDA:               "Devuelto con deuda",
  CERRADO:                 "Contrato cerrado",
  CANCELADO:               "Cancelado",
  GARANTIA_RETENIDA:       "Garantía retenida",
  PRENDA_AGREGADA:         "Prenda agregada",
  PRENDA_REMOVIDA:         "Prenda removida",
  PARTICIPANTE_AGREGADO:   "Participante agregado",
  PARTICIPANTE_DEVOLVIO:   "Devolución registrada",
  PARTICIPANTE_REMOVIDO:   "Participante removido",
  GARANTIA_AGREGADA:       "Garantía agregada",
  GARANTIA_REMOVIDA:       "Garantía removida",
  PAGO_REGISTRADO:         "Pago registrado en caja",
  GARANTIA_DEVUELTA:       "Garantía devuelta al cliente",
};

const HISTORIAL_STYLE: Record<string, { icon: string; color: string; bg: string }> = {
  CREADO:                  { icon: "📄", color: "text-primary",        bg: "bg-primary/10" },
  CONFIRMADO:              { icon: "✅", color: "text-coca",            bg: "bg-coca/10" },
  ENTREGADO:               { icon: "📦", color: "text-blue-600",        bg: "bg-blue-500/10" },
  EN_USO:                  { icon: "🎭", color: "text-amber-700",       bg: "bg-amber-400/10" },
  DEVUELTO:                { icon: "🔄", color: "text-emerald-600",     bg: "bg-emerald-500/10" },
  CON_DEUDA:               { icon: "⚠️", color: "text-orange-600",      bg: "bg-orange-400/10" },
  CERRADO:                 { icon: "🔒", color: "text-gray-500",        bg: "bg-gray-500/10" },
  CANCELADO:               { icon: "❌", color: "text-crimson",         bg: "bg-crimson/10" },
  GARANTIA_RETENIDA:       { icon: "🔐", color: "text-orange-600",      bg: "bg-orange-400/10" },
  PRENDA_AGREGADA:         { icon: "👗", color: "text-primary",        bg: "bg-primary/10" },
  PRENDA_REMOVIDA:         { icon: "🗑️", color: "text-muted-foreground", bg: "bg-muted" },
  PARTICIPANTE_AGREGADO:   { icon: "👤", color: "text-primary",        bg: "bg-primary/10" },
  PARTICIPANTE_DEVOLVIO:   { icon: "↩️", color: "text-emerald-600",    bg: "bg-emerald-500/10" },
  PARTICIPANTE_REMOVIDO:   { icon: "✖", color: "text-muted-foreground", bg: "bg-muted" },
  GARANTIA_AGREGADA:       { icon: "🛡️", color: "text-amber-700",      bg: "bg-amber-400/10" },
  GARANTIA_REMOVIDA:       { icon: "🗑️", color: "text-muted-foreground", bg: "bg-muted" },
  PAGO_REGISTRADO:         { icon: "💵", color: "text-emerald-600",     bg: "bg-emerald-500/10" },
  GARANTIA_DEVUELTA:       { icon: "↩", color: "text-blue-600",        bg: "bg-blue-500/10" },
  _DEFAULT:                { icon: "•",  color: "text-muted-foreground", bg: "bg-muted" },
};

// ── Quick-create Cliente ──────────────────────────────────────────────────────

function QuickCreateCliente({ token, backendUrl, onCreado, onCancel }: {
  token: string; backendUrl: string; onCreado: (cl: Cliente) => void; onCancel: () => void;
}) {
  const [form, setForm] = useState({ nombre: "", celular: "", ci: "", email: "", rol: "OTRO" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const set = (f: string, v: string) => setForm((p) => ({ ...p, [f]: v }));

  const handleCreate = async () => {
    if (!form.nombre.trim()) { setError("Nombre obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/clientes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ nombre: form.nombre.trim(), celular: form.celular.trim() || undefined, ci: form.ci.trim() || undefined, email: form.email.trim() || undefined, rol: form.rol }),
      });
      if (res.ok) { onCreado(await res.json()); }
      else { const e = await res.json().catch(() => ({})); setError(e?.message ?? "Error"); setSaving(false); }
    } catch { setError("Error de red"); setSaving(false); }
  };

  return (
    <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3 mt-2">
      <p className="text-xs font-semibold text-primary uppercase tracking-wide">Nuevo cliente</p>
      {error && <p className="text-xs text-crimson">{error}</p>}
      <div className="grid grid-cols-2 gap-2">
        <div className="col-span-2 space-y-1"><label className="text-xs text-muted-foreground">Nombre <span className="text-crimson">*</span></label><input className={inp} value={form.nombre} onChange={(e) => set("nombre", e.target.value)} placeholder="Nombre completo" /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Celular</label><input className={inp} value={form.celular} onChange={(e) => set("celular", e.target.value)} placeholder="7xxxxxxx" /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">CI</label><input className={inp} value={form.ci} onChange={(e) => set("ci", e.target.value)} /></div>
        <div className="space-y-1"><label className="text-xs text-muted-foreground">Rol</label>
          <select className={`${inp} cursor-pointer`} value={form.rol} onChange={(e) => set("rol", e.target.value)}>
            {["PADRE", "DOCENTE", "ORGANIZADOR", "OTRO"].map((r) => <option key={r} value={r}>{r.charAt(0) + r.slice(1).toLowerCase()}</option>)}
          </select>
        </div>
      </div>
      <div className="flex gap-2">
        <button onClick={onCancel} className="flex-1 text-xs py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancelar</button>
        <button onClick={handleCreate} disabled={saving} className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">{saving ? "Guardando…" : "Crear cliente"}</button>
      </div>
    </div>
  );
}

// ── ParticipanteCard (edit mode, live API) ────────────────────────────────────

type CondicionDev = "COMPLETO" | "CON_DANOS" | "PERDIDA";

function ParticipanteCard({ p, prendas, contratoId, token, backendUrl, onUpdated, onDeleted, onGarantiaAdded, onGarantiaRemoved }: {
  p: ContratoParticipante;
  prendas: { id: number; modelo: string }[];
  contratoId: number;
  token: string; backendUrl: string;
  onUpdated: (p: ContratoParticipante) => void;
  onDeleted: (id: number) => void;
  onGarantiaAdded: (g: ContratoGarantia, participanteId: number) => void;
  onGarantiaRemoved: (gid: number, participanteId: number) => void;
}) {
  const [marking, setMarking] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [showAddG, setShowAddG] = useState(false);
  const [newG, setNewG] = useState({ tipo: "EFECTIVO" as TipoGarantia, descripcion: "", valor: "" });
  const [addingG, setAddingG] = useState(false);

  // Devolucion form state
  const [showDevForm, setShowDevForm] = useState(false);
  const [devForm, setDevForm] = useState({ condicion: "COMPLETO" as CondicionDev, notas: "", sancion_monto: "", sancion_motivo: "" });

  const handleMarcarDevuelto = async () => {
    setMarking(true);
    try {
      const body: Record<string, unknown> = { condicion: devForm.condicion };
      if (devForm.notas.trim()) body.notas = devForm.notas.trim();
      if (devForm.condicion !== "COMPLETO") {
        const monto = parseFloat(devForm.sancion_monto);
        if (monto > 0) {
          body.sancion_monto = monto;
          body.sancion_motivo = devForm.sancion_motivo.trim() || (devForm.condicion === "CON_DANOS" ? "Daños en la prenda" : "Pérdida de prenda");
        }
      }
      const res = await fetch(`${backendUrl}/contratos/participantes/${p.id}/devolver`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { onUpdated(await res.json()); setShowDevForm(false); }
    } finally { setMarking(false); }
  };

  const handleDelete = async () => {
    if (!confirm(`¿Eliminar a ${p.nombre}?`)) return;
    setDeleting(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/participantes/${p.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onDeleted(p.id);
    } finally { setDeleting(false); }
  };

  const handleAddGarantia = async () => {
    setAddingG(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${contratoId}/garantias`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipo: newG.tipo,
          descripcion: newG.descripcion.trim() || undefined,
          valor: newG.valor ? parseFloat(newG.valor) : undefined,
          participanteId: p.id,
        }),
      });
      if (res.ok) {
        onGarantiaAdded(await res.json(), p.id);
        setShowAddG(false);
        setNewG({ tipo: "EFECTIVO", descripcion: "", valor: "" });
      }
    } finally { setAddingG(false); }
  };

  const handleRemoveGarantia = async (gid: number) => {
    const res = await fetch(`${backendUrl}/contratos/garantias/${gid}`, {
      method: "DELETE", headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) onGarantiaRemoved(gid, p.id);
  };

  const tipoLabel = TIPO_PARTICIPANTE_OPTIONS.find((t) => t.value === p.tipo)?.label ?? p.tipo;
  const esPerdida = p.devuelto && p.instanciaConjunto?.estado === "DADO_DE_BAJA";
  const cardBorder = p.devuelto
    ? esPerdida ? "border-crimson/30 bg-crimson/5" : "border-emerald-300/40 bg-emerald-500/5"
    : "border-border";

  return (
    <div className={`rounded-xl border p-4 space-y-3 ${cardBorder}`}>
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">{p.nombre}</p>
            <span className="text-xs bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{tipoLabel}</span>
            {p.ci && <span className="text-xs text-muted-foreground font-mono">CI: {p.ci}</span>}
            {p.celular && <span className="text-xs text-muted-foreground">📱 {p.celular}</span>}
            {p.prendaId && prendas.find((pr) => pr.id === p.prendaId) && (
              <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
                {prendas.find((pr) => pr.id === p.prendaId)?.modelo}
              </span>
            )}
            {p.instanciaConjunto && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full border ${
                p.instanciaConjunto.estado === "DADO_DE_BAJA"
                  ? "bg-crimson/10 text-crimson border-crimson/30"
                  : p.instanciaConjunto.estado === "DISPONIBLE"
                  ? "bg-emerald-500/10 text-emerald-700 border-emerald-300/30"
                  : "bg-amber-500/10 text-amber-700 border-amber-300/30"
              }`}>
                {p.instanciaConjunto.estado === "DADO_DE_BAJA" && "⚠ "}
                {p.instanciaConjunto.codigo}
              </span>
            )}
          </div>
          {p.devuelto && p.fecha_devolucion && (
            esPerdida ? (
              <p className="text-xs text-crimson mt-0.5 font-medium">
                Pérdida registrada el {formatFecha(p.fecha_devolucion)}
                {p.instanciaConjunto && <span className="ml-1 opacity-80">· {p.instanciaConjunto.codigo} dado de baja</span>}
              </p>
            ) : (
              <p className="text-xs text-emerald-600 mt-0.5">
                Devolvió el {formatFecha(p.fecha_devolucion)}
                {p.instanciaConjunto && <span className="ml-1 opacity-70">· {p.instanciaConjunto.codigo} liberada</span>}
              </p>
            )
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {!p.devuelto && !showDevForm && (
            <button
              onClick={() => setShowDevForm(true)}
              className="text-xs px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-semibold hover:bg-emerald-500/20 transition-colors whitespace-nowrap"
            >
              Marcar devuelto
            </button>
          )}
          {p.devuelto && esPerdida && (
            <span className="text-xs text-crimson font-semibold flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              Pérdida
            </span>
          )}
          {p.devuelto && !esPerdida && (
            <span className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              Devuelto
            </span>
          )}
          {!p.devuelto && (
            <button onClick={handleDelete} disabled={deleting} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-crimson/10 text-crimson transition-colors ml-1 disabled:opacity-50">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
            </button>
          )}
        </div>
      </div>

      {/* Devolucion form */}
      {!p.devuelto && showDevForm && (
        <div className="rounded-xl border border-emerald-300/50 bg-emerald-500/5 p-3 space-y-3">
          <p className="text-xs font-semibold text-emerald-700 uppercase tracking-wide">Registrar devolución</p>
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Condición de entrega</label>
            <div className="flex gap-1.5 flex-wrap">
              {([["COMPLETO", "Completo"], ["CON_DANOS", "Con daños"], ["PERDIDA", "Pérdida"]] as [CondicionDev, string][]).map(([val, label]) => (
                <button key={val} onClick={() => setDevForm((d) => ({ ...d, condicion: val }))}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${devForm.condicion === val
                    ? val === "COMPLETO" ? "bg-emerald-500 text-white border-emerald-500" : val === "CON_DANOS" ? "bg-amber-500 text-white border-amber-500" : "bg-crimson text-white border-crimson"
                    : "border-border text-muted-foreground hover:bg-muted"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {/* Warning when PERDIDA + instance assigned */}
          {devForm.condicion === "PERDIDA" && p.instanciaConjunto && (
            <div className="rounded-lg bg-crimson/10 border border-crimson/20 px-3 py-2 flex items-start gap-2">
              <svg className="h-4 w-4 text-crimson shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <p className="text-xs text-crimson">
                La instancia <span className="font-mono font-bold">{p.instanciaConjunto.codigo}</span> quedará marcada como <span className="font-bold">DADO DE BAJA</span> en el inventario. Esta acción afecta el stock del conjunto.
              </p>
            </div>
          )}
          {devForm.condicion !== "COMPLETO" && (
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Motivo</label>
                <input className={`${inp} text-xs`} placeholder={devForm.condicion === "PERDIDA" ? "Extraviada, robada, etc." : "Manchas, rotura, etc."} value={devForm.sancion_motivo} onChange={(e) => setDevForm((d) => ({ ...d, sancion_motivo: e.target.value }))} />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Sanción (Bs.)</label>
                <input type="number" min="0" step="0.01" className={`${inp} text-xs`} placeholder="0" value={devForm.sancion_monto} onChange={(e) => setDevForm((d) => ({ ...d, sancion_monto: e.target.value }))} />
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Observaciones (opcional)</label>
            <input className={`${inp} text-xs`} placeholder="Notas adicionales sobre la devolución…" value={devForm.notas} onChange={(e) => setDevForm((d) => ({ ...d, notas: e.target.value }))} />
          </div>
          <div className="flex gap-2">
            <button onClick={() => { setShowDevForm(false); setDevForm({ condicion: "COMPLETO", notas: "", sancion_monto: "", sancion_motivo: "" }); }} className="flex-1 text-xs py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancelar</button>
            <button
              onClick={handleMarcarDevuelto}
              disabled={marking}
              className={`flex-1 text-xs py-1.5 rounded-lg transition-colors disabled:opacity-50 font-semibold text-white ${devForm.condicion === "PERDIDA" ? "bg-crimson hover:bg-crimson/90" : "bg-emerald-500 hover:bg-emerald-600"}`}
            >
              {marking ? "Guardando…" : devForm.condicion === "PERDIDA" ? "Registrar pérdida" : "Confirmar devolución"}
            </button>
          </div>
        </div>
      )}

      {/* Per-person garantías */}
      {(p.garantias ?? []).length > 0 && (
        <div className="space-y-1.5 pl-1">
          {(p.garantias ?? []).map((g) => (
            <div key={g.id} className="flex items-center gap-2 text-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 shrink-0" />
              <span className="font-medium">{TIPO_GARANTIA_OPTIONS.find((t) => t.value === g.tipo)?.label}</span>
              {g.descripcion && <span className="text-muted-foreground">— {g.descripcion}</span>}
              {g.valor && <span className="text-coca font-semibold">{formatBs(g.valor)}</span>}
              <button onClick={() => handleRemoveGarantia(g.id)} className="ml-auto text-muted-foreground hover:text-crimson transition-colors">×</button>
            </div>
          ))}
        </div>
      )}

      {showAddG ? (
        <div className="grid grid-cols-3 gap-2 items-end pl-1">
          <select className={`${inp} text-xs cursor-pointer`} value={newG.tipo} onChange={(e) => setNewG((g) => ({ ...g, tipo: e.target.value as TipoGarantia }))}>
            {TIPO_GARANTIA_OPTIONS.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
          </select>
          <input className={`${inp} text-xs`} placeholder="Descripción" value={newG.descripcion} onChange={(e) => setNewG((g) => ({ ...g, descripcion: e.target.value }))} />
          <div className="flex gap-1">
            <input type="number" min="0" className={`${inp} text-xs`} placeholder="Valor Bs." value={newG.valor} onChange={(e) => setNewG((g) => ({ ...g, valor: e.target.value }))} />
            <button onClick={handleAddGarantia} disabled={addingG} className="px-2 rounded-xl bg-amber-500/20 text-amber-700 text-xs font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50 whitespace-nowrap">
              {addingG ? "…" : "+"}
            </button>
            <button onClick={() => setShowAddG(false)} className="px-2 rounded-xl border border-border text-xs hover:bg-muted transition-colors">×</button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddG(true)}
          className="text-xs text-amber-600 hover:underline pl-1 flex items-center gap-1"
        >
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Agregar garantía a {p.nombre.split(" ")[0]}
        </button>
      )}
    </div>
  );
}

// ── Main ContratoModal ────────────────────────────────────────────────────────

export function ContratoModal({
  contrato, eventoPreset, clientes: initialClientes,
  conjuntos, token, backendUrl,
  onClose, onSaved, onDeleted, onClienteCreado,
}: Props) {
  const isEdit = !!contrato;
  const [activeTab, setActiveTab] = useState<TabKey>("info");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);

  // Full contract fetch
  // If prendas/participantes aren't included in the list payload, start with null
  // so the populate useEffect fires once the fetch resolves (id: undefined → number).
  const needsFetch = isEdit && contrato && contrato.prendas === undefined;
  const [loadingFull, setLoadingFull] = useState(needsFetch);
  const [fullContrato, setFullContrato] = useState<Contrato | null>(needsFetch ? null : (contrato ?? null));

  useEffect(() => {
    if (!needsFetch || !contrato) return;
    fetch(`${backendUrl}/contratos/${contrato.id}`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data: Contrato) => { setFullContrato(data); setLoadingFull(false); })
      .catch(() => setLoadingFull(false));
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Info state ─────────────────────────────────────────────────────────────
  const [clienteId, setClienteId] = useState(contrato?.clienteId.toString() ?? "");
  const [clienteSearch, setClienteSearch] = useState(contrato?.cliente.nombre ?? "");
  const [showDropdown, setShowDropdown] = useState(false);
  const [showQuickCreate, setShowQuickCreate] = useState(false);
  const [tipo, setTipo] = useState<TipoContrato>(contrato?.tipo ?? "DIRECTO");
  const [ciudad, setCiudad] = useState<CiudadContrato>(contrato?.ciudad ?? "LA_PAZ");
  const [eventoId, setEventoId] = useState(contrato?.eventoId?.toString() ?? eventoPreset?.id?.toString() ?? "");
  const [nombreEventoExt, setNombreEventoExt] = useState(contrato?.nombre_evento_ext ?? (eventoPreset ? eventoPreset.nombre : ""));
  const [institucion, setInstitucion] = useState(contrato?.institucion ?? "");
  const [ubicacion, setUbicacion] = useState(contrato?.ubicacion ?? "");
  const toDate = (iso: string | null | undefined) => iso ? new Date(iso).toISOString().slice(0, 10) : "";
  const [fechaEntrega, setFechaEntrega] = useState(toDate(contrato?.fecha_entrega));
  const [fechaDevolucion, setFechaDevolucion] = useState(toDate(contrato?.fecha_devolucion));

  // ── Prendas state ──────────────────────────────────────────────────────────
  const [prendas, setPrendas] = useState<PrendaRow[]>(() =>
    (contrato?.prendas ?? []).map((p) => ({
      _key: `p-${p.id}`, id: p.id, conjuntoId: p.conjuntoId ?? undefined,
      variacionId: p.variacionId ?? undefined,
      modelo: p.modelo,
      cantidad: p.cantidad_hombres + p.cantidad_cholitas + p.cantidad_machas + p.cantidad_ninos,
      costoUnitario: p.costo_unitario, deleted: false,
    }))
  );
  const [catalogSearch, setCatalogSearch] = useState("");
  const [stockCache, setStockCache] = useState<Record<number, number>>({});

  // ── Garantías (3-checkbox UI — shared create/edit) ────────────────────────
  const contractGarantias = (contrato?.garantias ?? []).filter((g) => !g.participanteId);
  const [gEfectivo, setGEfectivo] = useState(() => contractGarantias.some((g) => g.tipo === "EFECTIVO"));
  const [gEfectivoMonto, setGEfectivoMonto] = useState(() => {
    const g = contractGarantias.find((g) => g.tipo === "EFECTIVO");
    return g?.valor ? String(parseFloat(String(g.valor))) : "";
  });
  const [gEfectivoFormaPago, setGEfectivoFormaPago] = useState<FormaPago | "">(
    () => (contractGarantias.find((g) => g.tipo === "EFECTIVO")?.descripcion as FormaPago | undefined) ?? "EFECTIVO"
  );
  const [gCarnet, setGCarnet] = useState(() => contractGarantias.some((g) => g.tipo === "DOCUMENTO_CARNET"));
  const [gCarta, setGCarta] = useState(() => contractGarantias.some((g) => g.tipo === "CARTA_INSTITUCIONAL"));

  // ── Live participants + contract garantías (edit mode) ─────────────────────
  const [liveParticipantes, setLiveParticipantes] = useState<ContratoParticipante[]>(
    () => contrato?.participantes ?? []
  );
  const [liveHistorial, setLiveHistorial] = useState<ContratoHistorial[]>(
    () => contrato?.historial ?? []
  );
  const [liveMovimientos, setLiveMovimientos] = useState<MovimientoCajaContrato[]>(
    () => contrato?.movimientosCaja ?? []
  );
  const [liveGarantias, setLiveGarantias] = useState<ContratoGarantia[]>(
    () => (contrato?.garantias ?? []).filter((g) => !g.participanteId)
  );

  // Add participant form state
  const [showAddParticipante, setShowAddParticipante] = useState(false);
  const [newP, setNewP] = useState({ nombre: "", ci: "", celular: "", tipo: "HOMBRE" as TipoParticipante, prendaId: "", instanciaConjuntoId: "" });
  const [addingP, setAddingP] = useState(false);
  const [instanciaOptions, setInstanciaOptions] = useState<InstanciaOption[]>([]);
  const [loadingInstancias, setLoadingInstancias] = useState(false);

  // Saving state for edit-mode guarantee toggles
  const [savingGarantia, setSavingGarantia] = useState(false);

  // ── Finanzas state ─────────────────────────────────────────────────────────
  const [estado, setEstado] = useState<EstadoContrato>(contrato?.estado ?? "RESERVADO");
  const [anticipo, setAnticipo] = useState(parseFloat(contrato?.anticipo ?? "0").toString());
  const [totalPagado, setTotalPagado] = useState(parseFloat(contrato?.total_pagado ?? "0").toString());
  const [formaPago, setFormaPago] = useState<FormaPago | "">(contrato?.forma_pago ?? "");
  const [totalOverride, setTotalOverride] = useState(contrato ? parseFloat(contrato.total).toString() : "");
  const [overrideEnabled, setOverrideEnabled] = useState(false);
  const [observaciones, setObservaciones] = useState(contrato?.observaciones ?? "");
  const [condiciones, setCondiciones] = useState(contrato?.condiciones ?? "");
  const [retenerMotivo, setRetenerMotivo] = useState("");
  const [showRetener, setShowRetener] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Registrar pago form state ───────────────────────────────────────────────
  const [showPagoForm, setShowPagoForm] = useState(false);
  const [pagoMonto, setPagoMonto] = useState("");
  const [pagoFormaPago, setPagoFormaPago] = useState<FormaPago>("EFECTIVO");
  const [pagoReferencia, setPagoReferencia] = useState("");
  const [pagoDescripcion, setPagoDescripcion] = useState("");
  const [pagoConcepto, setPagoConcepto] = useState<"PAGO_SALDO_CONTRATO" | "DEUDA_COBRADA" | "ANTICIPO_CONTRATO">("PAGO_SALDO_CONTRATO");
  const [savingPago, setSavingPago] = useState(false);

  // ── Registrar egreso form state ─────────────────────────────────────────────
  const [showEgresoForm, setShowEgresoForm] = useState(false);
  const [egresoMonto, setEgresoMonto] = useState("");
  const [egresoFormaPago, setEgresoFormaPago] = useState<FormaPago>("EFECTIVO");
  const [egresoReferencia, setEgresoReferencia] = useState("");
  const [egresoDescripcion, setEgresoDescripcion] = useState("");
  const [egresoConcepto, setEgresoConcepto] = useState<"DEVOLUCION_GARANTIA" | "OTRO_EGRESO">("DEVOLUCION_GARANTIA");
  const [savingEgreso, setSavingEgreso] = useState(false);

  // Populate all state once full contrato loads
  useEffect(() => {
    if (!fullContrato || !isEdit) return;
    setClienteId(fullContrato.clienteId.toString());
    setClienteSearch(fullContrato.cliente.nombre);
    setTipo(fullContrato.tipo); setCiudad(fullContrato.ciudad);
    setEventoId(fullContrato.eventoId?.toString() ?? "");
    setNombreEventoExt(fullContrato.nombre_evento_ext ?? "");
    setInstitucion(fullContrato.institucion ?? ""); setUbicacion(fullContrato.ubicacion ?? "");
    setFechaEntrega(toDate(fullContrato.fecha_entrega));
    setFechaDevolucion(toDate(fullContrato.fecha_devolucion));
    setEstado(fullContrato.estado);
    setAnticipo(parseFloat(fullContrato.anticipo).toString());
    setTotalPagado(parseFloat(fullContrato.total_pagado).toString());
    setFormaPago(fullContrato.forma_pago ?? "");
    setTotalOverride(parseFloat(fullContrato.total).toString());
    setObservaciones(fullContrato.observaciones ?? "");
    setCondiciones(fullContrato.condiciones ?? "");
    if (fullContrato.prendas) {
      setPrendas(fullContrato.prendas.map((p) => ({
        _key: `p-${p.id}`, id: p.id, conjuntoId: p.conjuntoId ?? undefined,
        variacionId: p.variacionId ?? undefined,
        modelo: p.modelo,
        cantidad: p.cantidad_hombres + p.cantidad_cholitas + p.cantidad_machas + p.cantidad_ninos,
        costoUnitario: p.costo_unitario, deleted: false,
      })));
    }
    setLiveParticipantes(fullContrato.participantes ?? []);
    setLiveGarantias((fullContrato.garantias ?? []).filter((g) => !g.participanteId));
    setLiveHistorial(fullContrato.historial ?? []);
    setLiveMovimientos(fullContrato.movimientosCaja ?? []);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fullContrato?.id]);

  // ── Computed ───────────────────────────────────────────────────────────────
  const totalPrendas = useMemo(() =>
    prendas.filter((p) => !p.deleted).reduce((s, p) =>
      s + p.cantidad * parseFloat(p.costoUnitario || "0"), 0),
    [prendas]
  );
  const totalFinal = overrideEnabled && totalOverride ? parseFloat(totalOverride) : totalPrendas;
  const deuda = totalFinal - parseFloat(totalPagado || "0");

  const filteredConjuntos = useMemo(() => {
    const q = catalogSearch.toLowerCase().trim();
    if (!q) return [];
    return conjuntos.filter((c) =>
      c.nombre.toLowerCase().includes(q) || c.danza.toLowerCase().includes(q)
    ).slice(0, 8);
  }, [conjuntos, catalogSearch]);

  // ── Cliente helpers ────────────────────────────────────────────────────────
  const clientesFiltrados = useMemo(() => {
    const q = clienteSearch.toLowerCase().trim();
    return (q ? clientes.filter((c) =>
      c.nombre.toLowerCase().includes(q) || (c.ci ?? "").includes(q) || (c.celular ?? "").includes(q)
    ) : clientes).slice(0, 10);
  }, [clientes, clienteSearch]);

  const selectedCliente = clientes.find((c) => c.id.toString() === clienteId);

  const handleClienteSelect = (c: Cliente) => { setClienteId(c.id.toString()); setClienteSearch(c.nombre); setShowDropdown(false); };
  const handleClienteCreadoLocal = (cl: Cliente) => { setClientes((prev) => [...prev, cl]); onClienteCreado(cl); handleClienteSelect(cl); setShowQuickCreate(false); };

  // ── Prendas helpers ────────────────────────────────────────────────────────
  const addPrendaFromCatalog = (c: ConjuntoCatalogo) => {
    setPrendas((p) => [...p, { _key: `new-${Date.now()}`, conjuntoId: c.id, variacionId: undefined, modelo: c.nombre, cantidad: 1, costoUnitario: c.precio_base, deleted: false }]);
    setCatalogSearch("");
  };
  const addPrenda = () => setPrendas((p) => [...p, { _key: `new-${Date.now()}`, modelo: "", cantidad: 1, costoUnitario: "0", deleted: false }]);
  const updPrenda = (key: string, field: keyof PrendaRow, val: unknown) => setPrendas((p) => p.map((r) => r._key === key ? { ...r, [field]: val } : r));
  const delPrenda = (key: string) => setPrendas((p) => p.map((r) => r._key === key ? { ...r, deleted: true } : r));

  // ── Edit-mode: toggle a contract-level guarantee via API ───────────────────
  const toggleContractGarantia = async (
    tipo: TipoGarantia,
    opts?: { valor?: number; descripcion?: string }
  ) => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid) return;
    setSavingGarantia(true);
    try {
      const existing = liveGarantias.find((g) => g.tipo === tipo);
      if (existing) {
        const res = await fetch(`${backendUrl}/contratos/garantias/${existing.id}`, {
          method: "DELETE", headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) { setLiveGarantias((prev) => prev.filter((g) => g.id !== existing.id)); void refreshHistorial(); }
      } else {
        const res = await fetch(`${backendUrl}/contratos/${cid}/garantias`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({ tipo, ...(opts ?? {}) }),
        });
        if (res.ok) { const nuevo = await res.json(); setLiveGarantias((prev) => [...prev, nuevo]); void refreshHistorial(); }
      }
    } finally { setSavingGarantia(false); }
  };

  // ── Instancias disponibles for prenda ──────────────────────────────────────
  const handlePrendaParticipanteChange = async (prendaId: string) => {
    setNewP((p) => ({ ...p, prendaId, instanciaConjuntoId: "" }));
    setInstanciaOptions([]);
    if (!prendaId) return;
    const prenda = (fullContrato?.prendas ?? []).find((p) => p.id === parseInt(prendaId));
    if (!prenda?.variacionId) return;
    setLoadingInstancias(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/prendas/${prendaId}/instancias-disponibles`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setInstanciaOptions(await res.json());
    } finally { setLoadingInstancias(false); }
  };

  // ── Live participant helpers ────────────────────────────────────────────────
  const handleAddParticipante = async () => {
    if (!newP.nombre.trim()) return;
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid) return;
    setAddingP(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}/participantes`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: newP.nombre.trim(),
          ci: newP.ci.trim() || undefined,
          celular: newP.celular.trim() || undefined,
          tipo: newP.tipo,
          prendaId: newP.prendaId ? parseInt(newP.prendaId) : undefined,
        }),
      });
      if (res.ok) {
        const nuevoP = await res.json();
        setLiveParticipantes((prev) => [...prev, { ...nuevoP, garantias: [] }]);
        setShowAddParticipante(false);
        setNewP({ nombre: "", ci: "", celular: "", tipo: "HOMBRE", prendaId: "", instanciaConjuntoId: "" });
        setInstanciaOptions([]);
        void refreshHistorial();
      }
    } finally { setAddingP(false); }
  };


  // ── Refresh historial helper ───────────────────────────────────────────────
  const refreshHistorial = async () => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid) return;
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) {
        const fresh: Contrato = await res.json();
        setLiveHistorial(fresh.historial ?? []);
        setLiveMovimientos(fresh.movimientosCaja ?? []);
      }
    } catch { /* silent */ }
  };

  // ── Registrar pago en caja ─────────────────────────────────────────────────
  const handleRegistrarPago = async () => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid || !pagoMonto || parseFloat(pagoMonto) <= 0) return;
    setSavingPago(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}/registrar-pago`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          monto: parseFloat(pagoMonto),
          forma_pago: pagoFormaPago,
          referencia: pagoReferencia.trim() || undefined,
          descripcion: pagoDescripcion.trim() || undefined,
          concepto: pagoConcepto,
        }),
      });
      if (res.ok) {
        const fresh: Contrato = await res.json();
        setFullContrato(fresh);
        setTotalPagado(parseFloat(fresh.total_pagado).toString());
        setLiveHistorial(fresh.historial ?? []);
        setLiveMovimientos(fresh.movimientosCaja ?? []);
        onSaved(fresh);
        // Reset form
        setShowPagoForm(false);
        setPagoMonto(""); setPagoReferencia(""); setPagoDescripcion("");
        setPagoFormaPago("EFECTIVO"); setPagoConcepto("PAGO_SALDO_CONTRATO");
      }
    } finally { setSavingPago(false); }
  };

  // ── Registrar egreso en caja ───────────────────────────────────────────────
  const handleRegistrarEgreso = async () => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid || !egresoMonto || parseFloat(egresoMonto) <= 0) return;
    setSavingEgreso(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}/registrar-egreso`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          monto: parseFloat(egresoMonto),
          forma_pago: egresoFormaPago,
          referencia: egresoReferencia.trim() || undefined,
          descripcion: egresoDescripcion.trim() || undefined,
          concepto: egresoConcepto,
        }),
      });
      if (res.ok) {
        const fresh: Contrato = await res.json();
        setFullContrato(fresh);
        setLiveHistorial(fresh.historial ?? []);
        setLiveMovimientos(fresh.movimientosCaja ?? []);
        onSaved(fresh);
        setShowEgresoForm(false);
        setEgresoMonto(""); setEgresoReferencia(""); setEgresoDescripcion("");
        setEgresoFormaPago("EFECTIVO"); setEgresoConcepto("DEVOLUCION_GARANTIA");
      }
    } finally { setSavingEgreso(false); }
  };

  // ── Lifecycle actions ──────────────────────────────────────────────────────
  const lifecycleAction = async (endpoint: string, body?: object) => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid) return;
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}/${endpoint}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: body ? JSON.stringify(body) : undefined,
      });
      if (res.ok) {
        const fresh: Contrato = await res.json();
        setFullContrato(fresh);
        setLiveHistorial(fresh.historial ?? []);
        setLiveMovimientos(fresh.movimientosCaja ?? []);
        onSaved(fresh);
      } else { const e = await res.json().catch(() => ({})); setError(e?.message ?? "Error"); setSaving(false); }
    } catch { setError("Error de red"); setSaving(false); }
  };

  // ── Delete ─────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    const cid = fullContrato?.id ?? contrato?.id;
    if (!cid) return;
    setDeleting(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/contratos/${cid}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { onDeleted?.(cid); }
      else { const e = await res.json().catch(() => ({})); setError(e?.message ?? "Error al eliminar"); setDeleting(false); setShowConfirmDelete(false); }
    } catch { setError("Error de red"); setDeleting(false); setShowConfirmDelete(false); }
  };

  // ── Stock helper ───────────────────────────────────────────────────────────
  const fetchStock = async (variacionId: number) => {
    if (stockCache[variacionId] !== undefined) return;
    try {
      const res = await fetch(`${backendUrl}/contratos/variacion/${variacionId}/stock`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json() as { disponibles: number };
        setStockCache((prev) => ({ ...prev, [variacionId]: data.disponibles }));
      }
    } catch { /* ignore */ }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!clienteId) { setError("Seleccioná un cliente"); setActiveTab("info"); return; }
    if (!fechaEntrega) { setError("La fecha de entrega es obligatoria"); setActiveTab("info"); return; }
    if (!fechaDevolucion) { setError("La fecha de devolución es obligatoria"); setActiveTab("info"); return; }

    // Validate stock for prendas with variacion
    const prendasConStockInsuficiente = prendas.filter(
      (p) => !p.deleted && p.variacionId && p.cantidad > (stockCache[p.variacionId] ?? Infinity)
    );
    if (prendasConStockInsuficiente.length > 0) {
      const nombres = prendasConStockInsuficiente.map((p) => `${p.modelo} (${stockCache[p.variacionId!]} disp.)`).join(", ");
      setError(`Stock insuficiente para: ${nombres}`);
      setActiveTab("prendas");
      return;
    }

    setSaving(true); setError(null);

    try {
      if (isEdit) {
        const cid = fullContrato?.id ?? contrato!.id;
        const patchRes = await fetch(`${backendUrl}/contratos/${cid}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            tipo, ciudad, estado,
            clienteId: parseInt(clienteId),
            eventoId: eventoId ? parseInt(eventoId) : null,
            nombre_evento_ext: nombreEventoExt.trim() || undefined,
            institucion: institucion.trim() || undefined,
            ubicacion: ubicacion.trim() || undefined,
            fecha_entrega: fechaEntrega, fecha_devolucion: fechaDevolucion,
            total: totalFinal, anticipo: parseFloat(anticipo || "0"),
            forma_pago: formaPago || null,
            observaciones: observaciones.trim() || undefined,
            condiciones: condiciones.trim() || undefined,
          }),
        });
        if (!patchRes.ok) {
          const e = await patchRes.json().catch(() => ({}));
          setError(e?.message ?? "Error al actualizar"); setSaving(false); return;
        }

        // Diff prendas
        const toDelP = prendas.filter((p) => p.deleted && p.id);
        const toAddP = prendas.filter((p) => !p.deleted && !p.id && p.modelo.trim());
        const toUpdP = prendas.filter((p) => !p.deleted && !!p.id);
        await Promise.all(toDelP.map((p) =>
          fetch(`${backendUrl}/contratos/prendas/${p.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } })
        ));
        await Promise.all(toAddP.map((p) =>
          fetch(`${backendUrl}/contratos/${cid}/prendas`, {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              modelo: p.modelo, conjuntoId: p.conjuntoId, variacionId: p.variacionId ?? undefined,
              cantidad_hombres: p.cantidad, cantidad_cholitas: 0,
              cantidad_machas: 0, cantidad_ninos: 0,
              costo_unitario: parseFloat(p.costoUnitario || "0"),
            }),
          })
        ));
        await Promise.all(toUpdP.map((p) =>
          fetch(`${backendUrl}/contratos/prendas/${p.id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
              modelo: p.modelo, variacionId: p.variacionId ?? null,
              cantidad_hombres: p.cantidad, cantidad_cholitas: 0,
              cantidad_machas: 0, cantidad_ninos: 0,
              costo_unitario: parseFloat(p.costoUnitario || "0"),
            }),
          })
        ));

        const full = await fetch(`${backendUrl}/contratos/${cid}`, { headers: { Authorization: `Bearer ${token}` } });
        onSaved(full.ok ? await full.json() : await patchRes.json());
      } else {
        const activePrendas = prendas.filter((p) => !p.deleted && p.modelo.trim());
        const garantiasToSubmit = [
          ...(gEfectivo ? [{ tipo: "EFECTIVO" as TipoGarantia, valor: gEfectivoMonto ? parseFloat(gEfectivoMonto) : undefined, descripcion: gEfectivoFormaPago || undefined }] : []),
          ...(gCarnet ? [{ tipo: "DOCUMENTO_CARNET" as TipoGarantia }] : []),
          ...(gCarta  ? [{ tipo: "CARTA_INSTITUCIONAL" as TipoGarantia }] : []),
        ];

        const res = await fetch(`${backendUrl}/contratos`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            clienteId: parseInt(clienteId), tipo, ciudad,
            eventoId: eventoId ? parseInt(eventoId) : undefined,
            nombre_evento_ext: nombreEventoExt.trim() || undefined,
            institucion: institucion.trim() || undefined,
            ubicacion: ubicacion.trim() || undefined,
            fecha_entrega: fechaEntrega, fecha_devolucion: fechaDevolucion,
            anticipo: parseFloat(anticipo || "0"),
            forma_pago: formaPago || undefined,
            observaciones: observaciones.trim() || undefined,
            condiciones: condiciones.trim() || undefined,
            prendas: activePrendas.map((p) => ({
              modelo: p.modelo, conjuntoId: p.conjuntoId, variacionId: p.variacionId ?? undefined,
              cantidad_hombres: p.cantidad, cantidad_cholitas: 0,
              cantidad_machas: 0, cantidad_ninos: 0,
              costo_unitario: parseFloat(p.costoUnitario || "0"),
            })),
            garantias: garantiasToSubmit,
          }),
        });
        if (res.ok) { onSaved(await res.json()); }
        else { const e = await res.json().catch(() => ({})); setError(e?.message ?? "Error al crear"); setSaving(false); }
      }
    } catch { setError("Error de red"); setSaving(false); }
  };

  // ── Loading ────────────────────────────────────────────────────────────────
  if (loadingFull) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
        <div className="bg-background rounded-2xl p-8 flex items-center gap-3 shadow-2xl">
          <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-muted-foreground">Cargando contrato…</span>
        </div>
      </div>
    );
  }

  const activePrendas = prendas.filter((p) => !p.deleted);
  const activeGarantiasCount = (gEfectivo ? 1 : 0) + (gCarnet ? 1 : 0) + (gCarta ? 1 : 0);
  const tabIdx = TABS.findIndex((t) => t.key === activeTab);
  const prendaOptions = (fullContrato?.prendas ?? []).map((p) => ({
    id: p.id,
    modelo: p.modelo,
    variacionId: p.variacionId,
    variacion: p.variacion ?? null,
  }));
  const currentContrato = fullContrato ?? contrato;

  // ── Comprobante imprimible ──────────────────────────────────────────────────
  const imprimirComprobante = () => {
    const c = fullContrato ?? contrato;
    if (!c) return;
    imprimirContrato(c);
  };

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="relative bg-background border border-border rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
              {isEdit ? `Contrato ${currentContrato?.codigo}` : "Nuevo contrato de alquiler"}
            </h2>
            {isEdit && currentContrato && (
              <div className="flex items-center gap-2 mt-0.5">
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ESTADO_CONTRATO_MAP[currentContrato.estado].chip}`}>
                  {ESTADO_CONTRATO_MAP[currentContrato.estado].label}
                </span>
                <span className="text-xs text-muted-foreground">{currentContrato.cliente.nombre}</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {contrato?.id && (
              <button
                onClick={imprimirComprobante}
                title="Imprimir comprobante"
                className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" />
                </svg>
              </button>
            )}
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 px-6 overflow-x-auto">
          {TABS.map((t) => (
            <button key={t.key} onClick={() => setActiveTab(t.key)}
              className={`px-4 py-3 text-sm font-semibold border-b-2 -mb-px transition-colors whitespace-nowrap ${activeTab === t.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
              {t.label}
              {t.key === "prendas" && activePrendas.length > 0 && <span className="ml-1.5 text-xs bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">{activePrendas.length}</span>}
              {t.key === "personas" && (isEdit ? liveParticipantes.length + liveGarantias.length : activeGarantiasCount) > 0 && (
                <span className="ml-1.5 text-xs bg-amber-500/10 text-amber-600 px-1.5 py-0.5 rounded-full">
                  {isEdit ? liveParticipantes.length + liveGarantias.length : activeGarantiasCount}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Status action bar — edit mode only */}
        {isEdit && currentContrato && !["CERRADO", "CANCELADO"].includes(currentContrato.estado) && (
          <div className="flex items-center justify-between px-6 py-2 bg-muted/40 border-b border-border shrink-0 gap-3 flex-wrap">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-bold px-2.5 py-1 rounded-full border ${ESTADO_CONTRATO_MAP[currentContrato.estado].chip}`}>
                {ESTADO_CONTRATO_MAP[currentContrato.estado].label}
              </span>
              {isVencido(currentContrato) && (
                <span className="text-xs font-bold px-2.5 py-1 rounded-full border border-amber-400/50 bg-amber-400/10 text-amber-700">
                  VENCIDO
                </span>
              )}
              {deuda > 0.01 && (
                <span className="text-xs text-crimson font-semibold">
                  Deuda: {formatBs(deuda)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              {currentContrato.estado === "RESERVADO" && (
                <button onClick={() => lifecycleAction("confirmar")} disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-xl bg-coca/10 text-coca font-semibold hover:bg-coca/20 transition-colors disabled:opacity-50">
                  Confirmar reserva →
                </button>
              )}
              {["RESERVADO", "CONFIRMADO"].includes(currentContrato.estado) && (
                <button onClick={() => lifecycleAction("entregar")} disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50">
                  Marcar entregado →
                </button>
              )}
              {currentContrato.estado === "ENTREGADO" && (
                <button onClick={() => lifecycleAction("iniciar")} disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gold/10 text-amber-700 font-semibold hover:bg-gold/20 transition-colors disabled:opacity-50">
                  Pasar a en uso →
                </button>
              )}
              {["EN_USO", "ENTREGADO"].includes(currentContrato.estado) && (
                <button onClick={() => lifecycleAction("devolver", { total_pagado: parseFloat(totalPagado || "0"), con_deuda: deuda > 0.01 })} disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50">
                  Registrar devolución →
                </button>
              )}
              {currentContrato.estado === "DEVUELTO" && (
                <button onClick={() => lifecycleAction("cerrar")} disabled={saving}
                  className="text-xs px-3 py-1.5 rounded-xl bg-gray-500/10 text-gray-600 font-semibold hover:bg-gray-500/20 transition-colors disabled:opacity-50">
                  Cerrar contrato →
                </button>
              )}
            </div>
          </div>
        )}

        {error && <div className="mx-6 mt-3 shrink-0 rounded-xl bg-crimson/10 border border-crimson/20 px-4 py-2.5 text-sm text-crimson">{error}</div>}

        {/* Content */}
        <div className="flex-1 overflow-y-auto">

          {/* ── INFORMACIÓN ── */}
          {activeTab === "info" && (
            <div className="px-6 py-5 space-y-5">

              {/* Cliente */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente <span className="text-crimson">*</span></label>
                {selectedCliente && !showDropdown ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl border border-primary/40 bg-primary/5">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                      {selectedCliente.nombre.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold">{selectedCliente.nombre}</p>
                      <p className="text-xs text-muted-foreground">{[selectedCliente.celular, selectedCliente.ci].filter(Boolean).join(" · ")}</p>
                    </div>
                    <button onClick={() => { setClienteId(""); setClienteSearch(""); setShowDropdown(true); }} className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors">Cambiar</button>
                  </div>
                ) : (
                  <div className="relative">
                    <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    <input autoFocus className={`${inp} pl-9`} placeholder="Buscar por nombre, CI o celular…" value={clienteSearch}
                      onChange={(e) => { setClienteSearch(e.target.value); setShowDropdown(true); setShowQuickCreate(false); }}
                      onFocus={() => setShowDropdown(true)} />
                    {showDropdown && (
                      <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-xl z-10 overflow-hidden">
                        {clientesFiltrados.length === 0
                          ? <p className="px-4 py-3 text-sm text-muted-foreground">Sin resultados</p>
                          : clientesFiltrados.map((c) => (
                            <button key={c.id} onClick={() => handleClienteSelect(c)} className="w-full flex items-center gap-3 px-4 py-2.5 text-left hover:bg-muted transition-colors">
                              <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center text-xs font-bold shrink-0">{c.nombre.charAt(0).toUpperCase()}</div>
                              <div className="min-w-0"><p className="text-sm font-medium truncate">{c.nombre}</p><p className="text-xs text-muted-foreground">{[c.celular, c.ci].filter(Boolean).join(" · ")}</p></div>
                            </button>
                          ))
                        }
                        <div className="border-t border-border">
                          <button onClick={() => { setShowDropdown(false); setShowQuickCreate(true); }} className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-primary font-semibold hover:bg-primary/5 transition-colors">
                            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Crear nuevo cliente
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                )}
                {showQuickCreate && <QuickCreateCliente token={token} backendUrl={backendUrl} onCreado={handleClienteCreadoLocal} onCancel={() => setShowQuickCreate(false)} />}
              </div>

              {/* Tipo + Ciudad */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tipo</label>
                  <div className="flex gap-2">
                    {(["DIRECTO", "RESERVA"] as TipoContrato[]).map((t) => (
                      <button key={t} onClick={() => { setTipo(t); if (t === "DIRECTO") setAnticipo("0"); }}
                        className={`flex-1 py-2 rounded-xl text-xs font-semibold border transition-all ${tipo === t ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                        {t === "DIRECTO" ? "Directo" : "Reserva"}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ciudad</label>
                  <select className={`${inp} cursor-pointer`} value={ciudad} onChange={(e) => setCiudad(e.target.value as CiudadContrato)}>
                    <option value="LA_PAZ">La Paz</option><option value="EL_ALTO">El Alto</option><option value="INTERIOR">Interior</option>
                  </select>
                </div>
              </div>

              {/* Nombre ext + Institución */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Nombre evento externo</label><input className={inp} value={nombreEventoExt} onChange={(e) => setNombreEventoExt(e.target.value)} placeholder="Gran Poder, Carnaval…" /></div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Institución</label><input className={inp} value={institucion} onChange={(e) => setInstitucion(e.target.value)} placeholder="Colegio, municipio…" /></div>
              </div>

              {/* Ubicación */}
              <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ubicación</label><input className={inp} value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} placeholder="Av. Mariscal Santa Cruz…" /></div>

              {/* Fechas */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha entrega <span className="text-crimson">*</span></label><input type="date" className={inp} value={fechaEntrega} onChange={(e) => setFechaEntrega(e.target.value)} /></div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Fecha devolución <span className="text-crimson">*</span></label><input type="date" className={inp} value={fechaDevolucion} onChange={(e) => setFechaDevolucion(e.target.value)} /></div>
              </div>
            </div>
          )}

          {/* ── PRENDAS ── */}
          {activeTab === "prendas" && (
            <div className="px-6 py-5 space-y-4">

              {/* Catalog search */}
              <div className="space-y-2">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Agregar del catálogo</p>
                <div className="relative">
                  <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                  <input className={`${inp} pl-9`} placeholder="Buscar conjunto por nombre o danza…" value={catalogSearch} onChange={(e) => setCatalogSearch(e.target.value)} />
                  {filteredConjuntos.length > 0 && (
                    <div className="absolute left-0 right-0 top-full mt-1 bg-background border border-border rounded-xl shadow-xl z-10 max-h-48 overflow-y-auto">
                      {filteredConjuntos.map((c) => (
                        <button key={c.id} onClick={() => addPrendaFromCatalog(c)} className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-muted text-left transition-colors">
                          <div>
                            <p className="text-sm font-medium">{c.nombre}</p>
                            <p className="text-xs text-muted-foreground">{c.danza}</p>
                          </div>
                          <span className="text-xs text-coca font-semibold shrink-0 ml-2">{formatBs(c.precio_base)}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold">Prendas del contrato</p>
                  <p className="text-xs text-muted-foreground">Cantidad y costo por prenda</p>
                </div>
                <button onClick={addPrenda} className="flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  Agregar prenda libre
                </button>
              </div>

              {activePrendas.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <p className="text-sm text-muted-foreground">Sin prendas aún</p>
                  <p className="text-xs text-muted-foreground mt-1">Busca en el catálogo o agrega una prenda libre</p>
                </div>
              ) : (
                <div className="rounded-2xl border border-border overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-2.5">Modelo / Variación</th>
                        <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2.5 w-24">Cantidad</th>
                        <th className="text-center text-xs font-semibold text-muted-foreground px-3 py-2.5 w-28">Bs./u.</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-2.5 w-28">Subtotal</th>
                        <th className="w-10" />
                      </tr>
                    </thead>
                    <tbody>
                      {prendas.filter((p) => !p.deleted).map((p) => {
                        const subP = p.cantidad * parseFloat(p.costoUnitario || "0");
                        return (
                          <tr key={p._key} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                            <td className="px-4 py-2.5">
                              <div className="space-y-1.5">
                                <input
                                  className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary/40"
                                  value={p.modelo}
                                  onChange={(e) => updPrenda(p._key, "modelo", e.target.value)}
                                  placeholder="Caporales, Morenada…"
                                />
                                {p.conjuntoId && (() => {
                                  const variaciones: VariacionOption[] = conjuntos.find((c) => c.id === p.conjuntoId)?.variaciones ?? [];
                                  if (variaciones.length === 0) return <span className="text-[10px] text-primary/60 font-medium">Del catálogo</span>;
                                  return (
                                    <select
                                      className="w-full rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary/40"
                                      value={p.variacionId ?? ""}
                                      onChange={(e) => {
                                        const vid = e.target.value ? parseInt(e.target.value) : undefined;
                                        const variac = variaciones.find((v) => v.id === vid);
                                        updPrenda(p._key, "variacionId", vid);
                                        if (variac?.precio_alquiler) updPrenda(p._key, "costoUnitario", variac.precio_alquiler);
                                        if (vid) void fetchStock(vid);
                                      }}
                                    >
                                      <option value="">— Seleccionar variación —</option>
                                      {variaciones.map((v) => (
                                        <option key={v.id} value={v.id}>
                                          {v.nombre_variacion}{v.talla ? ` · T.${v.talla}` : ""}{v.color ? ` · ${v.color}` : ""}
                                        </option>
                                      ))}
                                    </select>
                                  );
                                })()}
                                {p.variacionId && stockCache[p.variacionId] !== undefined && (
                                  <span className={`text-[10px] font-semibold ${
                                    p.cantidad <= stockCache[p.variacionId]
                                      ? "text-emerald-600"
                                      : "text-crimson"
                                  }`}>
                                    {p.cantidad <= stockCache[p.variacionId]
                                      ? `${stockCache[p.variacionId]} disponibles`
                                      : `⚠ Solo ${stockCache[p.variacionId]} disp. (pediste ${p.cantidad})`}
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number" min="0"
                                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-center font-semibold focus:outline-none focus:ring-1 focus:ring-primary/40"
                                value={p.cantidad}
                                onChange={(e) => updPrenda(p._key, "cantidad", Math.max(0, parseInt(e.target.value) || 0))}
                              />
                            </td>
                            <td className="px-3 py-2.5">
                              <input
                                type="number" min="0" step="0.5"
                                className="w-full rounded-lg border border-border bg-background px-2 py-1.5 text-sm text-center focus:outline-none focus:ring-1 focus:ring-primary/40"
                                value={p.costoUnitario}
                                onChange={(e) => updPrenda(p._key, "costoUnitario", e.target.value)}
                              />
                            </td>
                            <td className="px-4 py-2.5 text-right text-sm font-bold text-coca">
                              {formatBs(subP)}
                            </td>
                            <td className="px-2 py-2.5">
                              <button onClick={() => delPrenda(p._key)} className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-crimson/10 text-muted-foreground hover:text-crimson transition-colors">
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                    <tfoot>
                      <tr className="border-t-2 border-border bg-muted/20">
                        <td colSpan={3} className="px-4 py-2.5 text-xs font-semibold text-muted-foreground text-right">
                          {activePrendas.reduce((s, p) => s + p.cantidad, 0)} prendas en total
                        </td>
                        <td className="px-4 py-2.5 text-right text-base font-bold text-primary">{formatBs(totalPrendas)}</td>
                        <td />
                      </tr>
                    </tfoot>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* ── PERSONAS ── */}
          {activeTab === "personas" && (
            <div className="px-6 py-5 space-y-6">

              {/* Section A: Participantes */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold">Participantes</p>
                    <p className="text-xs text-muted-foreground">Personas que usan las prendas del contrato</p>
                  </div>
                  {isEdit && (
                    <button onClick={() => setShowAddParticipante((v) => !v)} className="flex items-center gap-1.5 text-xs font-semibold text-primary px-3 py-1.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                      Agregar participante
                    </button>
                  )}
                </div>

                {/* Add participant form */}
                {isEdit && showAddParticipante && (
                  <div className="rounded-xl border border-primary/30 bg-primary/5 p-4 space-y-3">
                    <p className="text-xs font-semibold text-primary uppercase tracking-wide">Nuevo participante</p>

                    {/* Nombre + CI + Celular */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Nombre <span className="text-crimson">*</span></label>
                        <input className={inp} value={newP.nombre} onChange={(e) => setNewP((p) => ({ ...p, nombre: e.target.value }))} placeholder="Nombre completo" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">CI</label>
                        <input className={inp} value={newP.ci} onChange={(e) => setNewP((p) => ({ ...p, ci: e.target.value }))} placeholder="12345678" />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Celular</label>
                        <input type="tel" className={inp} value={newP.celular} onChange={(e) => setNewP((p) => ({ ...p, celular: e.target.value }))} placeholder="70000000" />
                      </div>
                    </div>

                    {/* Tipo — solo Hombre / Mujer / Otro */}
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Tipo</label>
                      <div className="flex gap-2">
                        {([
                          { value: "HOMBRE", label: "Hombre" },
                          { value: "CHOLITA", label: "Mujer" },
                          { value: "OTRO",   label: "Otro"  },
                        ] as { value: TipoParticipante; label: string }[]).map((t) => (
                          <button key={t.value} onClick={() => setNewP((p) => ({ ...p, tipo: t.value }))}
                            className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition-all ${newP.tipo === t.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:bg-muted"}`}>
                            {t.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Prenda asignada — muestra variación */}
                    {prendaOptions.length > 0 && (
                      <div className="space-y-1">
                        <label className="text-xs text-muted-foreground">Prenda / Variación asignada</label>
                        <select className={`${inp} cursor-pointer`} value={newP.prendaId} onChange={(e) => { setNewP((p) => ({ ...p, prendaId: e.target.value, instanciaConjuntoId: "" })); }}>
                          <option value="">Sin prenda específica</option>
                          {prendaOptions.map((pr) => {
                            const varLabel = pr.variacion
                              ? ` — ${pr.variacion.nombre_variacion}${pr.variacion.talla ? " T." + pr.variacion.talla : ""}${pr.variacion.color ? " / " + pr.variacion.color : ""}`
                              : "";
                            return <option key={pr.id} value={pr.id}>{pr.modelo}{varLabel}</option>;
                          })}
                        </select>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button onClick={() => { setShowAddParticipante(false); setNewP({ nombre: "", ci: "", celular: "", tipo: "HOMBRE", prendaId: "", instanciaConjuntoId: "" }); }} className="flex-1 text-xs py-1.5 rounded-lg border border-border hover:bg-muted transition-colors">Cancelar</button>
                      <button onClick={handleAddParticipante} disabled={addingP || !newP.nombre.trim()} className="flex-1 text-xs py-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50">
                        {addingP ? "Agregando…" : "Agregar"}
                      </button>
                    </div>
                  </div>
                )}

                {!isEdit && (
                  <div className="rounded-xl bg-muted/30 border border-border px-4 py-3 text-sm text-muted-foreground text-center">
                    Guarda el contrato primero para agregar participantes con devolución individual.
                  </div>
                )}

                {isEdit && liveParticipantes.length === 0 && !showAddParticipante && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <p className="text-sm text-muted-foreground">Sin participantes registrados</p>
                    <button onClick={() => setShowAddParticipante(true)} className="mt-1 text-xs text-primary hover:underline">Agregar →</button>
                  </div>
                )}

                {isEdit && liveParticipantes.length > 0 && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-xs text-muted-foreground px-1">
                      <span>{liveParticipantes.filter((p) => p.devuelto).length} / {liveParticipantes.length} devolvieron</span>
                      <div className="flex-1 bg-muted rounded-full h-1.5 overflow-hidden">
                        <div className="bg-emerald-500 h-full transition-all" style={{ width: `${liveParticipantes.length > 0 ? (liveParticipantes.filter((p) => p.devuelto).length / liveParticipantes.length) * 100 : 0}%` }} />
                      </div>
                    </div>
                    {liveParticipantes.map((p) => (
                      <ParticipanteCard
                        key={p.id} p={p} prendas={prendaOptions}
                        contratoId={fullContrato?.id ?? contrato!.id}
                        token={token} backendUrl={backendUrl}
                        onUpdated={(updated) => { setLiveParticipantes((prev) => prev.map((x) => x.id === updated.id ? { ...x, ...updated } : x)); refreshHistorial(); }}
                        onDeleted={(id) => { setLiveParticipantes((prev) => prev.filter((x) => x.id !== id)); refreshHistorial(); }}
                        onGarantiaAdded={(g, pid) => { setLiveParticipantes((prev) => prev.map((x) => x.id === pid ? { ...x, garantias: [...(x.garantias ?? []), g] } : x)); refreshHistorial(); }}
                        onGarantiaRemoved={(gid, pid) => { setLiveParticipantes((prev) => prev.map((x) => x.id === pid ? { ...x, garantias: x.garantias?.filter((g) => g.id !== gid) } : x)); refreshHistorial(); }}
                      />
                    ))}
                  </div>
                )}
              </div>

              {/* Divider */}
              <div className="border-t border-border" />

              {/* Section B: Garantías */}
              <div className="space-y-3">
                <div>
                  <p className="text-sm font-semibold">Garantías del contrato</p>
                  <p className="text-xs text-muted-foreground">Documentos o valores dejados como garantía general</p>
                </div>

                <div className="space-y-2">
                  {/* ── Efectivo ────────────────────────────────────────────── */}
                  {(() => {
                    const liveEfectivo = isEdit ? liveGarantias.find((g) => g.tipo === "EFECTIVO") : undefined;
                    const checked = isEdit ? (!!liveEfectivo || gEfectivo) : gEfectivo;
                    return (
                      <div className={`rounded-xl border p-3 space-y-2.5 transition-colors ${checked ? "border-amber-300 bg-amber-50/40 dark:bg-amber-900/10" : "border-border"}`}>
                        <label className="flex items-center gap-3 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-amber-500 cursor-pointer"
                            checked={checked}
                            disabled={savingGarantia}
                            onChange={async (e) => {
                              if (isEdit) {
                                if (!e.target.checked && liveEfectivo) {
                                  await toggleContractGarantia("EFECTIVO");
                                } else if (e.target.checked && !liveEfectivo) {
                                  setGEfectivo(true);
                                } else if (!e.target.checked) {
                                  setGEfectivo(false);
                                  setGEfectivoMonto("");
                                }
                              } else {
                                setGEfectivo(e.target.checked);
                                if (!e.target.checked) { setGEfectivoMonto(""); setGEfectivoFormaPago("EFECTIVO"); }
                              }
                            }}
                          />
                          <span className="text-sm font-medium">Efectivo</span>
                          {liveEfectivo?.valor && (
                            <span className="ml-auto text-sm font-bold text-coca">{formatBs(liveEfectivo.valor)}</span>
                          )}
                        </label>

                        {checked && (
                          <div className="pl-7 space-y-2">
                            <div className="grid grid-cols-2 gap-2">
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Monto (Bs.)</label>
                                <input
                                  type="number" min="0"
                                  className={`${inp} text-sm w-full`}
                                  placeholder="0"
                                  value={liveEfectivo?.valor ? String(parseFloat(String(liveEfectivo.valor))) : gEfectivoMonto}
                                  readOnly={!!liveEfectivo}
                                  onChange={(e) => setGEfectivoMonto(e.target.value)}
                                />
                              </div>
                              <div className="space-y-1">
                                <label className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Tipo de pago</label>
                                <select
                                  className={`${inp} text-sm cursor-pointer w-full`}
                                  value={liveEfectivo?.descripcion ?? gEfectivoFormaPago}
                                  disabled={!!liveEfectivo}
                                  onChange={(e) => setGEfectivoFormaPago(e.target.value as FormaPago)}
                                >
                                  <option value="">— Seleccionar —</option>
                                  {FORMA_PAGO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                              </div>
                            </div>
                            {isEdit && !liveEfectivo && (
                              <button
                                onClick={async () => {
                                  await toggleContractGarantia("EFECTIVO", {
                                    valor: gEfectivoMonto ? parseFloat(gEfectivoMonto) : undefined,
                                    descripcion: gEfectivoFormaPago || undefined,
                                  });
                                  setGEfectivo(false);
                                  setGEfectivoMonto("");
                                  setGEfectivoFormaPago("EFECTIVO");
                                }}
                                disabled={savingGarantia || !gEfectivoMonto}
                                className="w-full py-1.5 rounded-xl bg-amber-500/20 text-amber-700 text-xs font-bold hover:bg-amber-500/30 transition-colors disabled:opacity-50"
                              >
                                {savingGarantia ? "Guardando…" : "Guardar garantía"}
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* ── Documento / Carnet ──────────────────────────────────── */}
                  {(() => {
                    const checked = isEdit ? liveGarantias.some((g) => g.tipo === "DOCUMENTO_CARNET") : gCarnet;
                    return (
                      <label className={`flex items-center gap-3 cursor-pointer select-none rounded-xl border p-3 transition-colors ${checked ? "border-amber-300 bg-amber-50/40 dark:bg-amber-900/10" : "border-border hover:bg-muted/30"}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                          checked={checked}
                          disabled={savingGarantia}
                          onChange={async () => {
                            if (isEdit) await toggleContractGarantia("DOCUMENTO_CARNET");
                            else setGCarnet((v) => !v);
                          }}
                        />
                        <span className="text-sm font-medium">Documento / Carnet</span>
                      </label>
                    );
                  })()}

                  {/* ── Carta institucional ─────────────────────────────────── */}
                  {(() => {
                    const checked = isEdit ? liveGarantias.some((g) => g.tipo === "CARTA_INSTITUCIONAL") : gCarta;
                    return (
                      <label className={`flex items-center gap-3 cursor-pointer select-none rounded-xl border p-3 transition-colors ${checked ? "border-amber-300 bg-amber-50/40 dark:bg-amber-900/10" : "border-border hover:bg-muted/30"}`}>
                        <input
                          type="checkbox"
                          className="w-4 h-4 accent-amber-500 cursor-pointer"
                          checked={checked}
                          disabled={savingGarantia}
                          onChange={async () => {
                            if (isEdit) await toggleContractGarantia("CARTA_INSTITUCIONAL");
                            else setGCarta((v) => !v);
                          }}
                        />
                        <span className="text-sm font-medium">Carta institucional</span>
                      </label>
                    );
                  })()}
                </div>
              </div>
            </div>
          )}

          {/* ── FINANZAS ── */}
          {activeTab === "finanzas" && (
            <div className="px-6 py-5 space-y-5">

              {/* Total */}
              <div className="rounded-xl border border-border p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Total del contrato</p>
                  <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer select-none">
                    <input type="checkbox" className="rounded" checked={overrideEnabled} onChange={(e) => setOverrideEnabled(e.target.checked)} />Ajuste manual
                  </label>
                </div>
                <div className="flex items-center gap-6">
                  <div>
                    <p className="text-xs text-muted-foreground mb-0.5">Calculado de prendas</p>
                    <p className="text-2xl font-bold text-primary" style={{ fontFamily: "var(--font-outfit)" }}>{formatBs(totalPrendas)}</p>
                  </div>
                  {overrideEnabled && (
                    <div className="flex-1 space-y-1"><label className="text-xs text-muted-foreground">Total ajustado (Bs.)</label><input type="number" min="0" className={inp} value={totalOverride} onChange={(e) => setTotalOverride(e.target.value)} /></div>
                  )}
                </div>
                {overrideEnabled && <p className="text-sm text-muted-foreground">Total final: <span className="font-bold text-foreground">{formatBs(totalFinal)}</span></p>}
              </div>

              {/* Anticipo acordado — solo para contratos de RESERVA */}
              {tipo === "RESERVA" && (
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Anticipo acordado (Bs.)</label>
                  <input type="number" min="0" className={inp} value={anticipo} onChange={(e) => setAnticipo(e.target.value)}
                    placeholder="Monto de anticipo pactado en el contrato" />
                  <p className="text-[10px] text-muted-foreground">Monto acordado contractualmente. Los pagos reales se registran en caja.</p>
                </div>
              )}

              {/* Resumen financiero (read-only) */}
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Resumen financiero</p>
                </div>
                <div className="divide-y divide-border/30">
                  <div className="flex items-center justify-between px-4 py-2.5">
                    <span className="text-xs text-muted-foreground">Total del contrato</span>
                    <span className="text-sm font-bold text-foreground">{formatBs(totalFinal)}</span>
                  </div>
                  {tipo === "RESERVA" && (
                    <div className="flex items-center justify-between px-4 py-2.5">
                      <span className="text-xs text-muted-foreground">Anticipo acordado</span>
                      <span className="text-sm text-muted-foreground">{formatBs(parseFloat(anticipo || "0"))}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between px-4 py-2.5 bg-emerald-500/5">
                    <span className="text-xs font-semibold text-emerald-700">Cobrado en caja</span>
                    <span className="text-sm font-bold text-emerald-600">{formatBs(parseFloat(totalPagado || "0"))}</span>
                  </div>
                  {deuda > 0.01 ? (
                    <div className="flex items-center justify-between px-4 py-2.5 bg-crimson/5">
                      <span className="text-xs font-semibold text-crimson">Pendiente</span>
                      <span className="text-base font-bold text-crimson">{formatBs(deuda)}</span>
                    </div>
                  ) : parseFloat(totalPagado || "0") > 0 ? (
                    <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5">
                      <svg className="h-3.5 w-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      <span className="text-xs font-semibold text-emerald-600">Pagado completo</span>
                    </div>
                  ) : null}
                </div>
              </div>

              {/* ── Pagos registrados en caja ── */}
              {isEdit && (
                <div className="rounded-xl border border-border overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-3 py-2 bg-muted/40 border-b border-border/50">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Pagos en caja</p>
                    <button
                      onClick={() => { setShowPagoForm((v) => !v); if (!showPagoForm) { const esDeudeaCobrada = currentContrato && ["DEVUELTO", "CON_DEUDA"].includes(currentContrato.estado); setPagoConcepto(esDeudeaCobrada ? "DEUDA_COBRADA" : "PAGO_SALDO_CONTRATO"); } }}
                      className="text-[11px] font-semibold text-primary hover:text-primary/80 transition-colors"
                    >
                      {showPagoForm ? "Cancelar" : "+ Registrar pago"}
                    </button>
                  </div>

                  {/* Inline pago form */}
                  {showPagoForm && (
                    <div className="px-3 py-3 border-b border-border/50 space-y-3 bg-emerald-500/5">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Concepto</label>
                          <select
                            value={pagoConcepto}
                            onChange={(e) => setPagoConcepto(e.target.value as typeof pagoConcepto)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30"
                          >
                            <option value="ANTICIPO_CONTRATO">Anticipo</option>
                            <option value="PAGO_SALDO_CONTRATO">Pago de saldo</option>
                            <option value="DEUDA_COBRADA">Deuda cobrada</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Monto (Bs.)</label>
                          <input
                            type="number" min="0" step="0.01" placeholder="0.00"
                            value={pagoMonto} onChange={(e) => setPagoMonto(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 text-right"
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Forma de pago</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {(["EFECTIVO", "QR", "TRANSFERENCIA", "TARJETA"] as FormaPago[]).map((fp) => (
                            <button key={fp} onClick={() => setPagoFormaPago(fp)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${pagoFormaPago === fp ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"}`}>
                              {fp === "EFECTIVO" ? "Efectivo" : fp === "QR" ? "QR" : fp === "TRANSFERENCIA" ? "Transfer." : "Tarjeta"}
                            </button>
                          ))}
                        </div>
                      </div>
                      {(pagoFormaPago === "TRANSFERENCIA" || pagoFormaPago === "QR") && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Referencia</label>
                          <input type="text" placeholder="Nº de referencia" value={pagoReferencia} onChange={(e) => setPagoReferencia(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                      )}
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Descripción <span className="font-normal">(opcional)</span></label>
                        <input type="text" placeholder="Notas…" value={pagoDescripcion} onChange={(e) => setPagoDescripcion(e.target.value)}
                          className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      </div>
                      <button
                        onClick={handleRegistrarPago}
                        disabled={savingPago || !pagoMonto || parseFloat(pagoMonto) <= 0}
                        className="w-full py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-colors disabled:opacity-50"
                      >
                        {savingPago ? "Registrando…" : `Registrar Bs. ${parseFloat(pagoMonto || "0").toFixed(2)} en caja →`}
                      </button>
                    </div>
                  )}

                  {/* Payment list */}
                  {liveMovimientos.length === 0 && !showPagoForm ? (
                    <div className="px-3 py-4 text-center text-xs text-muted-foreground">Sin pagos registrados en caja aún.</div>
                  ) : (
                    <div className="divide-y divide-border/50">
                      {liveMovimientos.map((m) => (
                        <div key={m.id} className="flex items-center gap-2 px-3 py-2">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${m.tipo === "INGRESO" ? "bg-emerald-500/10 text-emerald-600" : "bg-crimson/10 text-crimson"}`}>
                            {m.tipo === "INGRESO" ? "↑" : "↓"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-xs font-medium text-foreground">{
                              m.concepto === "ANTICIPO_CONTRATO" ? "Anticipo" :
                              m.concepto === "PAGO_SALDO_CONTRATO" ? "Saldo" :
                              m.concepto === "DEUDA_COBRADA" ? "Deuda cobrada" :
                              m.concepto === "DEVOLUCION_GARANTIA" ? "Dev. garantía" :
                              m.concepto
                            }</span>
                            <span className="text-[10px] text-muted-foreground ml-1.5">{m.forma_pago}</span>
                            {m.referencia && <span className="text-[10px] text-muted-foreground ml-1">· {m.referencia}</span>}
                            {m.descripcion && <p className="text-[10px] text-muted-foreground truncate">{m.descripcion}</p>}
                          </div>
                          <div className="text-right shrink-0">
                            <p className={`text-xs font-bold ${m.tipo === "INGRESO" ? "text-emerald-600" : "text-crimson"}`}>
                              {m.tipo === "INGRESO" ? "+" : "−"}Bs. {parseFloat(m.monto).toFixed(2)}
                            </p>
                            <p className="text-[9px] text-muted-foreground">
                              {new Date(m.createdAt).toLocaleDateString("es-BO", { day: "2-digit", month: "short" })}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Total */}
                  {liveMovimientos.length > 0 && (
                    <div className="px-3 py-2 bg-muted/30 border-t border-border/50 flex justify-between items-center">
                      <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wide">Total registrado en caja</span>
                      <span className="text-sm font-bold text-emerald-600">
                        Bs. {liveMovimientos.filter(m => m.tipo === "INGRESO").reduce((s, m) => s + parseFloat(m.monto), 0).toFixed(2)}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* Forma de pago + Estado */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forma de pago</label>
                  <select className={`${inp} cursor-pointer`} value={formaPago} onChange={(e) => setFormaPago(e.target.value as FormaPago | "")}>
                    <option value="">Sin especificar</option>
                    {FORMA_PAGO_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                  </select>
                </div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</label>
                  <select className={`${inp} cursor-pointer`} value={estado} onChange={(e) => setEstado(e.target.value as EstadoContrato)}>
                    {(Object.keys(ESTADO_CONTRATO_MAP) as EstadoContrato[]).map((s) => <option key={s} value={s}>{ESTADO_CONTRATO_MAP[s].label}</option>)}
                  </select>
                </div>
              </div>

              {/* Lifecycle actions (edit only) */}
              {isEdit && currentContrato && (
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Acciones de ciclo de vida</p>
                  <div className="flex flex-wrap gap-2">
                    {currentContrato.estado === "RESERVADO" && <button onClick={() => lifecycleAction("confirmar")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-coca/10 text-coca font-semibold hover:bg-coca/20 transition-colors disabled:opacity-50">Confirmar reserva</button>}
                    {["RESERVADO", "CONFIRMADO"].includes(currentContrato.estado) && <button onClick={() => lifecycleAction("entregar")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50">Marcar entregado</button>}
                    {currentContrato.estado === "ENTREGADO" && <button onClick={() => lifecycleAction("iniciar")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-gold/10 text-amber-700 font-semibold hover:bg-gold/20 transition-colors disabled:opacity-50">Pasar a en uso</button>}
                    {["EN_USO", "ENTREGADO"].includes(currentContrato.estado) && (
                      <button onClick={() => lifecycleAction("devolver")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50">Registrar devolución</button>
                    )}
                    {currentContrato.estado === "DEVUELTO" && <button onClick={() => lifecycleAction("cerrar")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-gray-500/10 text-gray-600 font-semibold hover:bg-gray-500/20 transition-colors disabled:opacity-50">Cerrar contrato</button>}
                    {["DEVUELTO", "CON_DEUDA"].includes(currentContrato.estado) && (
                      <button onClick={() => setShowRetener((v) => !v)} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-orange-500/10 text-orange-600 font-semibold hover:bg-orange-500/20 transition-colors disabled:opacity-50">Retener garantía</button>
                    )}
                    {!["CERRADO", "CANCELADO"].includes(currentContrato.estado) && (
                      <button onClick={() => lifecycleAction("cancelar")} disabled={saving} className="text-xs px-3 py-1.5 rounded-xl bg-crimson/10 text-crimson font-semibold hover:bg-crimson/20 transition-colors disabled:opacity-50">Cancelar contrato</button>
                    )}
                    {/* Devolver garantía (efectivo) — egreso en caja */}
                    {!["CANCELADO"].includes(currentContrato.estado) && (
                      <button
                        onClick={() => { setShowEgresoForm((v) => !v); setShowRetener(false); }}
                        disabled={saving}
                        className="text-xs px-3 py-1.5 rounded-xl bg-blue-500/10 text-blue-600 font-semibold hover:bg-blue-500/20 transition-colors disabled:opacity-50"
                      >
                        Devolver garantía (efectivo)
                      </button>
                    )}
                  </div>

                  {/* Retener garantía inline form */}
                  {showRetener && (
                    <div className="flex gap-2">
                      <input className={`${inp} flex-1`} placeholder="Motivo de retención…" value={retenerMotivo} onChange={(e) => setRetenerMotivo(e.target.value)} />
                      <button onClick={() => { if (retenerMotivo.trim()) { lifecycleAction("retener", { motivo: retenerMotivo }); setShowRetener(false); } }} disabled={saving || !retenerMotivo.trim()} className="px-3 py-2 rounded-xl bg-orange-500 text-white text-xs font-semibold hover:bg-orange-600 transition-colors disabled:opacity-50">Confirmar</button>
                    </div>
                  )}

                  {/* Devolver garantía inline form */}
                  {showEgresoForm && (
                    <div className="rounded-xl border border-blue-300/40 bg-blue-500/5 p-3 space-y-3">
                      <p className="text-xs font-semibold text-blue-600">Registrar devolución de garantía en efectivo</p>
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Concepto</label>
                          <select value={egresoConcepto} onChange={(e) => setEgresoConcepto(e.target.value as typeof egresoConcepto)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30">
                            <option value="DEVOLUCION_GARANTIA">Dev. garantía</option>
                            <option value="OTRO_EGRESO">Otro egreso</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Monto (Bs.)</label>
                          <input type="number" min="0" step="0.01" placeholder="0.00" value={egresoMonto} onChange={(e) => setEgresoMonto(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs font-bold focus:outline-none focus:ring-2 focus:ring-primary/30 text-right" />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Forma de entrega</label>
                        <div className="flex gap-1.5 flex-wrap">
                          {(["EFECTIVO", "QR", "TRANSFERENCIA"] as FormaPago[]).map((fp) => (
                            <button key={fp} onClick={() => setEgresoFormaPago(fp)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-semibold border transition-all ${egresoFormaPago === fp ? "bg-blue-600 text-white border-blue-600" : "bg-background border-border hover:bg-muted"}`}>
                              {fp === "EFECTIVO" ? "Efectivo" : fp === "QR" ? "QR" : "Transfer."}
                            </button>
                          ))}
                        </div>
                      </div>
                      <input type="text" placeholder="Descripción (opcional)…" value={egresoDescripcion} onChange={(e) => setEgresoDescripcion(e.target.value)}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
                      <div className="flex gap-2">
                        <button onClick={() => setShowEgresoForm(false)} className="flex-1 py-1.5 rounded-lg border border-border text-xs font-semibold hover:bg-muted transition-colors">Cancelar</button>
                        <button onClick={handleRegistrarEgreso} disabled={savingEgreso || !egresoMonto || parseFloat(egresoMonto) <= 0}
                          className="flex-1 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors disabled:opacity-50">
                          {savingEgreso ? "Registrando…" : `Registrar −Bs. ${parseFloat(egresoMonto || "0").toFixed(2)} →`}
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Observaciones + Condiciones */}
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observaciones</label><textarea className={`${inp} resize-none`} rows={3} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Notas adicionales del contrato…" /></div>
                <div className="space-y-1.5"><label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Condiciones</label><textarea className={`${inp} resize-none`} rows={3} value={condiciones} onChange={(e) => setCondiciones(e.target.value)} placeholder="Condiciones del alquiler…" /></div>
              </div>
            </div>
          )}

          {/* ── HISTORIAL ── */}
          {activeTab === "historial" && (
            <div className="px-6 py-5">
              {!isEdit ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <p className="text-sm text-muted-foreground">El historial estará disponible después de crear el contrato.</p>
                </div>
              ) : liveHistorial.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                    <svg className="h-6 w-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  </div>
                  <p className="text-sm text-muted-foreground">Sin eventos registrados aún.</p>
                  <p className="text-xs text-muted-foreground mt-1">Las acciones futuras (confirmar, entregar, agregar personas…) aparecerán aquí.</p>
                </div>
              ) : (
                <div className="relative">
                  {/* vertical line */}
                  <div className="absolute left-[18px] top-2 bottom-2 w-px bg-border" />
                  <ul className="space-y-0">
                    {liveHistorial.map((h, i) => {
                      const { icon, color, bg } = HISTORIAL_STYLE[h.tipo] ?? HISTORIAL_STYLE._DEFAULT;
                      return (
                        <li key={h.id} className={`relative flex gap-4 ${i !== liveHistorial.length - 1 ? "pb-5" : ""}`}>
                          {/* dot */}
                          <div className={`relative z-10 flex-none w-9 h-9 rounded-full ${bg} flex items-center justify-center text-base shrink-0`}>
                            {icon}
                          </div>
                          <div className="flex-1 min-w-0 pt-1.5">
                            <p className={`text-xs font-bold uppercase tracking-wide ${color}`}>{HISTORIAL_LABEL[h.tipo] ?? h.tipo}</p>
                            {h.descripcion && <p className="text-sm text-foreground mt-0.5">{h.descripcion}</p>}
                            <p className="text-xs text-muted-foreground mt-1">{new Date(h.createdAt).toLocaleString("es-BO", { dateStyle: "medium", timeStyle: "short" })}</p>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex items-center gap-2 shrink-0">
          {tabIdx > 0 && (
            <button onClick={() => setActiveTab(TABS[tabIdx - 1].key)} className="px-4 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:bg-muted transition-colors">← Anterior</button>
          )}
          {isEdit && onDeleted && (
            <button
              onClick={() => setShowConfirmDelete(true)}
              disabled={saving || deleting}
              className="px-3 py-2 rounded-xl text-xs font-semibold text-crimson hover:bg-crimson/10 border border-crimson/20 transition-colors disabled:opacity-50"
            >
              Eliminar
            </button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={onClose} disabled={saving || deleting}>Cancelar</Button>
          {activeTab === "historial" ? null : activeTab !== "finanzas" ? (
            <Button className="bg-primary text-primary-foreground" onClick={() => setActiveTab(TABS[tabIdx + 1].key)}>Siguiente →</Button>
          ) : (
            <Button className="bg-primary text-primary-foreground min-w-[130px]" onClick={handleSubmit} disabled={saving || deleting}>
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear contrato"}
            </Button>
          )}
        </div>

        {/* Confirm Delete overlay */}
        {showConfirmDelete && (
          <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 backdrop-blur-sm rounded-2xl">
            <div className="bg-background border border-border rounded-2xl p-6 mx-4 w-full max-w-xs shadow-2xl space-y-4">
              <div className="text-center">
                <div className="w-12 h-12 rounded-2xl bg-crimson/10 flex items-center justify-center mx-auto mb-3">
                  <svg className="h-6 w-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                </div>
                <h3 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>¿Eliminar contrato?</h3>
                <p className="text-xs text-muted-foreground mt-1">Esta acción no se puede deshacer. Se liberarán todas las instancias asignadas.</p>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setShowConfirmDelete(false)} disabled={deleting} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Cancelar</button>
                <button onClick={handleDelete} disabled={deleting} className="flex-1 py-2 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson/90 transition-colors disabled:opacity-50">{deleting ? "Eliminando…" : "Eliminar"}</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
