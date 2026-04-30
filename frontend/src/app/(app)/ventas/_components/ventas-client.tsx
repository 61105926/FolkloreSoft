"use client";
import { useState, useMemo } from "react";
import { imprimirVenta } from "./print-venta";

// ── Types ────────────────────────────────────────────────────────────────────

type EstadoVenta = "PENDIENTE" | "PAGADO" | "ENTREGADO" | "CANCELADO";
type FormaPago = "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA";

interface Cliente { id: number; nombre: string; celular?: string | null; ci?: string | null }
interface Sucursal { id: number; nombre: string; ciudad: string; direccion?: string | null; telefono?: string | null; email?: string | null }
interface ConjuntoCatalogo { id: number; nombre: string; danza: string; precio_venta?: string | null; variaciones: VariacionOpt[] }
interface VariacionOpt { id: number; nombre_variacion: string; talla?: string | null; precio_venta?: string | null }

interface VentaItem {
  id: number; descripcion: string; cantidad: number;
  precio_unit: string; subtotal: string;
  conjunto?: { id: number; nombre: string; danza: string } | null;
  variacion?: { id: number; nombre_variacion: string; talla?: string | null } | null;
}

interface Venta {
  id: number; codigo: string; estado: EstadoVenta;
  total: string; total_pagado: string; descuento: string; forma_pago?: FormaPago | null;
  observaciones?: string | null; createdAt: string;
  cliente: { id: number; nombre: string; celular?: string | null; ci?: string | null };
  sucursal?: Sucursal | null;
  items?: VentaItem[];
  movimientosCaja?: { id: number; monto: string; forma_pago: FormaPago; createdAt: string }[];
  _count?: { items: number };
}

