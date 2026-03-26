"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ─────────────────────────────────────────────────────────────────────

interface Componente {
  id: number;
  nombre: string;
  tipo: string;
  descripcion: string | null;
}

interface ConjuntoComponente {
  id: number;
  cantidad: number;
  es_obligatorio: boolean;
  componente: Componente;
}

interface Instancia {
  id: number;
  codigo: string;
  estado: "DISPONIBLE" | "RESERVADO" | "ALQUILADO" | "EN_TRANSFERENCIA" | "DADO_DE_BAJA";
  sucursal: { id: number; nombre: string };
}

interface Variacion {
  id: number;
  codigo_variacion: string;
  nombre_variacion: string;
  talla: string | null;
  color: string | null;
  estilo: string | null;
  precio_venta: string | null;
  precio_alquiler: string | null;
  activa: boolean;
  instancias: Instancia[];
}

interface Conjunto {
  id: number;
  codigo: string | null;
  nombre: string;
  danza: string;
  genero: string;
  descripcion: string | null;
  imagen_url: string | null;
  precio_base: string;
  precio_venta: string | null;
  disponible_venta: boolean;
  disponible_alquiler: boolean;
  activo: boolean;
  componentes: ConjuntoComponente[];
  variaciones: Variacion[];
}

interface Sucursal {
  id: number;
  nombre: string;
  ciudad: string;
}

interface Props {
  initialConjuntos: Conjunto[];
  componentes: Componente[];
  sucursales: Sucursal[];
  token: string;
  backendUrl: string;
}

// ── Helpers ───────────────────────────────────────────────────────────────────

const DANZA_COLORS: Record<string, { bg: string; text: string }> = {
  Morenada:  { bg: "bg-crimson/10",      text: "text-crimson" },
  Caporales: { bg: "bg-gold/10",         text: "text-gold" },
  Tinku:     { bg: "bg-coca/10",         text: "text-coca" },
  Diablada:  { bg: "bg-purple-500/10",   text: "text-purple-600" },
  Llamerada: { bg: "bg-orange-500/10",   text: "text-orange-600" },
  Saya:      { bg: "bg-blue-500/10",     text: "text-blue-600" },
  Pujllay:   { bg: "bg-emerald-500/10",  text: "text-emerald-600" },
  Kullawada: { bg: "bg-indigo-500/10",   text: "text-indigo-600" },
};

const DANZA_OPTIONS = [
  "Morenada", "Caporales", "Tinku", "Diablada",
  "Llamerada", "Saya", "Pujllay", "Kullawada",
  "Tinkus", "Tobas", "Macheteros", "Auki Auquis",
];

const GENERO_OPTIONS = [
  { value: "MASCULINO", label: "Masculino" },
  { value: "FEMENINO", label: "Femenino" },
  { value: "UNISEX", label: "Unisex" },
  { value: "INFANTIL", label: "Infantil" },
];

const DANZA_CODE: Record<string, string> = {
  Morenada: "MOR", Caporales: "CAP", Tinku: "TINK", Diablada: "DIAB",
  Llamerada: "LLA", Saya: "SAYA", Pujllay: "PUJ", Kullawada: "KUL",
  Tinkus: "TINK", Tobas: "TOB", Macheteros: "MACH", "Auki Auquis": "AUKI",
};

const GENERO_CODE: Record<string, string> = {
  MASCULINO: "M", FEMENINO: "F", UNISEX: "U",
};

function generateCodigo(danza: string, genero: string): string {
  const d = DANZA_CODE[danza] ?? danza.slice(0, 4).toUpperCase();
  const g = GENERO_CODE[genero] ?? genero.slice(0, 1).toUpperCase();
  const y = new Date().getFullYear();
  return `${d}-${g}-${y}`;
}

function getDanzaColor(danza: string) {
  return DANZA_COLORS[danza] ?? { bg: "bg-muted", text: "text-muted-foreground" };
}

function formatPrecio(precio: string) {
  return parseFloat(precio).toLocaleString("es-BO", {
    style: "currency",
    currency: "BOB",
    minimumFractionDigits: 0,
  });
}

function getStats(c: Conjunto) {
  const all = c.variaciones.flatMap((v) => v.instancias);
  const total = all.length;
  const disponibles = all.filter((i) => i.estado === "DISPONIBLE").length;
  const alquilados  = all.filter((i) => i.estado === "ALQUILADO").length;
  const reservados  = all.filter((i) => i.estado === "RESERVADO").length;
  const limpieza    = all.filter((i) => i.estado === "DADO_DE_BAJA").length;
  const pct = total > 0 ? Math.round((disponibles / total) * 100) : 0;
  return { total, disponibles, alquilados, reservados, limpieza, pct };
}

// ── Stats Bar ─────────────────────────────────────────────────────────────────

