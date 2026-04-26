"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface ComponenteCount {
  conjuntos: number;
  instancias: number;
}

interface ConjuntoUso {
  id: number;
  nombre: string;
  danza: string;
}

interface ConjuntoComponente {
  conjunto: ConjuntoUso;
}

interface Componente {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
  createdAt: string;
  _count: ComponenteCount;
  conjuntos?: ConjuntoComponente[];
}

interface Props {
  initialComponentes: Componente[];
  token: string;
  backendUrl: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const TIPO_COLORS: Record<string, { bg: string; text: string; chip: string }> = {
  BLUSA:     { bg: "bg-crimson/10",     text: "text-crimson",     chip: "bg-crimson/10 text-crimson border-crimson/20" },
  POLLERA:   { bg: "bg-purple-500/10",  text: "text-purple-600",  chip: "bg-purple-500/10 text-purple-600 border-purple-300/40" },
  SOMBRERO:  { bg: "bg-gold/10",        text: "text-amber-700",   chip: "bg-gold/10 text-amber-700 border-amber-300/40" },
  BOTAS:     { bg: "bg-orange-500/10",  text: "text-orange-600",  chip: "bg-orange-500/10 text-orange-600 border-orange-300/40" },
  MASCARA:   { bg: "bg-red-800/10",     text: "text-red-800",     chip: "bg-red-800/10 text-red-800 border-red-300/40" },
  CHAQUETA:  { bg: "bg-blue-500/10",    text: "text-blue-600",    chip: "bg-blue-500/10 text-blue-600 border-blue-300/40" },
  PANTALON:  { bg: "bg-gray-500/10",    text: "text-gray-600",    chip: "bg-gray-500/10 text-gray-600 border-gray-300/40" },
  ACCESORIO: { bg: "bg-coca/10",        text: "text-coca",        chip: "bg-coca/10 text-coca border-coca/20" },
  FAJA:      { bg: "bg-indigo-500/10",  text: "text-indigo-600",  chip: "bg-indigo-500/10 text-indigo-600 border-indigo-300/40" },
  CHALINA:   { bg: "bg-teal-500/10",    text: "text-teal-600",    chip: "bg-teal-500/10 text-teal-600 border-teal-300/40" },
  CAPA:      { bg: "bg-emerald-500/10", text: "text-emerald-600", chip: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40" },
};

const TIPO_OPTIONS = [
  "BLUSA", "POLLERA", "SOMBRERO", "BOTAS", "MASCARA",
  "CHAQUETA", "PANTALON", "FAJA", "CHALINA", "CAPA", "ACCESORIO",
];

const TIPO_LABEL: Record<string, string> = {
  BLUSA: "Blusa", POLLERA: "Pollera", SOMBRERO: "Sombrero", BOTAS: "Botas",
  MASCARA: "Máscara", CHAQUETA: "Chaqueta", PANTALON: "Pantalón",
  FAJA: "Faja", CHALINA: "Chalina", CAPA: "Capa", ACCESORIO: "Accesorio",
};

function getTipoColor(tipo: string) {
  return TIPO_COLORS[tipo.toUpperCase()] ?? {
    bg: "bg-gray-100",
    text: "text-gray-700",
    chip: "bg-gray-100 text-gray-700 border-gray-300",
  };
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ componentes }: { componentes: Componente[] }) {
  const totalComponentes = componentes.length;
  const tiposUnicos = new Set(componentes.map((c) => c.tipo)).size;
  const totalEnConjuntos = componentes.reduce((s, c) => s + c._count.conjuntos, 0);
  const totalInstancias = componentes.reduce((s, c) => s + c._count.instancias, 0);

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Componentes",      value: totalComponentes,  num: "text-gray-800",    bg: "bg-white",        border: "border-gray-200" },
        { label: "Tipos distintos",  value: tiposUnicos,       num: "text-primary",     bg: "bg-primary/5",    border: "border-primary/20" },
        { label: "Usos en conjuntos",value: totalEnConjuntos,  num: "text-coca",        bg: "bg-emerald-50",   border: "border-emerald-200" },
        { label: "Instancias físicas",value: totalInstancias,  num: "text-yellow-700",  bg: "bg-amber-50",     border: "border-amber-200" },
      ].map((s) => (
        <div key={s.label} className={`${s.bg} rounded-2xl border-2 ${s.border} px-4 py-3 shadow-sm`}>
          <p className={`text-3xl font-bold ${s.num}`} style={{ fontFamily: "var(--font-outfit)" }}>
            {s.value}
          </p>
          <p className="text-xs text-gray-600 font-medium mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Componente Card (Grid) ─────────────────────────────────────────────────────

function ComponenteCard({
  componente,
  onEdit,
  onDelete,
  onDetalle,
}: {
  componente: Componente;
  onEdit: (c: Componente) => void;
  onDelete: (c: Componente) => void;
  onDetalle: (c: Componente) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const colors = getTipoColor(componente.tipo);

  return (
    <div className="group relative rounded-2xl border-2 border-gray-200 bg-white overflow-hidden hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 shadow-sm">
      {/* Type banner */}
      <div className={`${colors.bg} px-4 py-3 flex items-center justify-between border-b border-black/5`}>
        <span className={`text-sm font-extrabold uppercase tracking-wider ${colors.text}`}>
          {TIPO_LABEL[componente.tipo.toUpperCase()] ?? componente.tipo}
        </span>
        {/* 3-dot menu */}
        <div className="relative shrink-0">
          <button
            onClick={() => setMenuOpen((v) => !v)}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-black/10 transition-colors"
          >
            <svg className={`h-3.5 w-3.5 ${colors.text}`} fill="currentColor" viewBox="0 0 24 24">
              <circle cx="12" cy="5" r="1.5" />
              <circle cx="12" cy="12" r="1.5" />
              <circle cx="12" cy="19" r="1.5" />
            </svg>
          </button>
          {menuOpen && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setMenuOpen(false)} />
              <div className="absolute right-0 top-full mt-1 z-20 w-40 bg-popover border border-border rounded-xl shadow-lg py-1 text-sm overflow-hidden">
                <button
                  onClick={() => { setMenuOpen(false); onDetalle(componente); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                >
                  Ver usos
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(componente); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                >
                  Editar
                </button>
                <div className="h-px bg-border mx-2 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(componente); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-crimson transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Icon placeholder */}
      <div className={`${colors.bg} opacity-40 h-16 flex items-center justify-center`}>
        <svg className={`h-8 w-8 ${colors.text} opacity-30`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>

      {/* Content */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="font-semibold text-sm leading-snug" style={{ fontFamily: "var(--font-outfit)" }}>
          {componente.nombre}
        </h3>
        {componente.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">{componente.descripcion}</p>
        )}
      </div>

      {/* KPI strip */}
      <div className="grid grid-cols-2 divide-x divide-border border-y border-border mx-0">
        {[
          { label: "En conjuntos", value: componente._count.conjuntos },
          { label: "Instancias",   value: componente._count.instancias },
        ].map((kpi) => (
          <div key={kpi.label} className="flex flex-col items-center py-2.5 px-1 text-center">
            <span className="text-base font-bold leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
              {kpi.value}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Footer actions */}
      <div className="px-4 py-3 flex gap-2">
        <button
          onClick={() => onDetalle(componente)}
          className="flex-1 py-1.5 rounded-xl border border-dashed border-primary/40 text-xs font-medium text-primary hover:bg-primary/5 hover:border-primary transition-colors"
        >
          Ver usos
        </button>
        <button
          onClick={() => onEdit(componente)}
          className="flex-1 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:bg-muted transition-colors"
        >
          Editar
        </button>
      </div>
    </div>
  );
}

// ── Componente Row (List) ─────────────────────────────────────────────────────

function ComponenteRow({
  componente,
  index,
  onEdit,
  onDelete,
  onDetalle,
}: {
  componente: Componente;
  index: number;
  onEdit: (c: Componente) => void;
  onDelete: (c: Componente) => void;
  onDetalle: (c: Componente) => void;
}) {
  const colors = getTipoColor(componente.tipo);

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-5 py-3 text-xs text-muted-foreground font-mono">{index + 1}</td>
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{componente.nombre}</p>
          {componente.descripcion && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">{componente.descripcion}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-1 rounded-full border ${colors.chip}`}>
          {TIPO_LABEL[componente.tipo.toUpperCase()] ?? componente.tipo}
        </span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <span className="text-sm font-medium">{componente._count.conjuntos}</span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <span className="text-sm font-medium">{componente._count.instancias}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onDetalle(componente)}
            className="text-xs text-muted-foreground hover:text-primary px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            Usos
          </button>
          <button
            onClick={() => onEdit(componente)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onDelete(componente)}
            className="text-xs text-crimson px-2 py-1 rounded-lg hover:bg-crimson/10 transition-colors"
          >
            Eliminar
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Create / Edit Modal ───────────────────────────────────────────────────────

function ComponenteModal({
  componente,
  token,
  backendUrl,
  onClose,
  onSaved,
}: {
  componente: Componente | null;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onSaved: (c: Componente) => void;
}) {
  const isEdit = !!componente;
  const [form, setForm] = useState({
    nombre: componente?.nombre ?? "",
    tipo: componente?.tipo ?? "BLUSA",
    descripcion: componente?.descripcion ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError("El nombre es obligatorio"); return; }
    if (!form.tipo) { setError("El tipo es obligatorio"); return; }

    setSaving(true);
    setError(null);
    try {
      const url = isEdit
        ? `${backendUrl}/catalogo/componentes/${componente!.id}`
        : `${backendUrl}/catalogo/componentes`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: form.nombre.trim(),
          tipo: form.tipo,
          descripcion: form.descripcion.trim() || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onSaved({
          ...data,
          _count: componente?._count ?? { conjuntos: 0, instancias: 0 },
        });
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err?.message ?? "Error al guardar");
      }
    } catch {
      setError("Error de red");
    } finally {
      setSaving(false);
    }
  };

  const inputCls = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            {isEdit ? "Editar componente" : "Nuevo componente"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="px-6 py-5 space-y-4">
          {error && (
            <div className="rounded-xl bg-crimson/10 border border-crimson/20 px-4 py-2.5 text-sm text-crimson">
              {error}
            </div>
          )}

          {/* Nombre */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Nombre <span className="text-crimson">*</span>
            </label>
            <input
              className={inputCls}
              value={form.nombre}
              onChange={(e) => setForm((p) => ({ ...p, nombre: e.target.value }))}
              placeholder="Ej: Pollera bordada roja"
            />
          </div>

          {/* Tipo */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Tipo <span className="text-crimson">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {TIPO_OPTIONS.map((tipo) => {
                const colors = getTipoColor(tipo);
                const selected = form.tipo === tipo;
                return (
                  <button
                    key={tipo}
                    onClick={() => setForm((p) => ({ ...p, tipo }))}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                      selected
                        ? `${colors.bg} ${colors.text} border-current ring-2 ring-current/20`
                        : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
                    }`}
                  >
                    {TIPO_LABEL[tipo] ?? tipo}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Descripción
            </label>
            <textarea
              className={`${inputCls} resize-none`}
              rows={3}
              value={form.descripcion}
              onChange={(e) => setForm((p) => ({ ...p, descripcion: e.target.value }))}
              placeholder="Descripción opcional del componente..."
            />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-primary text-primary-foreground"
            onClick={handleSubmit}
            disabled={saving}
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear componente"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Confirm Delete Modal ──────────────────────────────────────────────────────

function ConfirmDeleteModal({
  componente,
  token,
  backendUrl,
  onClose,
  onDeleted,
}: {
  componente: Componente;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/catalogo/componentes/${componente.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDeleted(componente.id);
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err?.message ?? "Error al eliminar");
        setDeleting(false);
      }
    } catch {
      setError("Error de red");
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-crimson/10 flex items-center justify-center mx-auto">
          <svg className="h-6 w-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
        </div>
        <div className="text-center">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            Eliminar componente
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            ¿Eliminar <span className="font-semibold text-foreground">{componente.nombre}</span>?
          </p>
          {componente._count.conjuntos > 0 && (
            <p className="text-xs text-gold mt-2 bg-gold/10 rounded-xl px-3 py-2">
              Este componente se usa en {componente._count.conjuntos} conjunto{componente._count.conjuntos !== 1 ? "s" : ""}.
              Al eliminarlo se quitará de sus recetas.
            </p>
          )}
        </div>
        {error && (
          <p className="text-xs text-crimson text-center bg-crimson/10 rounded-xl px-3 py-2">{error}</p>
        )}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>
            Cancelar
          </Button>
          <Button
            className="flex-1 bg-crimson text-white hover:bg-crimson/90"
            onClick={handleDelete}
            disabled={deleting}
          >
            {deleting ? "Eliminando…" : "Eliminar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Detalle / Usos Modal ──────────────────────────────────────────────────────

function DetalleComponenteModal({
  componente,
  token,
  backendUrl,
  onClose,
  onEdit,
}: {
  componente: Componente;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onEdit: () => void;
}) {
  const [detail, setDetail] = useState<Componente | null>(null);
  const [loading, setLoading] = useState(true);
  const colors = getTipoColor(componente.tipo);

  // Fetch full detail (includes conjuntos[])
  useState(() => {
    fetch(`${backendUrl}/catalogo/componentes/${componente.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => { setDetail(data); setLoading(false); })
      .catch(() => setLoading(false));
  });

  const conjuntos = detail?.conjuntos ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-xl shadow-2xl flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className={`${colors.bg} px-6 py-4 rounded-t-2xl flex items-start justify-between gap-3 shrink-0`}>
          <div className="min-w-0">
            <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
              {TIPO_LABEL[componente.tipo.toUpperCase()] ?? componente.tipo}
            </span>
            <h2 className="font-bold text-lg leading-tight mt-0.5" style={{ fontFamily: "var(--font-outfit)" }}>
              {componente.nombre}
            </h2>
            {componente.descripcion && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{componente.descripcion}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-black/10 transition-colors shrink-0"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 divide-x divide-border border-b border-border shrink-0">
          {[
            { label: "En conjuntos", value: componente._count.conjuntos, color: "text-primary" },
            { label: "Instancias físicas", value: componente._count.instancias, color: "text-coca" },
          ].map((s) => (
            <div key={s.label} className="flex flex-col items-center py-3 text-center">
              <span className={`text-2xl font-bold leading-none ${s.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
                {s.value}
              </span>
              <span className="text-[10px] text-muted-foreground mt-0.5">{s.label}</span>
            </div>
          ))}
        </div>

        {/* Conjuntos list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-3">
            Conjuntos que usan este componente
          </p>

          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : conjuntos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center mb-3">
                <svg className="h-6 w-6 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <p className="text-sm text-muted-foreground">No se usa en ningún conjunto aún</p>
            </div>
          ) : (
            <div className="space-y-2">
              {conjuntos.map(({ conjunto }) => {
                const dc = conjunto as ConjuntoUso;
                return (
                  <div
                    key={dc.id}
                    className="flex items-center gap-3 rounded-xl border border-border bg-muted/20 px-4 py-3"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold truncate">{dc.nombre}</p>
                      <p className="text-xs text-muted-foreground">{dc.danza}</p>
                    </div>
                    <span className="text-xs font-mono text-muted-foreground/50 shrink-0">#{dc.id}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border shrink-0">
          <Button variant="outline" className="w-full" onClick={onEdit}>
            Editar componente
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Client Component ─────────────────────────────────────────────────────

export function ComponentesClient({ initialComponentes, token, backendUrl }: Props) {
  const [componentes, setComponentes] = useState<Componente[]>(initialComponentes);
  const [search, setSearch] = useState("");
  const [tipoFilter, setTipoFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("list");

  // Modals
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<Componente | null>(null);
  const [eliminando, setEliminando] = useState<Componente | null>(null);
  const [viendo, setViendo] = useState<Componente | null>(null);

  // Derived types
  const tiposUnicos = useMemo(
    () => ["Todos", ...Array.from(new Set(componentes.map((c) => c.tipo))).sort()],
    [componentes]
  );

  // Filter
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return componentes.filter((c) => {
      const matchSearch =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.tipo.toLowerCase().includes(q) ||
        (c.descripcion ?? "").toLowerCase().includes(q);
      const matchTipo = tipoFilter === "Todos" || c.tipo === tipoFilter;
      return matchSearch && matchTipo;
    });
  }, [componentes, search, tipoFilter]);

  const handleSaved = (saved: Componente) => {
    setComponentes((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = saved;
        return next;
      }
      return [...prev, saved];
    });
  };

  const handleDeleted = (id: number) => {
    setComponentes((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* ── Header ── */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Componentes
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Piezas que componen los conjuntos folklóricos
          </p>
        </div>
        <Button
          className="bg-primary text-primary-foreground shrink-0"
          onClick={() => setShowCrear(true)}
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo componente
        </Button>
      </div>

      {/* ── Stats ── */}
      <StatsBar componentes={componentes} />

      {/* ── Filters ── */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all"
            placeholder="Buscar componente…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 shrink-0">
          {(["list", "grid"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                viewMode === mode
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {mode === "list" ? (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              )}
              {mode === "list" ? "Lista" : "Tarjetas"}
            </button>
          ))}
        </div>
      </div>

      {/* Tipo filter chips */}
      <div className="flex flex-wrap gap-2">
        {tiposUnicos.map((tipo) => {
          const active = tipoFilter === tipo;
          const colors = tipo !== "Todos" ? getTipoColor(tipo) : null;
          return (
            <button
              key={tipo}
              onClick={() => setTipoFilter(tipo)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                active
                  ? colors
                    ? `${colors.bg} ${colors.text} border-current`
                    : "bg-primary/10 text-primary border-primary/30"
                  : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              {tipo === "Todos" ? "Todos" : (TIPO_LABEL[tipo] ?? tipo)}
              <span className="ml-1.5 opacity-60">
                {tipo === "Todos"
                  ? componentes.length
                  : componentes.filter((c) => c.tipo === tipo).length}
              </span>
            </button>
          );
        })}
      </div>

      {/* ── Content ── */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-muted-foreground/40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <p className="font-medium text-muted-foreground">
            {search || tipoFilter !== "Todos" ? "Sin resultados para este filtro" : "No hay componentes registrados"}
          </p>
          {!search && tipoFilter === "Todos" && (
            <button
              onClick={() => setShowCrear(true)}
              className="mt-3 text-sm text-primary hover:underline"
            >
              Crear el primer componente →
            </button>
          )}
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((c) => (
            <ComponenteCard
              key={c.id}
              componente={c}
              onEdit={setEditando}
              onDelete={setEliminando}
              onDetalle={setViendo}
            />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-3 w-12">#</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Tipo</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Conjuntos</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Instancias</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <ComponenteRow
                  key={c.id}
                  componente={c}
                  index={i}
                  onEdit={setEditando}
                  onDelete={setEliminando}
                  onDetalle={setViendo}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Modals ── */}
      {showCrear && (
        <ComponenteModal
          componente={null}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setShowCrear(false)}
          onSaved={handleSaved}
        />
      )}

      {editando && (
        <ComponenteModal
          componente={editando}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setEditando(null)}
          onSaved={(saved) => { handleSaved(saved); setEditando(null); }}
        />
      )}

      {eliminando && (
        <ConfirmDeleteModal
          componente={eliminando}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setEliminando(null)}
          onDeleted={handleDeleted}
        />
      )}

      {viendo && (
        <DetalleComponenteModal
          componente={viendo}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setViendo(null)}
          onEdit={() => { setEditando(viendo); setViendo(null); }}
        />
      )}
    </div>
  );
}