interface Props {
  initialVentas: Venta[];
  initialClientes: Cliente[];
  conjuntos: ConjuntoCatalogo[];
  sucursal?: Sucursal | null;
  token: string;
  backendUrl: string;
  userRol?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ESTADO_MAP: Record<EstadoVenta, { label: string; chip: string; dot: string }> = {
  PENDIENTE:  { label: "Pendiente",  chip: "bg-amber-100 text-amber-700 border-amber-300/60",   dot: "bg-amber-400" },
  PAGADO:     { label: "Pagado",     chip: "bg-emerald-100 text-emerald-700 border-emerald-300/60", dot: "bg-emerald-500" },
  ENTREGADO:  { label: "Entregado",  chip: "bg-blue-100 text-blue-700 border-blue-300/60",      dot: "bg-blue-500" },
  CANCELADO:  { label: "Cancelado",  chip: "bg-gray-100 text-gray-500 border-gray-300/60",      dot: "bg-gray-400" },
};

const FORMA_PAGO_OPTIONS: { value: FormaPago; label: string }[] = [
  { value: "EFECTIVO",      label: "Efectivo" },
  { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "QR",            label: "QR" },
  { value: "TARJETA",       label: "Tarjeta" },
];

function formatBs(v: string | number) {
  return `Bs. ${Number(v).toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}

const inp = "w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

// ── ItemRow ────────────────────────────────────────────────────────────────────

interface ItemRowState { _key: string; descripcion: string; cantidad: string; precio_unit: string; conjuntoId: string; variacionId: string }

function ItemRow({ row, conjuntos, onChange, onRemove }: {
  row: ItemRowState; conjuntos: ConjuntoCatalogo[];
  onChange: (r: ItemRowState) => void; onRemove: () => void;
}) {
  const conjunto = conjuntos.find((c) => String(c.id) === row.conjuntoId);
  const subtotal = (Number(row.cantidad) || 0) * (Number(row.precio_unit) || 0);

  return (
    <div className="grid grid-cols-12 gap-2 items-center py-2 border-b border-border/50 last:border-0">
      <div className="col-span-4">
        <select
          className={`${inp} text-xs cursor-pointer`}
          value={row.conjuntoId}
          onChange={(e) => {
            const cj = conjuntos.find((c) => String(c.id) === e.target.value);
            onChange({ ...row, conjuntoId: e.target.value, variacionId: "", descripcion: cj?.nombre ?? row.descripcion, precio_unit: cj?.precio_venta ? String(parseFloat(cj.precio_venta)) : row.precio_unit });
          }}
        >
          <option value="">— Item libre —</option>
          {conjuntos.filter((c) => c.precio_venta).map((c) => (
            <option key={c.id} value={String(c.id)}>{c.nombre} ({c.danza})</option>
          ))}
        </select>
      </div>
      <div className="col-span-1">
        {conjunto && conjunto.variaciones.length > 0 ? (
          <select
            className={`${inp} text-xs cursor-pointer`}
            value={row.variacionId}
            onChange={(e) => {
              const v = conjunto.variaciones.find((x) => String(x.id) === e.target.value);
              onChange({ ...row, variacionId: e.target.value, precio_unit: v?.precio_venta ? String(parseFloat(v.precio_venta)) : row.precio_unit });
            }}
          >
            <option value="">Var.</option>
            {conjunto.variaciones.map((v) => (
              <option key={v.id} value={String(v.id)}>{v.nombre_variacion}{v.talla ? ` T.${v.talla}` : ""}</option>
            ))}
          </select>
        ) : <div />}
      </div>
      <div className="col-span-3">
        <input className={`${inp} text-xs`} placeholder="Descripción" value={row.descripcion} onChange={(e) => onChange({ ...row, descripcion: e.target.value })} />
      </div>
      <div className="col-span-1">
        <input type="number" min="1" className={`${inp} text-xs text-center`} value={row.cantidad} onChange={(e) => onChange({ ...row, cantidad: e.target.value })} />
      </div>
      <div className="col-span-2">
        <input type="number" min="0" step="0.01" className={`${inp} text-xs text-right`} placeholder="Precio" value={row.precio_unit} onChange={(e) => onChange({ ...row, precio_unit: e.target.value })} />
      </div>
      <div className="col-span-1 flex items-center justify-between gap-1">
        <span className="text-xs font-bold text-primary">{subtotal > 0 ? `${subtotal.toFixed(0)}` : "—"}</span>
        <button onClick={onRemove} className="text-muted-foreground hover:text-red-500 transition-colors text-lg leading-none">×</button>
      </div>
    </div>
  );
}

// ── VentaModal ────────────────────────────────────────────────────────────────

function VentaModal({ venta, clientes, conjuntos, token, backendUrl, onClose, onSaved }: {
  venta?: Venta | null; clientes: Cliente[]; conjuntos: ConjuntoCatalogo[];
  token: string; backendUrl: string; onClose: () => void; onSaved: (v: Venta) => void;
}) {
  const isEdit = !!venta;
  const [clienteId, setClienteId] = useState(venta ? String(venta.cliente.id) : "");
  const [clienteSearch, setClienteSearch] = useState(venta ? venta.cliente.nombre : "");
  const [showClienteDrop, setShowClienteDrop] = useState(false);
  const [observaciones, setObservaciones] = useState(venta?.observaciones ?? "");
  const [descuento, setDescuento] = useState(venta ? String(parseFloat(venta.descuento)) : "0");

  const initItems = (): ItemRowState[] => {
    if (venta?.items?.length) {
      return venta.items.map((it) => ({
        _key: String(it.id), descripcion: it.descripcion,
        cantidad: String(it.cantidad), precio_unit: String(parseFloat(it.precio_unit)),
        conjuntoId: it.conjunto ? String(it.conjunto.id) : "",
        variacionId: it.variacion ? String(it.variacion.id) : "",
      }));
    }
    return [{ _key: "1", descripcion: "", cantidad: "1", precio_unit: "", conjuntoId: "", variacionId: "" }];
  };
  const [items, setItems] = useState<ItemRowState[]>(initItems);
  const [saving, setSaving] = useState(false);

  const clientesFiltrados = useMemo(() =>
    clientes.filter((c) => c.nombre.toLowerCase().includes(clienteSearch.toLowerCase())).slice(0, 8),
    [clientes, clienteSearch]);

  const subtotalItems = items.reduce((s, it) => s + (Number(it.cantidad) || 0) * (Number(it.precio_unit) || 0), 0);
  const desc = Number(descuento) || 0;
  const total = Math.max(0, subtotalItems - desc);

  const addItem = () => setItems((prev) => [...prev, { _key: Date.now().toString(), descripcion: "", cantidad: "1", precio_unit: "", conjuntoId: "", variacionId: "" }]);
  const updItem = (key: string, r: ItemRowState) => setItems((prev) => prev.map((x) => x._key === key ? r : x));
  const delItem = (key: string) => setItems((prev) => prev.filter((x) => x._key !== key));

  const handleSave = async () => {
    if (!clienteId) return;
    const activeItems = items.filter((it) => it.descripcion.trim() && Number(it.precio_unit) > 0);
    if (!activeItems.length) return;
    setSaving(true);
    try {
      const payload = {
        clienteId: Number(clienteId),
        observaciones, descuento: desc,
        items: activeItems.map((it) => ({
          descripcion: it.descripcion, cantidad: Number(it.cantidad) || 1,
          precio_unit: Number(it.precio_unit),
          conjuntoId: it.conjuntoId ? Number(it.conjuntoId) : undefined,
          variacionId: it.variacionId ? Number(it.variacionId) : undefined,
        })),
      };
      const url = isEdit ? `${backendUrl}/ventas/${venta!.id}` : `${backendUrl}/ventas`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, { method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` }, body: JSON.stringify(payload) });
      if (res.ok) onSaved(await res.json());
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="font-bold text-base">{isEdit ? `Editar venta ${venta!.codigo}` : "Nueva venta"}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          {/* Cliente */}
          <div className="space-y-1.5 relative">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cliente</label>
            <input
              className={inp} placeholder="Buscar cliente…"
              value={clienteSearch}
              onFocus={() => setShowClienteDrop(true)}
              onChange={(e) => { setClienteSearch(e.target.value); setClienteId(""); setShowClienteDrop(true); }}
            />
            {showClienteDrop && clientesFiltrados.length > 0 && (
              <div className="absolute top-full left-0 right-0 z-10 bg-background border border-border rounded-xl shadow-lg mt-1 max-h-48 overflow-y-auto">
                {clientesFiltrados.map((c) => (
                  <button key={c.id} className="w-full text-left px-3 py-2 text-sm hover:bg-muted/60 transition-colors"
                    onClick={() => { setClienteId(String(c.id)); setClienteSearch(c.nombre); setShowClienteDrop(false); }}>
                    <span className="font-medium">{c.nombre}</span>
                    {c.celular && <span className="text-muted-foreground text-xs ml-2">{c.celular}</span>}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Items */}
          <div className="rounded-xl border border-border overflow-hidden">
            <div className="px-4 py-2 bg-muted/40 border-b border-border/50 flex items-center justify-between">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Ítems</p>
              <div className="grid grid-cols-12 gap-2 text-[10px] text-muted-foreground font-semibold uppercase" style={{ width: "calc(100% - 60px)" }}>
                <span className="col-span-4">Conjunto</span><span className="col-span-1">Var.</span>
                <span className="col-span-3">Descripción</span><span className="col-span-1 text-center">Cant</span>
                <span className="col-span-2 text-right">Precio</span><span className="col-span-1 text-right">Sub</span>
              </div>
            </div>
            <div className="px-4">
              {items.map((it) => (
                <ItemRow key={it._key} row={it} conjuntos={conjuntos} onChange={(r) => updItem(it._key, r)} onRemove={() => delItem(it._key)} />
              ))}
            </div>
            <div className="px-4 py-2 border-t border-border/50">
              <button onClick={addItem} className="text-xs font-semibold text-primary hover:text-primary/80 transition-colors">+ Agregar ítem</button>
            </div>
          </div>

          {/* Descuento + totales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descuento (Bs.)</label>
              <input type="number" min="0" className={inp} value={descuento} onChange={(e) => setDescuento(e.target.value)} placeholder="0" />
            </div>
            <div className="rounded-xl border border-border p-3 space-y-1">
              <div className="flex justify-between text-xs text-muted-foreground"><span>Subtotal</span><span>{formatBs(subtotalItems)}</span></div>
              {desc > 0 && <div className="flex justify-between text-xs text-red-500"><span>Descuento</span><span>−{formatBs(desc)}</span></div>}
              <div className="flex justify-between text-sm font-bold border-t border-border pt-1 mt-1"><span>Total</span><span className="text-primary">{formatBs(total)}</span></div>
            </div>
          </div>

          {/* Observaciones */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Observaciones</label>
            <textarea className={`${inp} resize-none`} rows={2} value={observaciones} onChange={(e) => setObservaciones(e.target.value)} placeholder="Notas adicionales…" />
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-border flex gap-2 shrink-0">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-colors">Cancelar</button>
          <button onClick={handleSave} disabled={saving || !clienteId} className="flex-1 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear venta"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── PagoModal ─────────────────────────────────────────────────────────────────

function PagoModal({ venta, token, backendUrl, onClose, onSaved }: {
  venta: Venta; token: string; backendUrl: string; onClose: () => void; onSaved: (v: Venta) => void;
}) {
  const saldo = Math.max(0, Number(venta.total) - Number(venta.total_pagado));
  const [monto, setMonto] = useState(saldo.toFixed(2));
  const [formaPago, setFormaPago] = useState<FormaPago>("EFECTIVO");
  const [saving, setSaving] = useState(false);

  const handlePagar = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${backendUrl}/ventas/${venta.id}/pagar`, {
        method: "PATCH", headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ monto: Number(monto), forma_pago: formaPago }),
      });
      if (res.ok) onSaved(await res.json());
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-sm">Registrar pago — {venta.codigo}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="px-6 py-5 space-y-4">
          <div className="rounded-xl border border-border p-3 grid grid-cols-2 gap-2 text-sm">
            <div><p className="text-xs text-muted-foreground">Total</p><p className="font-bold">{formatBs(venta.total)}</p></div>
            <div><p className="text-xs text-muted-foreground">Saldo</p><p className="font-bold text-amber-600">{formatBs(saldo)}</p></div>
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto a pagar (Bs.)</label>
            <input type="number" min="0.01" step="0.01" className={inp} value={monto} onChange={(e) => setMonto(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forma de pago</label>
            <select className={`${inp} cursor-pointer`} value={formaPago} onChange={(e) => setFormaPago(e.target.value as FormaPago)}>
              {FORMA_PAGO_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          </div>
        </div>
        <div className="px-6 py-4 border-t border-border flex gap-2">
          <button onClick={onClose} className="flex-1 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted/60 transition-colors">Cancelar</button>
          <button onClick={handlePagar} disabled={saving || !Number(monto)} className="flex-1 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition-colors disabled:opacity-50">
            {saving ? "Registrando…" : "Confirmar pago"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── VentaDetailModal ──────────────────────────────────────────────────────────

function VentaDetailModal({ venta: initialVenta, clientes, conjuntos, token, backendUrl, onClose, onUpdated }: {
  venta: Venta; clientes: Cliente[]; conjuntos: ConjuntoCatalogo[];
  token: string; backendUrl: string; onClose: () => void; onUpdated: (v: Venta) => void;
}) {
  const [venta, setVenta] = useState(initialVenta);
  const [showEdit, setShowEdit] = useState(false);
  const [showPago, setShowPago] = useState(false);
  const [actioning, setActioning] = useState(false);

  const saldo = Math.max(0, Number(venta.total) - Number(venta.total_pagado));
  const em = ESTADO_MAP[venta.estado];

  const accion = async (endpoint: string) => {
    setActioning(true);
    try {
      const res = await fetch(`${backendUrl}/ventas/${venta.id}/${endpoint}`, { method: "PATCH", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { const upd = await res.json(); setVenta(upd); onUpdated(upd); }
    } finally { setActioning(false); }
  };

  if (showEdit) {
    return <VentaModal venta={venta} clientes={clientes} conjuntos={conjuntos} token={token} backendUrl={backendUrl}
      onClose={() => setShowEdit(false)} onSaved={(v) => { setVenta(v); setShowEdit(false); onUpdated(v); }} />;
  }

  return (
    <>
      <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
        <div className="bg-background border border-border rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
          {/* Header */}
          <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <h2 className="font-bold text-sm">{venta.codigo}</h2>
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[11px] font-semibold ${em.chip}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${em.dot}`} />{em.label}
              </span>
            </div>
            <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
            {/* Cliente */}
            <div className="rounded-xl border border-border p-3 space-y-1">
              <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Cliente</p>
              <p className="font-bold text-sm">{venta.cliente.nombre}</p>
              {venta.cliente.ci && <p className="text-xs text-muted-foreground">CI: {venta.cliente.ci}</p>}
              {venta.cliente.celular && <p className="text-xs text-muted-foreground">Tel: {venta.cliente.celular}</p>}
            </div>

            {/* Items */}
            {(venta.items ?? []).length > 0 && (
              <div className="rounded-xl border border-border overflow-hidden">
                <div className="px-4 py-2 bg-muted/40 border-b border-border/50">
                  <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Ítems</p>
                </div>
                <div className="divide-y divide-border/30">
                  {(venta.items ?? []).map((it) => (
                    <div key={it.id} className="flex items-center justify-between px-4 py-2.5">
                      <div>
                        <p className="text-sm font-medium">{it.descripcion}</p>
                        {it.variacion && <p className="text-xs text-muted-foreground">{it.variacion.nombre_variacion}{it.variacion.talla ? ` T.${it.variacion.talla}` : ""}</p>}
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">{it.cantidad} × {formatBs(it.precio_unit)}</p>
                        <p className="text-sm font-bold">{formatBs(it.subtotal)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Resumen financiero */}
            <div className="rounded-xl border border-border overflow-hidden">
              <div className="px-4 py-2 bg-muted/40 border-b border-border/50">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide">Resumen</p>
              </div>
              <div className="divide-y divide-border/30">
                {Number(venta.descuento) > 0 && (
                  <div className="flex justify-between px-4 py-2.5 text-xs text-muted-foreground">
                    <span>Descuento</span><span>−{formatBs(venta.descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-sm font-semibold">Total</span>
                  <span className="text-sm font-bold">{formatBs(venta.total)}</span>
                </div>
                <div className="flex justify-between px-4 py-2.5">
                  <span className="text-xs text-muted-foreground">Pagado</span>
                  <span className="text-sm font-semibold text-emerald-600">{formatBs(venta.total_pagado)}</span>
                </div>
                {saldo > 0.01 ? (
                  <div className="flex justify-between px-4 py-2.5 bg-amber-500/5">
                    <span className="text-xs font-semibold text-amber-600">Saldo</span>
                    <span className="text-base font-bold text-amber-600">{formatBs(saldo)}</span>
                  </div>
                ) : Number(venta.total_pagado) > 0 ? (
                  <div className="flex items-center gap-2 px-4 py-2.5 bg-emerald-500/5">
                    <span className="text-xs font-semibold text-emerald-600">✓ Pagado completo</span>
                  </div>
                ) : null}
              </div>
            </div>

            {venta.observaciones && (
              <div className="rounded-xl border border-border p-3">
                <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wide mb-1">Observaciones</p>
                <p className="text-xs">{venta.observaciones}</p>
              </div>
            )}
          </div>

          {/* Footer actions */}
          <div className="px-6 py-4 border-t border-border space-y-2 shrink-0">
            <div className="flex gap-2">
              <button onClick={() => imprimirVenta({ ...venta, items: venta.items ?? [] })} className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted/60 transition-colors">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
                Imprimir
              </button>
              {venta.estado === "PENDIENTE" && (
                <button onClick={() => setShowEdit(true)} className="flex-1 px-3 py-2 rounded-xl border border-border text-xs font-semibold hover:bg-muted/60 transition-colors">Editar</button>
              )}
            </div>
            <div className="flex gap-2">
              {venta.estado === "PENDIENTE" && (
                <button onClick={() => setShowPago(true)} className="flex-1 px-3 py-2 rounded-xl bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700 transition-colors">
                  Registrar pago
                </button>
              )}
              {venta.estado === "PAGADO" && (
                <button onClick={() => accion("entregar")} disabled={actioning} className="flex-1 px-3 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors disabled:opacity-50">
                  {actioning ? "…" : "Marcar entregado"}
                </button>
              )}
              {(venta.estado === "PENDIENTE" || venta.estado === "PAGADO") && (
                <button onClick={() => { if (confirm("¿Cancelar esta venta?")) accion("cancelar"); }} disabled={actioning} className="px-3 py-2 rounded-xl border border-red-200 text-red-500 text-xs font-semibold hover:bg-red-50 transition-colors disabled:opacity-50">
                  Cancelar
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
      {showPago && (
        <PagoModal venta={venta} token={token} backendUrl={backendUrl} onClose={() => setShowPago(false)}
          onSaved={(v) => { setVenta(v); setShowPago(false); onUpdated(v); }} />
      )}
    </>
  );
}

// ── VentasClient (main) ───────────────────────────────────────────────────────

export function VentasClient({ initialVentas, initialClientes, conjuntos, sucursal, token, backendUrl, userRol }: Props) {
  const [ventas, setVentas] = useState<Venta[]>(initialVentas);
  const [clientes] = useState<Cliente[]>(initialClientes);
  const [showCreate, setShowCreate] = useState(false);
  const [detailVenta, setDetailVenta] = useState<Venta | null>(null);
  const [estadoFilter, setEstadoFilter] = useState<EstadoVenta | "">("");
  const [busqueda, setBusqueda] = useState("");

  const handleSaved = (v: Venta) => {
    setVentas((prev) => {
      const idx = prev.findIndex((x) => x.id === v.id);
      return idx >= 0 ? prev.map((x) => x.id === v.id ? v : x) : [v, ...prev];
    });
    setShowCreate(false);
  };

  const handleUpdated = (v: Venta) => {
    setVentas((prev) => prev.map((x) => x.id === v.id ? v : x));
    if (detailVenta?.id === v.id) setDetailVenta(v);
  };

  const filtered = useMemo(() => ventas.filter((v) => {
    if (estadoFilter && v.estado !== estadoFilter) return false;
    if (busqueda) {
      const q = busqueda.toLowerCase();
      return v.codigo.toLowerCase().includes(q) || v.cliente.nombre.toLowerCase().includes(q);
    }
    return true;
  }), [ventas, estadoFilter, busqueda]);

  const totales = useMemo(() => ({
    total: ventas.reduce((s, v) => s + Number(v.total), 0),
    pagado: ventas.reduce((s, v) => s + Number(v.total_pagado), 0),
  }), [ventas]);

  return (
    <>
      <div className="flex flex-col h-full">
        {/* Header */}
        <div className="border-b border-border px-6 py-4 flex items-center justify-between gap-4 shrink-0">
          <div>
            <h1 className="text-lg font-bold">Ventas</h1>
            <p className="text-xs text-muted-foreground">{ventas.length} ventas · Total {formatBs(totales.total)} · Cobrado {formatBs(totales.pagado)}</p>
          </div>
          <button onClick={() => setShowCreate(true)} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
            Nueva venta
          </button>
        </div>

        {/* Filters */}
        <div className="px-6 py-3 border-b border-border/50 flex items-center gap-3 shrink-0">
          <input className="flex-1 max-w-xs px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" placeholder="Buscar por código o cliente…" value={busqueda} onChange={(e) => setBusqueda(e.target.value)} />
          <div className="flex gap-1.5">
            {(["", "PENDIENTE", "PAGADO", "ENTREGADO", "CANCELADO"] as (EstadoVenta | "")[]).map((e) => {
              const label = e === "" ? "Todas" : ESTADO_MAP[e as EstadoVenta].label;
              return (
                <button key={e} onClick={() => setEstadoFilter(e)} className={`px-3 py-1.5 rounded-xl border text-xs font-semibold transition-colors ${estadoFilter === e ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/60"}`}>
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-muted-foreground gap-2">
              <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
              <p className="text-sm">No hay ventas {estadoFilter ? `con estado "${ESTADO_MAP[estadoFilter as EstadoVenta].label}"` : ""}</p>
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((v) => {
                const em = ESTADO_MAP[v.estado];
                const saldo = Math.max(0, Number(v.total) - Number(v.total_pagado));
                return (
                  <button key={v.id} onClick={async () => {
                    const res = await fetch(`${backendUrl}/ventas/${v.id}`, { headers: { Authorization: `Bearer ${token}` } });
                    if (res.ok) setDetailVenta(await res.json());
                  }} className="w-full text-left rounded-xl border border-border p-4 hover:border-primary/40 hover:bg-muted/20 transition-colors">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-bold">{v.codigo}</span>
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[10px] font-semibold ${em.chip}`}>
                            <span className={`w-1 h-1 rounded-full ${em.dot}`} />{em.label}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground truncate">{v.cliente.nombre}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{formatFecha(v.createdAt)} · {v._count?.items ?? 0} ítems</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold">{formatBs(v.total)}</p>
                        {saldo > 0.01 ? (
                          <p className="text-xs text-amber-600 font-semibold">Saldo: {formatBs(saldo)}</p>
                        ) : Number(v.total_pagado) > 0 ? (
                          <p className="text-xs text-emerald-600 font-semibold">✓ Pagado</p>
                        ) : null}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {showCreate && (
        <VentaModal clientes={clientes} conjuntos={conjuntos} token={token} backendUrl={backendUrl}
          onClose={() => setShowCreate(false)} onSaved={handleSaved} />
      )}
      {detailVenta && (
        <VentaDetailModal venta={detailVenta} clientes={clientes} conjuntos={conjuntos} token={token} backendUrl={backendUrl}
          onClose={() => setDetailVenta(null)} onUpdated={handleUpdated} />
      )}
    </>
  );
}