function StatsBar({ conjuntos }: { conjuntos: Conjunto[] }) {
  const totalConjuntos = conjuntos.length;
  const totalInstancias = conjuntos.reduce((s, c) => s + getStats(c).total, 0);
  const conStock = conjuntos.filter((c) => getStats(c).disponibles > 0).length;
  const sinStock = totalConjuntos - conStock;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      {[
        { label: "Conjuntos", value: totalConjuntos, color: "text-foreground" },
        { label: "Con stock", value: conStock, color: "text-coca" },
        { label: "Sin stock", value: sinStock, color: "text-crimson" },
        { label: "Instancias totales", value: totalInstancias, color: "text-primary" },
      ].map((s) => (
        <div key={s.label} className="bg-card rounded-2xl border border-border px-4 py-3">
          <p className={`text-2xl font-bold ${s.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
            {s.value}
          </p>
          <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
        </div>
      ))}
    </div>
  );
}

// ── Conjunto Card (Grid) ──────────────────────────────────────────────────────

function ConjuntoCard({
  conjunto,
  onEdit,
  onDelete,
  onInstancias,
  onDetalle,
}: {
  conjunto: Conjunto;
  onEdit: (c: Conjunto, tab?: ModalTab) => void;
  onDelete: (c: Conjunto) => void;
  onInstancias: (c: Conjunto) => void;
  onDetalle: (c: Conjunto) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const colors = getDanzaColor(conjunto.danza);
  const { total, disponibles, alquilados, reservados, limpieza, pct } = getStats(conjunto);

  return (
    <div className="group relative rounded-2xl border border-border bg-card overflow-hidden hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200">
      {/* Danza banner */}
      <div className={`${colors.bg} px-4 py-2.5 flex items-center justify-between`}>
        <div className="flex items-center gap-2 min-w-0">
          <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>
            {conjunto.danza}
          </span>
          {conjunto.codigo && (
            <span className="text-xs font-mono text-muted-foreground/70 truncate">
              {conjunto.codigo}
            </span>
          )}
        </div>
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
                  onClick={() => { setMenuOpen(false); onDetalle(conjunto); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                >
                  Ver detalle
                </button>
                <button
                  onClick={() => { setMenuOpen(false); onEdit(conjunto); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted transition-colors"
                >
                  Editar
                </button>
                <div className="h-px bg-border mx-2 my-1" />
                <button
                  onClick={() => { setMenuOpen(false); onDelete(conjunto); }}
                  className="w-full text-left px-3 py-2 hover:bg-muted text-crimson transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Image */}
      {conjunto.imagen_url ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={conjunto.imagen_url} alt={conjunto.nombre} className="w-full h-28 object-cover" />
      ) : (
        <div className="w-full h-28 bg-muted/50 flex items-center justify-center">
          <svg className="h-9 w-9 text-muted-foreground/20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
      )}

      {/* Name + description */}
      <div className="px-4 pt-3 pb-2">
        <h3 className="font-semibold text-sm leading-snug" style={{ fontFamily: "var(--font-outfit)" }}>
          {conjunto.nombre}
        </h3>
        {conjunto.descripcion && (
          <p className="text-xs text-muted-foreground line-clamp-1 mt-0.5">{conjunto.descripcion}</p>
        )}
      </div>

      {/* 2-col KPIs */}
      <div className="grid grid-cols-2 divide-x divide-border border-y border-border mx-0">
        {[
          { label: "Variaciones", value: conjunto.variaciones.length },
          { label: "Instancias",  value: total },
        ].map((kpi) => (
          <div key={kpi.label} className="flex flex-col items-center py-2.5 px-1 text-center">
            <span className="text-base font-bold leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
              {kpi.value}
            </span>
            <span className="text-[10px] text-muted-foreground mt-0.5 leading-tight">{kpi.label}</span>
          </div>
        ))}
      </div>

      {/* Disponibilidad section */}
      <div className="px-4 pt-3 pb-4 space-y-2.5">
        {/* Label + ratio */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Disponibilidad</span>
          <span className={`text-xs font-bold ${disponibles > 0 ? "text-coca" : "text-muted-foreground"}`}>
            {disponibles}/{total}
          </span>
        </div>

        {/* Stacked progress bar */}
        <div className="h-2 bg-muted rounded-full overflow-hidden flex">
          {total > 0 && (
            <>
              <div className="h-full bg-coca transition-all"       style={{ width: `${(disponibles / total) * 100}%` }} />
              <div className="h-full bg-gold transition-all"       style={{ width: `${(alquilados  / total) * 100}%` }} />
              <div className="h-full bg-primary/60 transition-all" style={{ width: `${(reservados  / total) * 100}%` }} />
            </>
          )}
        </div>

        {/* 3-col breakdown */}
        <div className="grid grid-cols-3 gap-1 text-center">
          {[
            { label: "Disponibles", value: disponibles, color: "text-coca" },
            { label: "Alquilados",  value: alquilados,  color: "text-gold" },
            { label: "Reservados",  value: reservados,  color: "text-primary" },
          ].map((s) => (
            <div key={s.label} className="space-y-0.5">
              <p className={`text-base font-bold leading-none ${s.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
                {s.value}
              </p>
              <p className="text-[10px] text-muted-foreground leading-tight">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Add instances button */}
        <button
          onClick={() => onInstancias(conjunto)}
          className="mt-2 w-full py-2 rounded-xl border border-dashed border-primary/40 text-xs font-medium text-primary hover:bg-primary/5 hover:border-primary transition-colors flex items-center justify-center gap-1.5"
        >
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Agregar instancias
        </button>
      </div>
    </div>
  );
}

// ── Conjunto Row (List) ───────────────────────────────────────────────────────

function ConjuntoRow({
  conjunto,
  onEdit,
  onDelete,
  onDetalle,
  onInstancias,
}: {
  conjunto: Conjunto;
  onEdit: (c: Conjunto, tab?: ModalTab) => void;
  onDelete: (c: Conjunto) => void;
  onDetalle: (c: Conjunto) => void;
  onInstancias: (c: Conjunto) => void;
}) {
  const colors = getDanzaColor(conjunto.danza);
  const { total, disponibles } = getStats(conjunto);

  return (
    <tr className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="text-sm font-semibold">{conjunto.nombre}</p>
          {conjunto.descripcion && (
            <p className="text-xs text-muted-foreground truncate max-w-xs">{conjunto.descripcion}</p>
          )}
        </div>
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex text-xs font-semibold px-2.5 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {conjunto.danza}
        </span>
      </td>
      <td className="px-4 py-3 hidden md:table-cell">
        <span className="text-xs text-muted-foreground">
          {conjunto.componentes.length} comp. · {conjunto.variaciones.length} var.
        </span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <span className="text-sm font-medium">{total}</span>
      </td>
      <td className="px-4 py-3 text-center hidden sm:table-cell">
        <span className={`text-sm font-medium ${disponibles > 0 ? "text-coca" : "text-crimson"}`}>
          {disponibles}
        </span>
      </td>
      <td className="px-4 py-3 hidden lg:table-cell">
        <span className="text-sm font-bold text-primary">{formatPrecio(conjunto.precio_base)}</span>
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1 justify-end">
          <button
            onClick={() => onDetalle(conjunto)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            Ver
          </button>
          <button
            onClick={() => onEdit(conjunto)}
            className="text-xs text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg hover:bg-muted transition-colors"
          >
            Editar
          </button>
          <button
            onClick={() => onInstancias(conjunto)}
            className="text-xs text-primary px-2 py-1 rounded-lg hover:bg-primary/10 transition-colors"
          >
            +Inst.
          </button>
          <button
            onClick={() => onDelete(conjunto)}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-crimson hover:bg-crimson/10 transition-colors"
            title="Eliminar"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ── Variacion row type (for the tab) ─────────────────────────────────────────

interface VariacionDraft {
  _key: number;
  _codigoManual?: boolean; // true once the user types in the codigo field manually
  id?: number;             // set for existing variaciones, undefined for new ones
  codigo_variacion: string;
  nombre_variacion: string;
  talla: string;
  color: string;
  estilo: string;
  precio_venta: string;
  precio_alquiler: string;
}

function generateVariacionCodigo(talla: string, color: string): string {
  const t = talla.trim().toUpperCase() || "VAR";
  const c = color.trim() ? `-${color.trim().slice(0, 3).toUpperCase()}` : "";
  return `${t}${c}`;
}

let _varKey = 0;
const newVarRow = (): VariacionDraft => ({
  _key: ++_varKey,
  codigo_variacion: "",
  nombre_variacion: "",
  talla: "",
  color: "",
  estilo: "",
  precio_venta: "",
  precio_alquiler: "",
});

// ── Create / Edit Modal ───────────────────────────────────────────────────────

type ModalTab = "general" | "componentes" | "variaciones" | "configuracion";

function ConjuntoModal({
  conjunto,
  componentes,
  token,
  backendUrl,
  initialTab,
  onClose,
  onSaved,
}: {
  conjunto: Conjunto | null;
  componentes: Componente[];
  token: string;
  backendUrl: string;
  initialTab?: ModalTab;
  onClose: () => void;
  onSaved: (c: Conjunto) => void;
}) {
  const isEdit = Boolean(conjunto);

  // ── Tab ──
  const [tab, setTab] = useState<ModalTab>(initialTab ?? "general");

  // ── General form ──
  const initGenero = conjunto?.genero ?? "UNISEX";
  const initDanza = conjunto?.danza ?? "";
  const [form, setForm] = useState({
    codigo: conjunto?.codigo ?? "",
    nombre: conjunto?.nombre ?? "",
    danza: initDanza,
    genero: initGenero,
    precio_base: conjunto ? String(parseFloat(conjunto.precio_base)) : "",
    precio_venta: conjunto?.precio_venta ? String(parseFloat(conjunto.precio_venta)) : "",
    descripcion: conjunto?.descripcion ?? "",
  });
  const [codigoManual, setCodigoManual] = useState(Boolean(conjunto?.codigo));

  // Auto-generate code when danza or genero changes (unless user typed manually)
  const updateField = (field: keyof typeof form, value: string) => {
    setForm((p) => {
      const next = { ...p, [field]: value };
      if ((field === "danza" || field === "genero") && !codigoManual) {
        next.codigo = generateCodigo(
          field === "danza" ? value : p.danza,
          field === "genero" ? value : p.genero
        );
      }
      return next;
    });
  };

  // ── Componentes ──
  const [selectedComps, setSelectedComps] = useState<Record<number, number>>(() => {
    const init: Record<number, number> = {};
    if (conjunto) {
      for (const cc of conjunto.componentes) {
        init[cc.componente.id] = cc.cantidad;
      }
    }
    return init;
  });

  // ── Variaciones draft ──
  const [varRows, setVarRows] = useState<VariacionDraft[]>(() => {
    if (conjunto?.variaciones?.length) {
      return conjunto.variaciones.map((v) => ({
        _key: ++_varKey,
        id: v.id,
        codigo_variacion: v.codigo_variacion,
        nombre_variacion: v.nombre_variacion,
        talla: v.talla ?? "",
        color: v.color ?? "",
        estilo: v.estilo ?? "",
        precio_venta: v.precio_venta ? String(parseFloat(v.precio_venta)) : "",
        precio_alquiler: v.precio_alquiler ? String(parseFloat(v.precio_alquiler)) : "",
      }));
    }
    return [];
  });

  // ── Nueva variación (edit mode inline form) ──
  const [newVar, setNewVar] = useState<Omit<VariacionDraft, "_key" | "id">>({
    codigo_variacion: "", nombre_variacion: "", talla: "", color: "",
    estilo: "", precio_venta: "", precio_alquiler: "",
  });
  const [newVarCodigoManual, setNewVarCodigoManual] = useState(false);
  const [addingVar, setAddingVar] = useState(false);
  const [savingVarKey, setSavingVarKey] = useState<number | null>(null);
  const [editingVarKey, setEditingVarKey] = useState<number | null>(null);
  const [varError, setVarError] = useState<string | null>(null);

  // Auto-update newVar.codigo_variacion when talla/color change (unless manual)
  const updateNewVar = (field: keyof typeof newVar, value: string) => {
    setNewVar((p) => {
      const next = { ...p, [field]: value };
      if ((field === "talla" || field === "color") && !newVarCodigoManual) {
        next.codigo_variacion = generateVariacionCodigo(
          field === "talla" ? value : p.talla,
          field === "color" ? value : p.color,
        );
      }
      return next;
    });
  };

  // ── Configuración ──
  const [config, setConfig] = useState({
    disponible_venta: conjunto?.disponible_venta ?? true,
    disponible_alquiler: conjunto?.disponible_alquiler ?? true,
  });

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nombre.trim() || !form.danza.trim()) {
      setError("Nombre y categoría son obligatorios");
      setTab("general");
      return;
    }
    if (!form.precio_base) {
      setError("El precio de alquiler es obligatorio");
      setTab("configuracion");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const body: Record<string, unknown> = {
        codigo: form.codigo.trim() || undefined,
        nombre: form.nombre.trim(),
        danza: form.danza,
        genero: form.genero,
        precio_base: parseFloat(form.precio_base),
        precio_venta: form.precio_venta ? parseFloat(form.precio_venta) : undefined,
        descripcion: form.descripcion.trim() || undefined,
        disponible_venta: config.disponible_venta,
        disponible_alquiler: config.disponible_alquiler,
      };

      if (!isEdit) {
        body.componentes = Object.entries(selectedComps).map(([id, cantidad]) => ({
          componenteId: Number(id),
          cantidad,
        }));
        body.variaciones = varRows
          .filter((r) => r.codigo_variacion.trim() && r.nombre_variacion.trim())
          .map(({ codigo_variacion, nombre_variacion, talla, color, estilo, precio_venta, precio_alquiler }) => ({
            codigo_variacion: codigo_variacion.trim(),
            nombre_variacion: nombre_variacion.trim(),
            talla: talla.trim() || undefined,
            color: color.trim() || undefined,
            estilo: estilo.trim() || undefined,
            precio_venta: precio_venta ? parseFloat(precio_venta) : undefined,
            precio_alquiler: precio_alquiler ? parseFloat(precio_alquiler) : undefined,
          }));
      }

      const url = isEdit
        ? `${backendUrl}/catalogo/conjuntos/${conjunto!.id}`
        : `${backendUrl}/catalogo/conjuntos`;
      const res = await fetch(url, {
        method: isEdit ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        // In edit mode, also save component associations
        if (isEdit) {
          const compList = Object.entries(selectedComps).map(([id, cantidad]) => ({
            componenteId: Number(id),
            cantidad,
          }));
          await fetch(`${backendUrl}/catalogo/conjuntos/${conjunto!.id}/componentes`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ componentes: compList }),
          });
        }
        const data = await res.json();
        // For edit mode: updateConjunto doesn't return variaciones, so we rebuild them from varRows
        const mergedVariaciones: Variacion[] = isEdit
          ? varRows.map((row) => ({
              id: row.id ?? 0,
              codigo_variacion: row.codigo_variacion,
              nombre_variacion: row.nombre_variacion,
              talla: row.talla || null,
              color: row.color || null,
              estilo: row.estilo || null,
              precio_venta: row.precio_venta || null,
              precio_alquiler: row.precio_alquiler || null,
              activa: true,
              instancias: conjunto?.variaciones.find((v) => v.id === row.id)?.instancias ?? [],
            }))
          : [];
        onSaved({ variaciones: mergedVariaciones, ...data });
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Error al guardar"));
      }
    } finally {
      setSaving(false);
    }
  };

  const toggleComp = (id: number) => {
    setSelectedComps((prev) => {
      if (prev[id] !== undefined) {
        const next = { ...prev };
        delete next[id];
        return next;
      }
      return { ...prev, [id]: 1 };
    });
  };

  const adjustCantidad = (id: number, delta: number) => {
    setSelectedComps((prev) => ({ ...prev, [id]: Math.max(1, (prev[id] ?? 1) + delta) }));
  };

  const updateVarRow = (key: number, field: keyof VariacionDraft, value: string) => {
    setVarRows((rows) => rows.map((r) => {
      if (r._key !== key) return r;
      const next: VariacionDraft = { ...r, [field]: value };
      // Mark as manual if user typed directly in the codigo field
      if (field === "codigo_variacion") next._codigoManual = true;
      // Auto-update codigo when talla or color changes (unless manually set)
      if ((field === "talla" || field === "color") && !r._codigoManual) {
        next.codigo_variacion = generateVariacionCodigo(
          field === "talla" ? value : r.talla,
          field === "color" ? value : r.color,
        );
      }
      return next;
    }));
  };

  const removeVarRow = (key: number) => {
    setVarRows((rows) => rows.filter((r) => r._key !== key));
  };

  // ── Variacion API helpers (edit mode only) ──
  const handleDeleteVar = async (row: VariacionDraft) => {
    if (!row.id) { removeVarRow(row._key); return; }
    setVarError(null);
    try {
      const res = await fetch(`${backendUrl}/catalogo/variaciones/${row.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        removeVarRow(row._key);
      } else {
        const err = await res.json().catch(() => ({}));
        setVarError(Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Error al eliminar"));
      }
    } catch {
      setVarError("Error de red");
    }
  };

  const handleAddVar = async () => {
    if (!conjunto) return;
    if (!newVar.codigo_variacion.trim() || !newVar.nombre_variacion.trim()) {
      setVarError("Código y nombre son obligatorios");
      return;
    }
    setAddingVar(true);
    setVarError(null);
    try {
      const res = await fetch(`${backendUrl}/catalogo/conjuntos/${conjunto.id}/variaciones`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          codigo_variacion: newVar.codigo_variacion.trim(),
          nombre_variacion: newVar.nombre_variacion.trim(),
          talla: newVar.talla.trim() || undefined,
          color: newVar.color.trim() || undefined,
          estilo: newVar.estilo.trim() || undefined,
          precio_venta: newVar.precio_venta ? parseFloat(newVar.precio_venta) : undefined,
          precio_alquiler: newVar.precio_alquiler ? parseFloat(newVar.precio_alquiler) : undefined,
        }),
      });
      if (res.ok) {
        const saved = await res.json();
        setVarRows((r) => [...r, {
          _key: ++_varKey,
          id: saved.id,
          codigo_variacion: saved.codigo_variacion,
          nombre_variacion: saved.nombre_variacion,
          talla: saved.talla ?? "",
          color: saved.color ?? "",
          estilo: saved.estilo ?? "",
          precio_venta: saved.precio_venta ? String(parseFloat(saved.precio_venta)) : "",
          precio_alquiler: saved.precio_alquiler ? String(parseFloat(saved.precio_alquiler)) : "",
        }]);
        setNewVar({ codigo_variacion: "", nombre_variacion: "", talla: "", color: "", estilo: "", precio_venta: "", precio_alquiler: "" });
        setNewVarCodigoManual(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setVarError(Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Error al agregar"));
      }
    } catch {
      setVarError("Error de red");
    } finally {
      setAddingVar(false);
    }
  };

  const handleUpdateVar = async (row: VariacionDraft) => {
    if (!row.id) return;
    if (!row.codigo_variacion.trim() || !row.nombre_variacion.trim()) {
      setVarError("Código y nombre son obligatorios");
      return;
    }
    setSavingVarKey(row._key);
    setVarError(null);
    try {
      const res = await fetch(`${backendUrl}/catalogo/variaciones/${row.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre_variacion: row.nombre_variacion.trim(),
          talla: row.talla.trim() || undefined,
          color: row.color.trim() || undefined,
          estilo: row.estilo.trim() || undefined,
          precio_venta: row.precio_venta ? parseFloat(row.precio_venta) : undefined,
          precio_alquiler: row.precio_alquiler ? parseFloat(row.precio_alquiler) : undefined,
        }),
      });
      if (res.ok) {
        setEditingVarKey(null);
      } else {
        const err = await res.json().catch(() => ({}));
        setVarError(Array.isArray(err.message) ? err.message.join(", ") : (err.message ?? "Error al guardar"));
      }
    } catch {
      setVarError("Error de red");
    } finally {
      setSavingVarKey(null);
    }
  };

  const TABS: { id: ModalTab; label: string }[] = [
    { id: "general", label: "General" },
    { id: "componentes", label: `Componentes (${Object.keys(selectedComps).length})` },
    { id: "variaciones", label: `Variaciones (${varRows.length})` },
    { id: "configuracion", label: "Configuración" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
            {isEdit ? "Editar conjunto" : "Nuevo conjunto"}
          </h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border shrink-0 overflow-x-auto">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTab(t.id)}
              className={`px-5 py-3 text-sm font-medium whitespace-nowrap transition-colors ${
                tab === t.id
                  ? "border-b-2 border-primary text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">

            {/* ── Tab: General ── */}
            {tab === "general" && (
              <>
                {/* Código auto-gen */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-medium text-muted-foreground">Código</label>
                    <button
                      type="button"
                      onClick={() => {
                        setCodigoManual((m) => {
                          if (m) {
                            // Reset to auto
                            setForm((p) => ({ ...p, codigo: generateCodigo(p.danza, p.genero) }));
                          }
                          return !m;
                        });
                      }}
                      className="text-xs text-primary hover:underline"
                    >
                      {codigoManual ? "Usar auto-generado" : "Editar manualmente"}
                    </button>
                  </div>
                  <input
                    value={form.codigo}
                    onChange={(e) => { setCodigoManual(true); updateField("codigo", e.target.value); }}
                    readOnly={!codigoManual}
                    className={`w-full rounded-xl border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 font-mono ${
                      codigoManual
                        ? "border-border bg-background"
                        : "border-border bg-muted text-muted-foreground cursor-default"
                    }`}
                    placeholder="Ej: CAP-M-2025"
                  />
                  {!codigoManual && (
                    <p className="text-xs text-muted-foreground/70 mt-1">
                      Se genera automáticamente: [Categoría]-[Género]-[Año]
                    </p>
                  )}
                </div>

                {/* Nombre */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Nombre *</label>
                  <input
                    value={form.nombre}
                    onChange={(e) => updateField("nombre", e.target.value)}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Ej: Conjunto Caporales Masculino"
                  />
                </div>

                {/* Categoría + Género side by side */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Categoría *</label>
                    <select
                      value={form.danza}
                      onChange={(e) => updateField("danza", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      <option value="">Seleccionar…</option>
                      {DANZA_OPTIONS.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Género</label>
                    <select
                      value={form.genero}
                      onChange={(e) => updateField("genero", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                    >
                      {GENERO_OPTIONS.map((g) => (
                        <option key={g.value} value={g.value}>{g.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Descripción */}
                <div>
                  <label className="text-xs font-medium text-muted-foreground">Descripción</label>
                  <textarea
                    value={form.descripcion}
                    onChange={(e) => updateField("descripcion", e.target.value)}
                    rows={3}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
                    placeholder="Descripción del conjunto…"
                  />
                </div>
              </>
            )}

            {/* ── Tab: Componentes ── */}
            {tab === "componentes" && (
              <div className="space-y-2">
                {componentes.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-8">
                    No hay componentes en el catálogo
                  </p>
                )}
                {componentes.map((comp) => {
                  const selected = comp.id in selectedComps;
                  return (
                    <div
                      key={comp.id}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-colors ${
                        selected ? "border-primary/30 bg-primary/5" : "border-border hover:bg-muted/50"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() => toggleComp(comp.id)}
                        className="h-4 w-4 rounded"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{comp.nombre}</p>
                        <p className="text-xs text-muted-foreground">{comp.tipo}</p>
                      </div>
                      {selected && (
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => adjustCantidad(comp.id, -1)}
                            className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center text-xs font-bold"
                          >
                            −
                          </button>
                          <span className="w-6 text-center text-sm font-medium">
                            {selectedComps[comp.id]}
                          </span>
                          <button
                            type="button"
                            onClick={() => adjustCantidad(comp.id, 1)}
                            className="w-6 h-6 rounded-lg bg-muted hover:bg-muted/70 flex items-center justify-center text-xs font-bold"
                          >
                            +
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ── Tab: Variaciones ── */}
            {tab === "variaciones" && (
              <div className="space-y-3">
                {varError && (
                  <p className="text-xs text-crimson bg-crimson/10 border border-crimson/20 px-3 py-2 rounded-lg">
                    {varError}
                  </p>
                )}

                <div className="overflow-x-auto rounded-xl border border-border">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50 border-b border-border">
                        <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Código</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Nombre</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Talla</th>
                        <th className="text-left text-xs font-semibold text-muted-foreground px-3 py-2">Color</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2">Alquiler</th>
                        <th className="text-right text-xs font-semibold text-muted-foreground px-3 py-2">Venta</th>
                        <th className="w-8 px-2 py-2" />
                      </tr>
                    </thead>
                    <tbody>
                      {varRows.length === 0 && (
                        <tr>
                          <td colSpan={7} className="text-center text-sm text-muted-foreground py-6">
                            Sin variaciones — agrega una abajo
                          </td>
                        </tr>
                      )}
                      {varRows.map((row) => (
                        <tr key={row._key} className="border-b border-border last:border-0">
                          {isEdit ? (
                            /* Edit mode: editable when editingVarKey===row._key, otherwise read-only with edit button */
                            editingVarKey === row._key ? (
                              <>
                                <td className="px-2 py-1.5">
                                  <input value={row.codigo_variacion} onChange={(e) => updateVarRow(row._key, "codigo_variacion", e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30" />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input value={row.nombre_variacion} onChange={(e) => updateVarRow(row._key, "nombre_variacion", e.target.value)} className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input value={row.talla} onChange={(e) => updateVarRow(row._key, "talla", e.target.value)} className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="S/M/L" />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input value={row.color} onChange={(e) => updateVarRow(row._key, "color", e.target.value)} className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="Rojo" />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" min="0" step="0.01" value={row.precio_alquiler} onChange={(e) => updateVarRow(row._key, "precio_alquiler", e.target.value)} className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="0.00" />
                                </td>
                                <td className="px-2 py-1.5">
                                  <input type="number" min="0" step="0.01" value={row.precio_venta} onChange={(e) => updateVarRow(row._key, "precio_venta", e.target.value)} className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary/30" placeholder="0.00" />
                                </td>
                                <td className="px-2 py-1.5 flex items-center gap-1">
                                  <button type="button" onClick={() => handleUpdateVar(row)} disabled={savingVarKey === row._key} className="text-[10px] px-1.5 py-1 rounded-lg bg-primary/10 text-primary font-semibold hover:bg-primary/20 transition-colors disabled:opacity-50">{savingVarKey === row._key ? "…" : "OK"}</button>
                                  <button type="button" onClick={() => setEditingVarKey(null)} className="text-[10px] px-1.5 py-1 rounded-lg hover:bg-muted text-muted-foreground transition-colors">✕</button>
                                </td>
                              </>
                            ) : (
                              <>
                                <td className="px-3 py-2 text-xs font-mono">{row.codigo_variacion}</td>
                                <td className="px-3 py-2 text-xs">{row.nombre_variacion}</td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">{row.talla || "—"}</td>
                                <td className="px-3 py-2 text-xs text-muted-foreground">{row.color || "—"}</td>
                                <td className="px-3 py-2 text-xs text-right">{row.precio_alquiler || "—"}</td>
                                <td className="px-3 py-2 text-xs text-right">{row.precio_venta || "—"}</td>
                                <td className="px-2 py-1.5">
                                  <div className="flex items-center gap-1">
                                    <button type="button" onClick={() => setEditingVarKey(row._key)} className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Editar">
                                      <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                                    </button>
                                    <button type="button" onClick={() => handleDeleteVar(row)} className="w-6 h-6 flex items-center justify-center rounded-lg text-crimson hover:bg-crimson/10 transition-colors" title="Eliminar">
                                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                    </button>
                                  </div>
                                </td>
                              </>
                            )
                          ) : (
                            /* Create mode: editable inputs */
                            <>
                              <td className="px-2 py-1.5">
                                <div className="relative">
                                  <input
                                    value={row.codigo_variacion}
                                    onChange={(e) => updateVarRow(row._key, "codigo_variacion", e.target.value)}
                                    className={`w-full rounded-lg border px-2 py-1 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                                      row._codigoManual
                                        ? "border-border bg-background"
                                        : "border-border bg-muted text-muted-foreground"
                                    }`}
                                    placeholder="auto"
                                  />
                                  {!row._codigoManual && row.codigo_variacion && (
                                    <span className="absolute right-1.5 top-1/2 -translate-y-1/2 text-[9px] text-muted-foreground/60 font-sans">
                                      auto
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  value={row.nombre_variacion}
                                  onChange={(e) => updateVarRow(row._key, "nombre_variacion", e.target.value)}
                                  className="w-full rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  placeholder="Talla S"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  value={row.talla}
                                  onChange={(e) => updateVarRow(row._key, "talla", e.target.value)}
                                  className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  placeholder="S/M/L"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  value={row.color}
                                  onChange={(e) => updateVarRow(row._key, "color", e.target.value)}
                                  className="w-16 rounded-lg border border-border bg-background px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  placeholder="Rojo"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number" min="0" step="0.01"
                                  value={row.precio_alquiler}
                                  onChange={(e) => updateVarRow(row._key, "precio_alquiler", e.target.value)}
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  placeholder="0.00"
                                />
                              </td>
                              <td className="px-2 py-1.5">
                                <input
                                  type="number" min="0" step="0.01"
                                  value={row.precio_venta}
                                  onChange={(e) => updateVarRow(row._key, "precio_venta", e.target.value)}
                                  className="w-20 rounded-lg border border-border bg-background px-2 py-1 text-xs text-right focus:outline-none focus:ring-1 focus:ring-primary/30"
                                  placeholder="0.00"
                                />
                              </td>
                            </>
                          )}
                          {/* Delete button — create mode only (edit mode has its own action column) */}
                          {!isEdit && (
                            <td className="px-2 py-1.5">
                              <button
                                type="button"
                                onClick={() => handleDeleteVar(row)}
                                className="w-6 h-6 flex items-center justify-center rounded-lg text-crimson hover:bg-crimson/10 transition-colors"
                                title="Eliminar variación"
                              >
                                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                              </button>
                            </td>
                          )}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Add variation */}
                {!isEdit ? (
                  <button
                    type="button"
                    onClick={() => setVarRows((r) => [...r, newVarRow()])}
                    className="w-full py-2.5 rounded-xl border border-dashed border-border text-sm text-muted-foreground hover:text-foreground hover:border-primary/40 hover:bg-primary/5 transition-colors"
                  >
                    + Agregar variación
                  </button>
                ) : (
                  /* Edit mode: inline form that calls API immediately */
                  <div className="rounded-xl border border-dashed border-primary/30 bg-primary/5 p-3 space-y-3">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                      Nueva variación
                    </p>
                    {/* Código auto-gen */}
                    <div>
                      <div className="flex items-center justify-between mb-0.5">
                        <label className="text-[10px] font-medium text-muted-foreground">Código</label>
                        <button
                          type="button"
                          onClick={() => {
                            setNewVarCodigoManual((m) => {
                              if (m) setNewVar((p) => ({ ...p, codigo_variacion: generateVariacionCodigo(p.talla, p.color) }));
                              return !m;
                            });
                          }}
                          className="text-[10px] text-primary hover:underline"
                        >
                          {newVarCodigoManual ? "Usar auto-generado" : "Editar manualmente"}
                        </button>
                      </div>
                      <input
                        value={newVar.codigo_variacion}
                        onChange={(e) => { setNewVarCodigoManual(true); setNewVar((p) => ({ ...p, codigo_variacion: e.target.value })); }}
                        readOnly={!newVarCodigoManual}
                        className={`w-full rounded-lg border px-2 py-1.5 text-xs font-mono focus:outline-none focus:ring-1 focus:ring-primary/30 ${
                          newVarCodigoManual
                            ? "border-border bg-background"
                            : "border-border bg-muted text-muted-foreground cursor-default"
                        }`}
                        placeholder="auto"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Nombre *</label>
                        <input
                          value={newVar.nombre_variacion}
                          onChange={(e) => setNewVar((p) => ({ ...p, nombre_variacion: e.target.value }))}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Talla S"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Talla</label>
                        <input
                          value={newVar.talla}
                          onChange={(e) => updateNewVar("talla", e.target.value)}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="S / M / L"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Color</label>
                        <input
                          value={newVar.color}
                          onChange={(e) => updateNewVar("color", e.target.value)}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="Rojo"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Alquiler/Día (BOB)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={newVar.precio_alquiler}
                          onChange={(e) => setNewVar((p) => ({ ...p, precio_alquiler: e.target.value }))}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="0.00"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-medium text-muted-foreground">Precio Venta (BOB)</label>
                        <input
                          type="number" min="0" step="0.01"
                          value={newVar.precio_venta}
                          onChange={(e) => setNewVar((p) => ({ ...p, precio_venta: e.target.value }))}
                          className="mt-0.5 w-full rounded-lg border border-border bg-background px-2 py-1.5 text-xs focus:outline-none focus:ring-1 focus:ring-primary/30"
                          placeholder="0.00"
                        />
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddVar}
                      disabled={addingVar}
                      className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 disabled:opacity-60 transition-colors"
                    >
                      {addingVar ? "Guardando…" : "+ Agregar variación"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ── Tab: Configuración ── */}
            {tab === "configuracion" && (
              <div className="space-y-4">
                <p className="text-xs text-muted-foreground">
                  Precios y disponibilidad del conjunto.
                </p>

                {/* Precios */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Precio Alquiler/Día (BOB) *</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.precio_base}
                      onChange={(e) => updateField("precio_base", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="0.00"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-muted-foreground">Precio Venta (BOB)</label>
                    <input
                      type="number" min="0" step="0.01"
                      value={form.precio_venta}
                      onChange={(e) => updateField("precio_venta", e.target.value)}
                      className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div className="border-t border-border pt-4">
                  <p className="text-xs text-muted-foreground mb-3">Disponibilidad</p>
                {([
                  {
                    key: "disponible_venta" as const,
                    label: "Disponible para venta",
                    desc: "Permite que este conjunto aparezca en el módulo de ventas",
                  },
                  {
                    key: "disponible_alquiler" as const,
                    label: "Disponible para alquiler",
                    desc: "Permite que este conjunto aparezca en el módulo de alquileres",
                  },
                ] as const).map(({ key, label, desc }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setConfig((c) => ({ ...c, [key]: !c[key] }))}
                    className={`w-full flex items-center gap-4 px-4 py-4 rounded-xl border transition-colors text-left ${
                      config[key]
                        ? "border-primary/30 bg-primary/5"
                        : "border-border bg-background hover:bg-muted/30"
                    }`}
                  >
                    {/* Toggle */}
                    <div
                      className={`relative w-11 h-6 rounded-full transition-colors shrink-0 ${
                        config[key] ? "bg-primary" : "bg-muted"
                      }`}
                    >
                      <span
                        className={`absolute top-1 left-1 w-4 h-4 rounded-full bg-white transition-transform ${
                          config[key] ? "translate-x-5" : ""
                        }`}
                      />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{label}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                    </div>
                  </button>
                ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-border space-y-3 shrink-0">
            {error && (
              <p className="text-xs text-crimson bg-crimson/10 border border-crimson/20 px-3 py-2 rounded-lg">
                {error}
              </p>
            )}
            <div className="flex gap-2">
              <Button type="button" variant="outline" className="flex-1" onClick={onClose}>
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={saving}
                className="flex-1 bg-primary text-primary-foreground"
              >
                {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear conjunto"}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Detalle Conjunto Modal ────────────────────────────────────────────────────

const ESTADO_BADGE: Record<string, { label: string; dot: string; badge: string }> = {
  DISPONIBLE:       { label: "Disponible",    dot: "bg-coca",         badge: "bg-coca/10 text-coca border-coca/20" },
  RESERVADO:        { label: "Reservado",     dot: "bg-primary",      badge: "bg-primary/10 text-primary border-primary/20" },
  ALQUILADO:        { label: "Alquilado",     dot: "bg-gold",         badge: "bg-gold/10 text-gold border-gold/20" },
  EN_TRANSFERENCIA: { label: "Transferencia", dot: "bg-amber-500",    badge: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
  DADO_DE_BAJA:     { label: "Baja",          dot: "bg-crimson",      badge: "bg-crimson/10 text-crimson border-crimson/20" },
};

function DetalleConjuntoModal({
  conjunto,
  onClose,
  onEdit,
  onInstancias,
}: {
  conjunto: Conjunto;
  onClose: () => void;
  onEdit: () => void;
  onInstancias: () => void;
}) {
  const colors = getDanzaColor(conjunto.danza);
  const { total, disponibles, alquilados, reservados, limpieza } = getStats(conjunto);
  const [selectedVarId, setSelectedVarId] = useState<number | null>(
    conjunto.variaciones[0]?.id ?? null
  );
  const selectedVar = conjunto.variaciones.find((v) => v.id === selectedVarId) ?? null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-3xl shadow-2xl flex flex-col max-h-[92vh]">

        {/* ── Header ── */}
        <div className={`${colors.bg} px-6 py-4 rounded-t-2xl flex items-start justify-between gap-3 shrink-0`}>
          <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{conjunto.danza}</span>
              {conjunto.genero && (
                <span className="text-xs font-medium text-muted-foreground/80">
                  {conjunto.genero.charAt(0) + conjunto.genero.slice(1).toLowerCase()}
                </span>
              )}
              {conjunto.codigo && (
                <span className="text-xs font-mono text-muted-foreground/60">{conjunto.codigo}</span>
              )}
            </div>
            <h2 className="font-bold text-lg leading-tight" style={{ fontFamily: "var(--font-outfit)" }}>
              {conjunto.nombre}
            </h2>
            {conjunto.descripcion && (
              <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{conjunto.descripcion}</p>
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

        {/* ── Stats strip ── */}
        <div className="grid grid-cols-5 divide-x divide-border border-b border-border shrink-0">
          {[
            { label: "Variaciones", value: conjunto.variaciones.length, color: "text-foreground",  warn: false },
            { label: "Instancias",  value: total,       color: "text-foreground",  warn: false },
            { label: "Disponibles", value: disponibles, color: "text-coca",         warn: false },
            { label: "Alquilados",  value: alquilados,  color: "text-gold",         warn: false },
            { label: "Dados de baja", value: limpieza,  color: limpieza > 0 ? "text-crimson" : "text-muted-foreground", warn: limpieza > 0 },
          ].map((s) => (
            <div key={s.label} className={`flex flex-col items-center py-3 text-center ${s.warn ? "bg-crimson/5" : ""}`}>
              <span className={`text-2xl font-bold leading-none ${s.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
                {s.value}
              </span>
              <span className={`text-[10px] mt-0.5 ${s.warn ? "text-crimson/70 font-semibold" : "text-muted-foreground"}`}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Master-detail body ── */}
        {conjunto.variaciones.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center flex-1">
            <div className="w-14 h-14 rounded-2xl bg-muted flex items-center justify-center mb-3">
              <svg className="h-7 w-7 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <p className="text-sm font-medium text-muted-foreground">Sin variaciones registradas</p>
            <button onClick={onEdit} className="mt-2 text-xs text-primary hover:underline">
              Agregar variaciones →
            </button>
          </div>
        ) : (
          <div className="flex flex-1 min-h-0">

            {/* LEFT — Variaciones sidebar */}
            <div className="w-56 border-r border-border flex flex-col shrink-0 overflow-y-auto">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground px-4 pt-3 pb-2">
                Variaciones
              </p>
              {conjunto.variaciones.map((v) => {
                const vTotal = v.instancias.length;
                const vDisp  = v.instancias.filter((i) => i.estado === "DISPONIBLE").length;
                const isSelected = v.id === selectedVarId;
                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVarId(v.id)}
                    className={`w-full text-left px-4 py-3 border-b border-border transition-colors ${
                      isSelected
                        ? "bg-primary/5 border-l-2 border-l-primary"
                        : "hover:bg-muted/40 border-l-2 border-l-transparent"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <span className="text-sm font-medium truncate leading-tight">{v.nombre_variacion}</span>
                      <span className={`text-xs font-bold tabular-nums shrink-0 ${vDisp > 0 ? "text-coca" : "text-muted-foreground"}`}>
                        {vDisp}/{vTotal}
                      </span>
                    </div>
                    <span className="text-[10px] font-mono text-muted-foreground/70">{v.codigo_variacion}</span>
                    {(v.talla || v.color) && (
                      <div className="flex gap-1 mt-1.5 flex-wrap">
                        {v.talla && (
                          <span className="text-[10px] bg-muted/70 rounded px-1.5 py-0.5 font-medium">{v.talla}</span>
                        )}
                        {v.color && (
                          <span className="text-[10px] bg-muted/70 rounded px-1.5 py-0.5 font-medium">{v.color}</span>
                        )}
                      </div>
                    )}
                  </button>
                );
              })}
            </div>

            {/* RIGHT — Instances of selected variacion */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
              {selectedVar ? (
                <>
                  {/* Variacion info header */}
                  <div className="px-5 py-3 border-b border-border bg-muted/20 shrink-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <span className="text-sm font-bold">{selectedVar.nombre_variacion}</span>
                          <span className="text-[10px] font-mono bg-muted px-1.5 py-0.5 rounded text-muted-foreground">
                            {selectedVar.codigo_variacion}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 flex-wrap">
                          {selectedVar.talla && (
                            <span className="text-xs text-muted-foreground">
                              Talla <b className="text-foreground">{selectedVar.talla}</b>
                            </span>
                          )}
                          {selectedVar.color && (
                            <span className="text-xs text-muted-foreground">
                              Color <b className="text-foreground">{selectedVar.color}</b>
                            </span>
                          )}
                          {selectedVar.precio_alquiler && (
                            <span className="text-xs text-muted-foreground">
                              Alquiler <b className="text-foreground">
                                Bs. {parseFloat(selectedVar.precio_alquiler).toLocaleString("es-BO")}/día
                              </b>
                            </span>
                          )}
                          {selectedVar.precio_venta && (
                            <span className="text-xs text-muted-foreground">
                              Venta <b className="text-foreground">
                                Bs. {parseFloat(selectedVar.precio_venta).toLocaleString("es-BO")}
                              </b>
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-2xl font-bold leading-none" style={{ fontFamily: "var(--font-outfit)" }}>
                          {selectedVar.instancias.length}
                        </p>
                        <p className="text-[10px] text-muted-foreground mt-0.5">instancias</p>
                      </div>
                    </div>

                    {/* Mini bar */}
                    {selectedVar.instancias.length > 0 && (() => {
                      const t = selectedVar.instancias.length;
                      const d = selectedVar.instancias.filter((i) => i.estado === "DISPONIBLE").length;
                      const a = selectedVar.instancias.filter((i) => i.estado === "ALQUILADO").length;
                      const r = selectedVar.instancias.filter((i) => i.estado === "RESERVADO").length;
                      return (
                        <div className="mt-2.5 space-y-1.5">
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden flex">
                            <div className="h-full bg-coca" style={{ width: `${(d / t) * 100}%` }} />
                            <div className="h-full bg-gold" style={{ width: `${(a / t) * 100}%` }} />
                            <div className="h-full bg-primary/60" style={{ width: `${(r / t) * 100}%` }} />
                          </div>
                          <div className="flex items-center gap-4">
                            {[
                              { label: "Disponibles", value: d, color: "text-coca" },
                              { label: "Alquilados",  value: a, color: "text-gold" },
                              { label: "Reservados",  value: r, color: "text-primary" },
                            ].map((s) => (
                              <span key={s.label} className="text-xs text-muted-foreground">
                                <span className={`font-bold ${s.color}`}>{s.value}</span> {s.label}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Instances table */}
                  {selectedVar.instancias.length === 0 ? (
                    <div className="flex flex-col items-center justify-center flex-1 py-10 text-center">
                      <p className="text-sm text-muted-foreground">Sin instancias para esta variación</p>
                      <button onClick={onInstancias} className="mt-2 text-xs text-primary hover:underline">
                        Agregar instancias →
                      </button>
                    </div>
                  ) : (
                    <div className="flex-1 overflow-y-auto">
                      <table className="w-full">
                        <thead className="sticky top-0 bg-card border-b border-border z-10">
                          <tr>
                            <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2.5">#</th>
                            <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2.5">Código</th>
                            <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2.5">Estado</th>
                            <th className="text-left text-xs font-semibold text-muted-foreground px-5 py-2.5">Sucursal</th>
                          </tr>
                        </thead>
                        <tbody>
                          {selectedVar.instancias.map((inst, idx) => {
                            const b = ESTADO_BADGE[inst.estado] ?? { label: inst.estado, dot: "bg-muted-foreground", badge: "bg-muted text-muted-foreground border-muted-foreground/20" };
                            return (
                              <tr key={inst.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                                <td className="px-5 py-2.5 text-xs text-muted-foreground tabular-nums">
                                  {idx + 1}
                                </td>
                                <td className="px-5 py-2.5">
                                  <span className="text-sm font-mono font-medium">{inst.codigo}</span>
                                </td>
                                <td className="px-5 py-2.5">
                                  <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2 py-0.5 rounded-full border ${b.badge}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${b.dot}`} />
                                    {b.label}
                                  </span>
                                </td>
                                <td className="px-5 py-2.5">
                                  <span className="text-xs text-muted-foreground">{inst.sucursal.nombre}</span>
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-center flex-1">
                  <p className="text-sm text-muted-foreground">Selecciona una variación</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── Footer ── */}
        <div className="px-6 py-4 border-t border-border flex gap-2 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onEdit}>
            Editar conjunto
          </Button>
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={onInstancias}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar instancias
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Crear Instancias Modal ────────────────────────────────────────────────────

function CrearInstanciasModal({
  conjunto,
  sucursales,
  token,
  backendUrl,
  onClose,
  onCreated,
  onOpenEditVariaciones,
}: {
  conjunto: Conjunto;
  sucursales: Sucursal[];
  token: string;
  backendUrl: string;
  onClose: () => void;
  onCreated: (count: number) => void;
  onOpenEditVariaciones?: () => void;
}) {
  const [form, setForm] = useState({
    variacionId: conjunto.variaciones[0]?.id ?? 0,
    sucursalId: sucursales[0]?.id ?? 0,
    cantidad: 1,
    prefijo: "INST",
  });
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const selectedVariacion = conjunto.variaciones.find((v) => v.id === form.variacionId);
  const costoUnitario = selectedVariacion?.precio_alquiler
    ? parseFloat(selectedVariacion.precio_alquiler)
    : 0;
  const costoTotal = costoUnitario * form.cantidad;

  const handleCreate = async () => {
    if (!form.variacionId || !form.sucursalId) {
      setError("Selecciona variación y sucursal");
      return;
    }
    if (!form.prefijo.trim()) {
      setError("El prefijo de serie es obligatorio");
      return;
    }
    setSaving(true);
    setError(null);
    setProgress(0);
    let created = 0;
    const errors: string[] = [];

    for (let i = 1; i <= form.cantidad; i++) {
      const codigo = `${form.prefijo.trim()}-${String(i).padStart(3, "0")}`;
      try {
        const res = await fetch(`${backendUrl}/inventario/instancias-conjunto`, {
          method: "POST",
          headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            codigo,
            variacionId: form.variacionId,
            sucursalId: form.sucursalId,
          }),
        });
        if (res.ok) {
          created++;
        } else {
          const err = await res.json().catch(() => ({}));
          const msg = Array.isArray(err.message) ? err.message[0] : (err.message ?? `Error en ${codigo}`);
          errors.push(msg);
        }
      } catch {
        errors.push(`Error de red en ${codigo}`);
      }
      setProgress(i);
    }

    setSaving(false);
    if (created > 0) {
      onCreated(created);
      if (errors.length > 0) {
        setError(`${created} creadas. Errores: ${errors.slice(0, 3).join("; ")}${errors.length > 3 ? "…" : ""}`);
      } else {
        onClose();
      }
    } else {
      setError(errors.slice(0, 3).join("; ") || "No se pudo crear ninguna instancia");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <div>
            <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
              Agregar instancias
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">{conjunto.nombre}</p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* ── Left: Form ── */}
            <div className="space-y-4">
              {/* Variación */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Variación *</label>
                {conjunto.variaciones.length === 0 ? (
                  <div className="mt-1 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 px-3 py-3 space-y-2">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                      Este conjunto aún no tiene variaciones. Debes agregar al menos una variación antes de crear instancias.
                    </p>
                    {onOpenEditVariaciones && (
                      <button
                        type="button"
                        onClick={onOpenEditVariaciones}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                        Agregar variaciones al conjunto
                      </button>
                    )}
                  </div>
                ) : (
                  <select
                    value={form.variacionId}
                    onChange={(e) => setForm((p) => ({ ...p, variacionId: Number(e.target.value) }))}
                    className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                  >
                    <option value={0}>Seleccione variación…</option>
                    {conjunto.variaciones.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.nombre_variacion}
                        {v.talla ? ` — ${v.talla}` : ""}
                        {v.color ? ` / ${v.color}` : ""}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Sucursal */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Sucursal *</label>
                <select
                  value={form.sucursalId}
                  onChange={(e) => setForm((p) => ({ ...p, sucursalId: Number(e.target.value) }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value={0}>Seleccione sucursal…</option>
                  {sucursales.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.nombre} — {s.ciudad}
                    </option>
                  ))}
                </select>
              </div>

              {/* Cantidad */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">
                  Cantidad <span className="text-muted-foreground/60">(máximo 50)</span>
                </label>
                <input
                  type="number"
                  min={1}
                  max={50}
                  value={form.cantidad}
                  onChange={(e) => setForm((p) => ({ ...p, cantidad: Math.min(50, Math.max(1, Number(e.target.value))) }))}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
              </div>

              {/* Prefijo Serie */}
              <div>
                <label className="text-xs font-medium text-muted-foreground">Prefijo Serie</label>
                <input
                  value={form.prefijo}
                  onChange={(e) => setForm((p) => ({ ...p, prefijo: e.target.value.toUpperCase() }))}
                  maxLength={10}
                  className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-primary/30"
                  placeholder="INST"
                />
                <p className="text-[10px] text-muted-foreground mt-1">Ej: INST → INST-001, INST-002…</p>
              </div>

              {/* Codes preview */}
              {form.prefijo && form.cantidad > 0 && (
                <div className="bg-muted/50 rounded-xl px-3 py-2">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">
                    Códigos que se generarán
                  </p>
                  <p className="text-xs font-mono text-foreground">
                    {Array.from({ length: Math.min(form.cantidad, 4) }, (_, i) =>
                      `${form.prefijo}-${String(i + 1).padStart(3, "0")}`
                    ).join(", ")}
                    {form.cantidad > 4 ? ` … ${form.prefijo}-${String(form.cantidad).padStart(3, "0")}` : ""}
                  </p>
                </div>
              )}
            </div>

            {/* ── Right: Preview ── */}
            <div className="space-y-3">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                Resumen
              </p>

              {/* Preview cards */}
              {[
                {
                  label: "Total Instancias",
                  value: form.cantidad,
                  color: "text-primary",
                  icon: (
                    <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                    </svg>
                  ),
                },
                {
                  label: "Estado inicial",
                  value: "DISPONIBLE",
                  color: "text-coca",
                  icon: (
                    <svg className="h-5 w-5 text-coca" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                    </svg>
                  ),
                },
                {
                  label: "Costo estimado alquiler",
                  value: costoTotal > 0 ? `Bs. ${costoTotal.toLocaleString("es-BO")}` : "—",
                  color: "text-gold",
                  icon: (
                    <svg className="h-5 w-5 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  ),
                },
              ].map((kpi) => (
                <div key={kpi.label} className="flex items-center gap-3 bg-card border border-border rounded-xl px-4 py-3">
                  <div className="shrink-0">{kpi.icon}</div>
                  <div>
                    <p className="text-xs text-muted-foreground">{kpi.label}</p>
                    <p className={`text-base font-bold leading-tight ${kpi.color}`} style={{ fontFamily: "var(--font-outfit)" }}>
                      {kpi.value}
                    </p>
                  </div>
                </div>
              ))}

              {/* Progress bar when saving */}
              {saving && (
                <div className="space-y-1.5 mt-2">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>Creando instancias…</span>
                    <span>{progress}/{form.cantidad}</span>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary transition-all"
                      style={{ width: `${(progress / form.cantidad) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border space-y-3 shrink-0">
          {error && (
            <p className="text-xs text-crimson bg-crimson/10 border border-crimson/20 px-3 py-2 rounded-lg">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <Button type="button" variant="outline" className="flex-1" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={saving || !form.variacionId || !form.sucursalId || conjunto.variaciones.length === 0}
              onClick={handleCreate}
              className="flex-1 bg-primary text-primary-foreground"
            >
              {saving
                ? `Creando ${progress}/${form.cantidad}…`
                : `Crear ${form.cantidad} instancia${form.cantidad !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm ────────────────────────────────────────────────────────────

function ConfirmDelete({
  conjunto,
  token,
  backendUrl,
  onClose,
  onDeleted,
}: {
  conjunto: Conjunto;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { total } = getStats(conjunto);

  const handleDelete = async () => {
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/catalogo/conjuntos/${conjunto.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        onDeleted(conjunto.id);
        onClose();
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message ?? "Error al eliminar");
      }
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-crimson/10 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <div>
            <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
              Desactivar conjunto
            </h2>
            <p className="text-sm text-muted-foreground">El conjunto quedará inactivo</p>
          </div>
        </div>

        <p className="text-sm">
          ¿Desactivar <span className="font-semibold">{conjunto.nombre}</span>?
          {total > 0 && (
            <span className="text-amber-600">
              {" "}Tiene {total} instancia{total !== 1 ? "s" : ""} física{total !== 1 ? "s" : ""} asociada{total !== 1 ? "s" : ""}.
            </span>
          )}
        </p>

        {error && (
          <p className="text-xs text-crimson bg-crimson/10 border border-crimson/20 px-3 py-2 rounded-lg">
            {error}
          </p>
        )}

        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            disabled={deleting}
            onClick={handleDelete}
            className="flex-1 bg-crimson text-white hover:bg-crimson/90"
          >
            {deleting ? "Desactivando…" : "Desactivar"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Export ───────────────────────────────────────────────────────────────

export function ConjuntosClient({ initialConjuntos, componentes, sucursales, token, backendUrl }: Props) {
  const [conjuntos, setConjuntos] = useState<Conjunto[]>(initialConjuntos);
  const [search, setSearch] = useState("");
  const [danzaFilter, setDanzaFilter] = useState("Todos");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [showCrear, setShowCrear] = useState(false);
  const [editando, setEditando] = useState<Conjunto | null>(null);
  const [editandoInitialTab, setEditandoInitialTab] = useState<ModalTab>("general");
  const [eliminando, setEliminando] = useState<Conjunto | null>(null);
  const [instanciando, setInstanciando] = useState<Conjunto | null>(null);
  const [viendo, setViendo] = useState<Conjunto | null>(null);

  const handleEditConjunto = (c: Conjunto, tab: ModalTab = "general") => {
    setEditandoInitialTab(tab);
    setEditando(c);
  };

  const danzasUnicas = useMemo(
    () => Array.from(new Set(conjuntos.map((c) => c.danza))).sort(),
    [conjuntos]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return conjuntos.filter((c) => {
      const matchSearch =
        !q ||
        c.nombre.toLowerCase().includes(q) ||
        c.danza.toLowerCase().includes(q) ||
        (c.descripcion?.toLowerCase().includes(q) ?? false);
      const matchDanza = danzaFilter === "Todos" || c.danza === danzaFilter;
      return matchSearch && matchDanza;
    });
  }, [conjuntos, search, danzaFilter]);

  const handleSaved = (saved: Conjunto) => {
    setConjuntos((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...prev[idx], ...saved };
        return next;
      }
      return [saved, ...prev];
    });
  };

  const handleDeleted = (id: number) => {
    setConjuntos((prev) => prev.filter((c) => c.id !== id));
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Conjuntos Folklóricos
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            {conjuntos.length} conjunto{conjuntos.length !== 1 ? "s" : ""} en catálogo
          </p>
        </div>
        <Button
          onClick={() => setShowCrear(true)}
          className="bg-primary text-primary-foreground"
          size="sm"
        >
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo conjunto
        </Button>
      </div>

      {/* Stats */}
      <StatsBar conjuntos={conjuntos} />

      {/* Filters row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <svg
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            fill="none" viewBox="0 0 24 24" stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Buscar conjunto…"
            className="w-full rounded-xl border border-border bg-background pl-9 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          />
        </div>

        {/* Danza filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {["Todos", ...danzasUnicas].map((d) => (
            <button
              key={d}
              onClick={() => setDanzaFilter(d)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
                danzaFilter === d
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:bg-muted/70"
              }`}
            >
              {d}
            </button>
          ))}
        </div>

        {/* View toggle */}
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1 ml-auto shrink-0">
          <button
            onClick={() => setViewMode("grid")}
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
              viewMode === "grid" ? "bg-background shadow-sm" : "hover:bg-muted/70"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zm10 0a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
            </svg>
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={`w-8 h-7 flex items-center justify-center rounded-lg transition-colors ${
              viewMode === "list" ? "bg-background shadow-sm" : "hover:bg-muted/70"
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>
      </div>

      {/* Content */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
          </div>
          <p className="text-muted-foreground font-medium">
            {conjuntos.length === 0 ? "No hay conjuntos registrados" : "Ningún resultado"}
          </p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            {conjuntos.length === 0
              ? "Crea el primer conjunto con el botón superior"
              : "Prueba otra búsqueda o filtro"}
          </p>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((c) => (
            <ConjuntoCard key={c.id} conjunto={c} onEdit={handleEditConjunto} onDelete={setEliminando} onInstancias={setInstanciando} onDetalle={setViendo} />
          ))}
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Nombre</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3">Danza</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden md:table-cell">Detalle</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Instancias</th>
                <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3 hidden sm:table-cell">Disponibles</th>
                <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3 hidden lg:table-cell">Precio</th>
                <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((c) => (
                <ConjuntoRow key={c.id} conjunto={c} onEdit={handleEditConjunto} onDelete={setEliminando} onDetalle={setViendo} onInstancias={setInstanciando} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modals */}
      {(showCrear || editando) && (
        <ConjuntoModal
          conjunto={editando}
          componentes={componentes}
          token={token}
          backendUrl={backendUrl}
          initialTab={editandoInitialTab}
          onClose={() => { setShowCrear(false); setEditando(null); setEditandoInitialTab("general"); }}
          onSaved={handleSaved}
        />
      )}

      {eliminando && (
        <ConfirmDelete
          conjunto={eliminando}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setEliminando(null)}
          onDeleted={handleDeleted}
        />
      )}

      {viendo && (
        <DetalleConjuntoModal
          conjunto={viendo}
          onClose={() => setViendo(null)}
          onEdit={() => { setViendo(null); handleEditConjunto(viendo); }}
          onInstancias={() => { setViendo(null); setInstanciando(viendo); }}
        />
      )}

      {instanciando && (
        <CrearInstanciasModal
          conjunto={instanciando}
          sucursales={sucursales}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setInstanciando(null)}
          onCreated={(_count) => setInstanciando(null)}
          onOpenEditVariaciones={() => {
            const c = instanciando;
            setInstanciando(null);
            handleEditConjunto(c, "variaciones");
          }}
        />
      )}
    </div>
  );
}
