"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TipoMovimiento = "INGRESO" | "EGRESO";
export type FormaPago      = "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA";
export type EstadoContrato =
  | "RESERVADO" | "CONFIRMADO" | "ENTREGADO" | "EN_USO"
  | "DEVUELTO" | "CERRADO" | "CON_DEUDA" | "CON_GARANTIA_RETENIDA" | "CANCELADO";

export type ConceptoCaja =
  | "ANTICIPO_CONTRATO" | "PAGO_SALDO_CONTRATO" | "DEUDA_COBRADA"
  | "GARANTIA_EFECTIVO"
  | "DEVOLUCION_GARANTIA" | "GASTO_OPERATIVO" | "OTRO_INGRESO" | "OTRO_EGRESO";

export interface MovimientoCaja {
  id: number;
  tipo: TipoMovimiento;
  concepto: ConceptoCaja;
  monto: string;
  descripcion: string | null;
  forma_pago: FormaPago;
  referencia: string | null;
  contratoId: number | null;
  createdAt: string;
  contrato?: {
    id: number; codigo: string;
    cliente: { nombre: string };
  } | null;
}

export interface CajaStats {
  hoy: {
    ingresos: number; egresos: number; balance: number;
    porFormaPago: Partial<Record<FormaPago, number>>;
  };
  semana: { ingresos: number; egresos: number; balance: number };
  mes:    { ingresos: number; egresos: number; balance: number };
  totales: { anticipo: number; garantia: number; saldo: number };
}

export interface CuentaPorCobrar {
  id: number; codigo: string; estado: EstadoContrato;
  fecha_devolucion: string; total: string; total_pagado: string; anticipo: string;
  cliente: { id: number; nombre: string; celular: string | null };
}

// ── Constants ─────────────────────────────────────────────────────────────────

const CONCEPTO_META: Record<ConceptoCaja, { label: string; tipo: TipoMovimiento; color: string }> = {
  ANTICIPO_CONTRATO:    { label: "Anticipo",             tipo: "INGRESO", color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40" },
  PAGO_SALDO_CONTRATO:  { label: "Pago de saldo",        tipo: "INGRESO", color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40" },
  DEUDA_COBRADA:        { label: "Deuda cobrada",        tipo: "INGRESO", color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40" },
  GARANTIA_EFECTIVO:    { label: "Garantía efectivo",    tipo: "INGRESO", color: "bg-blue-500/10 text-blue-700 border-blue-300/40" },
  OTRO_INGRESO:         { label: "Otro ingreso",         tipo: "INGRESO", color: "bg-emerald-500/10 text-emerald-700 border-emerald-300/40" },
  DEVOLUCION_GARANTIA:  { label: "Dev. garantía",        tipo: "EGRESO",  color: "bg-orange-500/10 text-orange-700 border-orange-300/40" },
  GASTO_OPERATIVO:      { label: "Gasto operativo",      tipo: "EGRESO",  color: "bg-red-500/10 text-red-700 border-red-300/40" },
  OTRO_EGRESO:          { label: "Otro egreso",          tipo: "EGRESO",  color: "bg-red-500/10 text-red-700 border-red-300/40" },
};

const FORMA_PAGO_LABEL: Record<FormaPago, string> = {
  EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia", QR: "QR", TARJETA: "Tarjeta",
};

const ESTADO_CONTRATO_LABEL: Record<EstadoContrato, string> = {
  RESERVADO: "Reservado", CONFIRMADO: "Confirmado", ENTREGADO: "Entregado",
  EN_USO: "En uso", DEVUELTO: "Devuelto", CERRADO: "Cerrado",
  CON_DEUDA: "Con deuda", CON_GARANTIA_RETENIDA: "Garantía retenida", CANCELADO: "Cancelado",
};

function formatBs(n: number) {
  return `Bs. ${n.toLocaleString("es-BO", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
function formatFechaHora(iso: string) {
  return new Date(iso).toLocaleString("es-BO", {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
}
function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}
function formatFechaGrupo(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" });
}
function isSameDay(a: string, b: string) {
  return a.slice(0, 10) === b.slice(0, 10);
}

// ── Print styles injected once ─────────────────────────────────────────────────
const PRINT_STYLES = `
@media print {
  .no-print { display: none !important; }
  .print-only { display: block !important; }
  body { background: white !important; }
  .print-table { font-size: 11px; }
  .print-header { margin-bottom: 16px; }
}
@media screen { .print-only { display: none; } }
`;

// ── Stats Cards ───────────────────────────────────────────────────────────────

function StatsCards({ stats }: { stats: CajaStats }) {
  const { hoy, semana, mes, totales } = stats;
  return (
    <div className="space-y-3 no-print">
      {/* Balance hoy — hero */}
      <div className={`rounded-2xl border px-5 py-4 flex items-center justify-between gap-4 ${
        hoy.balance >= 0 ? "bg-emerald-500/5 border-emerald-300/40" : "bg-red-500/5 border-red-300/40"
      }`}>
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold">Balance del día</p>
          <p className={`text-3xl font-bold mt-0.5 ${hoy.balance >= 0 ? "text-emerald-600" : "text-red-600"}`}
             style={{ fontFamily: "var(--font-outfit)" }}>
            {formatBs(hoy.balance)}
          </p>
          <p className="text-[11px] text-muted-foreground mt-1">
            {new Date().toLocaleDateString("es-BO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
          </p>
        </div>
        <div className="text-right space-y-1 shrink-0">
          <div>
            <p className="text-base font-bold text-emerald-600">{formatBs(hoy.ingresos)}</p>
            <p className="text-[10px] text-muted-foreground">Ingresos hoy</p>
          </div>
          <div>
            <p className="text-base font-bold text-red-600">{formatBs(hoy.egresos)}</p>
            <p className="text-[10px] text-muted-foreground">Egresos hoy</p>
          </div>
        </div>
      </div>

      {/* Period + forma pago */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-card border border-border rounded-2xl px-4 py-3">
          <p className="text-base font-bold text-emerald-600">{formatBs(semana.ingresos)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos esta semana</p>
        </div>
        <div className="bg-card border border-border rounded-2xl px-4 py-3">
          <p className="text-base font-bold text-emerald-600">{formatBs(mes.ingresos)}</p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Ingresos este mes</p>
        </div>
        {Object.entries(hoy.porFormaPago).map(([fp, monto]) => (
          <div key={fp} className="bg-card border border-border rounded-2xl px-4 py-3">
            <p className="text-base font-bold text-primary">{formatBs(monto ?? 0)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">{FORMA_PAGO_LABEL[fp as FormaPago] ?? fp} hoy</p>
          </div>
        ))}
      </div>

      {/* Totales acumulados por categoría */}
      <div className="rounded-2xl border border-border bg-card px-5 py-4">
        <p className="text-[11px] text-muted-foreground uppercase tracking-wide font-semibold mb-3">Composición de ingresos (acumulado)</p>
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-300/30 px-3 py-2.5">
            <p className="text-base font-bold text-emerald-700">{formatBs(totales.anticipo)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Por anticipo</p>
          </div>
          <div className="rounded-xl bg-blue-500/5 border border-blue-300/30 px-3 py-2.5">
            <p className="text-base font-bold text-blue-700">{formatBs(totales.garantia)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Por garantía</p>
          </div>
          <div className="rounded-xl bg-emerald-500/5 border border-emerald-300/30 px-3 py-2.5">
            <p className="text-base font-bold text-emerald-700">{formatBs(totales.saldo)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Por saldo/prenda</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Registrar Movimiento Modal ────────────────────────────────────────────────

function RegistrarMovimientoModal({
  token, backendUrl, contratos, tipoInicial, pagoPreset, onClose, onSaved,
}: {
  token: string; backendUrl: string;
  contratos: CuentaPorCobrar[];
  tipoInicial?: TipoMovimiento;
  pagoPreset?: CuentaPorCobrar | null;
  onClose: () => void;
  onSaved: (m: MovimientoCaja) => void;
}) {
  const deudaPreset = pagoPreset ? Number(pagoPreset.total) - Number(pagoPreset.total_pagado) : 0;
  const [tipo,        setTipo]       = useState<TipoMovimiento>(tipoInicial ?? "INGRESO");
  const [concepto,    setConcepto]   = useState<ConceptoCaja>(tipoInicial === "EGRESO" ? "GASTO_OPERATIVO" : (pagoPreset ? "DEUDA_COBRADA" : "ANTICIPO_CONTRATO"));
  const [monto,       setMonto]      = useState(pagoPreset ? deudaPreset.toFixed(2) : "");
  const [descripcion, setDescripcion]= useState("");
  const [formaPago,   setFormaPago]  = useState<FormaPago>("EFECTIVO");
  const [referencia,  setReferencia] = useState("");
  const [contratoId,  setContratoId] = useState<number | "">(pagoPreset?.id ?? "");
  const [saving,      setSaving]     = useState(false);
  const [error,       setError]      = useState<string | null>(null);

  const conceptosFiltrados = (Object.entries(CONCEPTO_META) as [ConceptoCaja, typeof CONCEPTO_META[ConceptoCaja]][])
    .filter(([, meta]) => meta.tipo === tipo);

  const handleTipo = (t: TipoMovimiento) => {
    setTipo(t);
    const primero = Object.entries(CONCEPTO_META).find(([, meta]) => meta.tipo === t);
    if (primero) setConcepto(primero[0] as ConceptoCaja);
  };

  const handleSave = async () => {
    if (!monto || parseFloat(monto) <= 0) { setError("El monto debe ser mayor a 0"); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/caja`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          tipo, concepto,
          monto: parseFloat(monto),
          descripcion: descripcion || undefined,
          forma_pago: formaPago,
          referencia: referencia || undefined,
          contratoId: contratoId !== "" ? contratoId : undefined,
        }),
      });
      if (res.ok) { onSaved(await res.json()); onClose(); }
      else {
        const err = await res.json().catch(() => ({}));
        setError((err as { message?: string })?.message ?? "Error al registrar");
        setSaving(false);
      }
    } catch { setError("Error de red"); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl flex flex-col max-h-[90vh]">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between shrink-0">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            {tipo === "INGRESO" ? "Registrar ingreso" : "Registrar egreso"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {/* Preset banner */}
          {pagoPreset && (
            <div className="flex items-start gap-3 px-3 py-2.5 rounded-xl bg-orange-500/8 border border-orange-400/30">
              <svg className="h-4 w-4 text-orange-500 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
              <div className="text-xs">
                <p className="font-semibold text-orange-700">{pagoPreset.cliente.nombre} · {pagoPreset.codigo}</p>
                <p className="text-orange-600/80 mt-0.5">
                  Deuda pendiente: <span className="font-bold">Bs. {deudaPreset.toFixed(2)}</span> — puedes ajustar el monto si es pago parcial
                </p>
              </div>
            </div>
          )}

          {/* Tipo toggle */}
          <div className="flex rounded-xl overflow-hidden border border-border">
            {(["INGRESO", "EGRESO"] as TipoMovimiento[]).map((t) => (
              <button key={t} onClick={() => handleTipo(t)}
                className={`flex-1 py-2.5 text-sm font-semibold transition-colors ${
                  tipo === t
                    ? t === "INGRESO" ? "bg-emerald-500 text-white" : "bg-red-500 text-white"
                    : "bg-background text-muted-foreground hover:bg-muted"
                }`}>
                {t === "INGRESO" ? "↑ Ingreso" : "↓ Egreso"}
              </button>
            ))}
          </div>

          {/* Concepto */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Concepto</label>
            <div className="grid grid-cols-2 gap-1.5">
              {conceptosFiltrados.map(([key, meta]) => (
                <button key={key} onClick={() => setConcepto(key as ConceptoCaja)}
                  className={`text-left px-3 py-2 rounded-xl text-xs font-medium border transition-all ${
                    concepto === key
                      ? tipo === "INGRESO" ? "bg-emerald-500/10 border-emerald-400/60 text-emerald-700" : "bg-red-500/10 border-red-400/60 text-red-700"
                      : "bg-background border-border text-foreground hover:bg-muted"
                  }`}>
                  {meta.label}
                </button>
              ))}
            </div>
          </div>

          {/* Monto */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Monto (Bs.)</label>
            <input type="number" min="0" step="0.01" placeholder="0.00"
              value={monto} onChange={(e) => setMonto(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 text-right font-bold text-lg"
            />
          </div>

          {/* Forma pago */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Forma de pago</label>
            <div className="flex gap-1.5 flex-wrap">
              {(["EFECTIVO", "QR", "TRANSFERENCIA", "TARJETA"] as FormaPago[]).map((fp) => (
                <button key={fp} onClick={() => setFormaPago(fp)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                    formaPago === fp ? "bg-primary text-primary-foreground border-primary" : "bg-background border-border hover:bg-muted"
                  }`}>
                  {FORMA_PAGO_LABEL[fp]}
                </button>
              ))}
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Descripción <span className="font-normal">(opcional)</span></label>
            <textarea rows={2} placeholder="Notas adicionales…"
              value={descripcion} onChange={(e) => setDescripcion(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>

          {(formaPago === "TRANSFERENCIA" || formaPago === "QR") && (
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">N° de referencia</label>
              <input type="text" placeholder="Ej: TRF-20250301-001"
                value={referencia} onChange={(e) => setReferencia(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
          )}

          {/* Vincular contrato */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Vincular contrato <span className="font-normal">(opcional)</span></label>
            <select value={contratoId} onChange={(e) => setContratoId(e.target.value === "" ? "" : parseInt(e.target.value))}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
              <option value="">— Sin contrato —</option>
              {contratos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.codigo} — {c.cliente.nombre} (deuda: Bs. {(Number(c.total) - Number(c.total_pagado)).toFixed(2)})
                </option>
              ))}
            </select>
          </div>

          {error && <p className="text-xs text-red-600 text-center">{error}</p>}
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-2 shrink-0">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={saving}>Cancelar</Button>
          <Button
            className={`flex-1 text-white ${tipo === "INGRESO" ? "bg-emerald-600 hover:bg-emerald-700" : "bg-red-600 hover:bg-red-700"}`}
            onClick={handleSave} disabled={saving}>
            {saving ? "Guardando…" : tipo === "INGRESO" ? "Registrar ingreso" : "Registrar egreso"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Recibo Modal (comprobante individual) ─────────────────────────────────────

function ReciboModal({ m, onClose }: { m: MovimientoCaja; onClose: () => void }) {
  const meta = CONCEPTO_META[m.concepto];
  const isIngreso = m.tipo === "INGRESO";
  const fecha = new Date(m.createdAt);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=400,height=600");
    if (!win) return;
    win.document.write(`<!DOCTYPE html><html><head>
      <title>Comprobante #${m.id}</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; font-size: 13px; color: #111; }
        .center { text-align: center; }
        .row { display: flex; justify-content: space-between; margin: 6px 0; border-bottom: 1px dashed #ddd; padding-bottom: 4px; }
        .row:last-child { border-bottom: none; }
        .label { color: #666; }
        .amount { font-size: 22px; font-weight: bold; text-align: center; margin: 12px 0; }
        .ingreso { color: #16a34a; } .egreso { color: #dc2626; }
        h2 { margin: 0 0 4px 0; }
        .hr { border: none; border-top: 2px dashed #aaa; margin: 12px 0; }
        .footer { font-size: 10px; color: #999; text-align: center; margin-top: 16px; }
      </style>
    </head><body>
      <div class="center">
        <h2>FOLCKLORE</h2>
        <p style="margin:0;color:#666;font-size:11px">Comprobante de ${isIngreso ? "Ingreso" : "Egreso"}</p>
      </div>
      <hr class="hr" />
      <div class="row"><span class="label">N° comprobante</span><span>#${m.id}</span></div>
      <div class="row"><span class="label">Fecha</span><span>${fecha.toLocaleString("es-BO")}</span></div>
      <div class="row"><span class="label">Concepto</span><span>${meta.label}</span></div>
      <div class="row"><span class="label">Forma de pago</span><span>${FORMA_PAGO_LABEL[m.forma_pago]}</span></div>
      ${m.referencia ? `<div class="row"><span class="label">Referencia</span><span>${m.referencia}</span></div>` : ""}
      ${m.contrato ? `<div class="row"><span class="label">Contrato</span><span>${m.contrato.codigo} — ${m.contrato.cliente.nombre}</span></div>` : ""}
      ${m.descripcion ? `<div class="row"><span class="label">Descripción</span><span>${m.descripcion}</span></div>` : ""}
      <hr class="hr" />
      <div class="amount ${isIngreso ? "ingreso" : "egreso"}">${isIngreso ? "+" : "−"}${formatBs(Number(m.monto))}</div>
      <hr class="hr" />
      <div class="footer">Generado el ${new Date().toLocaleString("es-BO")}</div>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-sm">Comprobante #{m.id}</h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-3">
          {/* Amount hero */}
          <div className={`rounded-xl px-4 py-3 text-center ${isIngreso ? "bg-emerald-500/5" : "bg-red-500/5"}`}>
            <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{isIngreso ? "Ingreso" : "Egreso"}</p>
            <p className={`text-3xl font-bold mt-0.5 ${isIngreso ? "text-emerald-600" : "text-red-600"}`}>
              {isIngreso ? "+" : "−"}{formatBs(Number(m.monto))}
            </p>
          </div>

          {/* Details */}
          <div className="space-y-2 text-sm">
            {[
              ["Concepto",     meta.label],
              ["Forma de pago", FORMA_PAGO_LABEL[m.forma_pago]],
              m.referencia ? ["Referencia", m.referencia] : null,
              ["Fecha",        formatFechaHora(m.createdAt)],
              m.contrato ? ["Contrato", `${m.contrato.codigo} — ${m.contrato.cliente.nombre}`] : null,
              m.descripcion ? ["Descripción", m.descripcion] : null,
            ].filter((r): r is string[] => r !== null).map(([label, value]) => (
              <div key={label} className="flex justify-between gap-2 border-b border-border/50 pb-2 last:border-0">
                <span className="text-muted-foreground text-xs">{label}</span>
                <span className="text-xs font-medium text-right">{value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="px-6 py-4 border-t border-border flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cerrar</Button>
          <Button className="flex-1 bg-primary text-primary-foreground" onClick={handlePrint}>
            <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            Imprimir
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Movimiento Row ────────────────────────────────────────────────────────────

function MovimientoRow({
  m, onDelete, onRecibo,
}: {
  m: MovimientoCaja;
  onDelete: () => void;
  onRecibo: () => void;
}) {
  const meta = CONCEPTO_META[m.concepto];
  const monto = Number(m.monto);
  const isIngreso = m.tipo === "INGRESO";

  return (
    <div
      className="flex items-center gap-3 px-4 py-3 border-b border-border/50 last:border-0 hover:bg-muted/30 transition-colors group cursor-pointer"
      onClick={onRecibo}
    >
      {/* Icon */}
      <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 text-sm font-bold ${
        isIngreso ? "bg-emerald-500/10 text-emerald-600" : "bg-red-500/10 text-red-600"
      }`}>
        {isIngreso ? "↑" : "↓"}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className={`inline-flex text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${meta.color}`}>
            {meta.label}
          </span>
          <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-md">
            {FORMA_PAGO_LABEL[m.forma_pago]}
          </span>
          {m.referencia && (
            <span className="text-[10px] text-muted-foreground font-mono">{m.referencia}</span>
          )}
        </div>
        {m.descripcion && <p className="text-xs text-muted-foreground mt-0.5 truncate">{m.descripcion}</p>}
        {m.contrato && (
          <p className="text-[11px] text-muted-foreground mt-0.5">
            <span className="font-mono">{m.contrato.codigo}</span>
            {" — "}{m.contrato.cliente.nombre}
          </p>
        )}
        <p className="text-[10px] text-muted-foreground mt-0.5">{formatFechaHora(m.createdAt)}</p>
      </div>

      {/* Monto */}
      <div className="text-right shrink-0">
        <p className={`text-sm font-bold ${isIngreso ? "text-emerald-600" : "text-red-600"}`}>
          {isIngreso ? "+" : "−"}{formatBs(monto)}
        </p>
      </div>

      {/* Delete */}
      <button
        onClick={(e) => { e.stopPropagation(); onDelete(); }}
        className="w-7 h-7 flex items-center justify-center rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/10 text-muted-foreground hover:text-red-600 transition-all shrink-0"
        title="Eliminar movimiento"
      >
        <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
      </button>
    </div>
  );
}

// ── Cuentas por Cobrar ────────────────────────────────────────────────────────

function CuentasPorCobrarList({
  cuentas, onRegistrarPago,
}: {
  cuentas: CuentaPorCobrar[];
  onRegistrarPago: (c: CuentaPorCobrar) => void;
}) {
  if (cuentas.length === 0) {
    return (
      <div className="text-center py-16 text-muted-foreground">
        <svg className="h-10 w-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p className="text-sm font-medium">Sin deudas pendientes</p>
        <p className="text-xs mt-1">Todos los contratos activos están al día.</p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {cuentas.map((c) => {
        const deuda   = Number(c.total) - Number(c.total_pagado);
        const vencido = new Date(c.fecha_devolucion) < new Date();
        return (
          <div key={c.id} className={`bg-card border rounded-2xl px-4 py-3 flex items-center gap-3 ${vencido ? "border-amber-400/50" : "border-border"}`}>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-xs font-mono font-semibold">{c.codigo}</span>
                <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md">{ESTADO_CONTRATO_LABEL[c.estado]}</span>
                {vencido && <span className="text-[10px] font-bold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded-md border border-amber-300/40">VENCIDO</span>}
              </div>
              <p className="text-sm font-semibold mt-0.5">{c.cliente.nombre}</p>
              {c.cliente.celular && <p className="text-xs text-muted-foreground">{c.cliente.celular}</p>}
              <p className="text-[11px] text-muted-foreground mt-0.5">
                Dev: {formatFecha(c.fecha_devolucion)} · Total: {formatBs(Number(c.total))} · Pagado: {formatBs(Number(c.total_pagado))}
              </p>
            </div>
            <div className="text-right shrink-0 space-y-1.5">
              <div>
                <p className="text-base font-bold text-red-600">{formatBs(deuda)}</p>
                <p className="text-[10px] text-muted-foreground">pendiente</p>
              </div>
              <button
                onClick={() => onRegistrarPago(c)}
                className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-500/10 text-emerald-700 border border-emerald-300/40 hover:bg-emerald-500/20 transition-colors"
              >
                Registrar pago
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Print Report ──────────────────────────────────────────────────────────────

function PrintReport({
  movimientos, fechaDesde, fechaHasta,
}: {
  movimientos: MovimientoCaja[];
  fechaDesde: string;
  fechaHasta: string;
}) {
  const ingresos = movimientos.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + Number(m.monto), 0);
  const egresos  = movimientos.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + Number(m.monto), 0);

  const handlePrint = () => {
    const win = window.open("", "_blank", "width=800,height=600");
    if (!win) return;

    const rows = movimientos.map((m) => `
      <tr>
        <td>${new Date(m.createdAt).toLocaleString("es-BO")}</td>
        <td>${m.tipo === "INGRESO" ? "↑" : "↓"} ${CONCEPTO_META[m.concepto].label}</td>
        <td>${m.contrato ? `${m.contrato.codigo} — ${m.contrato.cliente.nombre}` : "—"}</td>
        <td>${FORMA_PAGO_LABEL[m.forma_pago]}</td>
        <td>${m.descripcion ?? "—"}</td>
        <td style="text-align:right;font-weight:bold;color:${m.tipo === "INGRESO" ? "#16a34a" : "#dc2626"}">
          ${m.tipo === "INGRESO" ? "+" : "−"}${formatBs(Number(m.monto))}
        </td>
      </tr>
    `).join("");

    const periodo = fechaDesde || fechaHasta
      ? `${fechaDesde ? `Desde ${fechaDesde}` : ""} ${fechaHasta ? `hasta ${fechaHasta}` : ""}`.trim()
      : "Todo el período";

    win.document.write(`<!DOCTYPE html><html><head>
      <title>Reporte de Caja — FOLCKLORE</title>
      <style>
        body { font-family: Arial, sans-serif; padding: 24px; font-size: 12px; color: #111; }
        h1 { font-size: 18px; margin: 0 0 2px 0; }
        .subtitle { color: #666; font-size: 11px; margin-bottom: 16px; }
        table { width: 100%; border-collapse: collapse; }
        th { background: #f5f5f5; padding: 6px 8px; text-align: left; font-size: 11px; border-bottom: 2px solid #ddd; }
        td { padding: 5px 8px; border-bottom: 1px solid #eee; }
        .totals { margin-top: 16px; display: flex; gap: 24px; font-weight: bold; }
        .ing { color: #16a34a; } .egr { color: #dc2626; }
        .bal { color: ${ingresos - egresos >= 0 ? "#16a34a" : "#dc2626"}; }
        .footer { margin-top: 20px; font-size: 10px; color: #999; }
      </style>
    </head><body>
      <h1>Reporte de Caja — FOLCKLORE</h1>
      <p class="subtitle">${periodo} · ${movimientos.length} movimiento(s)</p>
      <table>
        <thead><tr>
          <th>Fecha y hora</th><th>Concepto</th><th>Contrato</th><th>Forma pago</th><th>Descripción</th><th style="text-align:right">Monto</th>
        </tr></thead>
        <tbody>${rows}</tbody>
      </table>
      <div class="totals">
        <span class="ing">Ingresos: ${formatBs(ingresos)}</span>
        <span class="egr">Egresos: ${formatBs(egresos)}</span>
        <span class="bal">Balance: ${formatBs(ingresos - egresos)}</span>
      </div>
      <p class="footer">Generado el ${new Date().toLocaleString("es-BO")}</p>
    </body></html>`);
    win.document.close();
    win.print();
  };

  return (
    <button
      onClick={handlePrint}
      className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border bg-background text-sm font-medium hover:bg-muted transition-colors no-print"
    >
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
      Imprimir reporte
    </button>
  );
}

// ── Main CajaClient ───────────────────────────────────────────────────────────

export interface CurrentUser {
  id: number;
  nombre: string;
  rol: string;
  sucursalId: number | null;
  sucursal?: { id: number; nombre: string; ciudad: string } | null;
}

interface Props {
  initialMovimientos: MovimientoCaja[];
  initialStats: CajaStats;
  initialCuentas: CuentaPorCobrar[];
  token: string;
  backendUrl: string;
  currentUser?: CurrentUser | null;
}

export function CajaClient({ initialMovimientos, initialStats, initialCuentas, token, backendUrl, currentUser }: Props) {
  const [movimientos, setMovimientos] = useState<MovimientoCaja[]>(initialMovimientos);
  const [stats,       setStats]       = useState<CajaStats>(initialStats);
  const [cuentas,     setCuentas]     = useState<CuentaPorCobrar[]>(initialCuentas);
  const [activeTab,   setActiveTab]   = useState<"movimientos" | "cuentas">("movimientos");
  const [showModal,   setShowModal]   = useState(false);
  const [modalTipo,   setModalTipo]   = useState<TipoMovimiento | undefined>(undefined);
  const [pagoPreset,  setPagoPreset]  = useState<CuentaPorCobrar | null>(null);
  const [reciboM,     setReciboM]     = useState<MovimientoCaja | null>(null);

  // Filters
  const [tipoFilter,      setTipoFilter]      = useState<TipoMovimiento | "">("");
  const [conceptoFilter,  setConceptoFilter]  = useState<ConceptoCaja | "">("");
  const [formaPagoFilter, setFormaPagoFilter] = useState<FormaPago | "">("");
  const [fechaDesde,      setFechaDesde]      = useState("");
  const [fechaHasta,      setFechaHasta]      = useState("");
  const [search,          setSearch]          = useState("");

  // Date shortcuts
  const applyShortcut = (shortcut: "hoy" | "semana" | "mes") => {
    const hoy = new Date();
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    if (shortcut === "hoy") {
      setFechaDesde(fmt(hoy)); setFechaHasta(fmt(hoy));
    } else if (shortcut === "semana") {
      const ini = new Date(hoy); ini.setDate(hoy.getDate() - hoy.getDay());
      setFechaDesde(fmt(ini)); setFechaHasta(fmt(hoy));
    } else {
      setFechaDesde(fmt(new Date(hoy.getFullYear(), hoy.getMonth(), 1)));
      setFechaHasta(fmt(hoy));
    }
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return movimientos.filter((m) => {
      if (tipoFilter && m.tipo !== tipoFilter) return false;
      if (conceptoFilter && m.concepto !== conceptoFilter) return false;
      if (formaPagoFilter && m.forma_pago !== formaPagoFilter) return false;
      if (fechaDesde && new Date(m.createdAt) < new Date(fechaDesde)) return false;
      if (fechaHasta && new Date(m.createdAt) > new Date(fechaHasta + "T23:59:59")) return false;
      if (q && !m.descripcion?.toLowerCase().includes(q) &&
               !m.contrato?.codigo.toLowerCase().includes(q) &&
               !m.contrato?.cliente.nombre.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [movimientos, tipoFilter, conceptoFilter, formaPagoFilter, fechaDesde, fechaHasta, search]);

  // Group by day
  const grouped = useMemo(() => {
    const groups: { date: string; items: MovimientoCaja[] }[] = [];
    for (const m of filtered) {
      const d = m.createdAt.slice(0, 10);
      const last = groups[groups.length - 1];
      if (last && isSameDay(last.date, d)) last.items.push(m);
      else groups.push({ date: d, items: [m] });
    }
    return groups;
  }, [filtered]);

  const refreshStats = async () => {
    try {
      const res = await fetch(`${backendUrl}/caja/stats`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setStats(await res.json());
    } catch { /* ignore */ }
  };

  const refreshCuentas = async () => {
    try {
      const res = await fetch(`${backendUrl}/caja/cuentas-por-cobrar`, { headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) setCuentas(await res.json());
    } catch { /* ignore */ }
  };

  const handleSaved = (m: MovimientoCaja) => {
    setMovimientos((prev) => [m, ...prev]);
    void refreshStats();
    void refreshCuentas();
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`${backendUrl}/caja/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { setMovimientos((prev) => prev.filter((m) => m.id !== id)); void refreshStats(); }
    } catch { /* ignore */ }
  };

  const openIngreso = () => { setPagoPreset(null); setModalTipo("INGRESO"); setShowModal(true); };
  const openEgreso  = () => { setPagoPreset(null); setModalTipo("EGRESO"); setShowModal(true); };
  const clearFilters = () => {
    setTipoFilter(""); setConceptoFilter(""); setFormaPagoFilter("");
    setFechaDesde(""); setFechaHasta(""); setSearch("");
  };
  const hasFilters = !!(tipoFilter || conceptoFilter || formaPagoFilter || fechaDesde || fechaHasta || search);

  const ingresosFiltered = filtered.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + Number(m.monto), 0);
  const egresosFiltered  = filtered.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + Number(m.monto), 0);

  return (
    <>
      <style>{PRINT_STYLES}</style>

      <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between gap-3 flex-wrap no-print">
          <div>
            <h1 className="text-xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
              {currentUser?.rol === "ADMIN" ? "Caja — Vista global" : `Mi Caja`}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {currentUser ? (
                <>
                  {currentUser.nombre}
                  {currentUser.sucursal ? ` · ${currentUser.sucursal.nombre}` : ""}
                  {" · "}
                </>
              ) : null}
              {new Date().toLocaleDateString("es-BO", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })}
            </p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <PrintReport movimientos={filtered} fechaDesde={fechaDesde} fechaHasta={fechaHasta} />
            <button
              onClick={openEgreso}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-red-300/50 bg-red-500/5 text-red-700 text-sm font-semibold hover:bg-red-500/10 transition-colors"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 13l-7 7-7-7m14-8l-7 7-7-7" /></svg>
              Registrar egreso
            </button>
            <Button onClick={openIngreso} className="bg-emerald-600 hover:bg-emerald-700 text-white">
              <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" /></svg>
              Registrar ingreso
            </Button>
          </div>
        </div>

        {/* Stats */}
        <StatsCards stats={stats} />

        {/* Tabs */}
        <div className="flex gap-1 border-b border-border no-print">
          {(["movimientos", "cuentas"] as const).map((tab) => (
            <button key={tab} onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-sm font-semibold border-b-2 transition-colors -mb-px ${
                activeTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}>
              {tab === "movimientos" ? `Movimientos (${movimientos.length})` : `Cuentas por cobrar (${cuentas.length})`}
            </button>
          ))}
        </div>

        {/* Tab: Movimientos */}
        {activeTab === "movimientos" && (
          <div className="space-y-3">
            {/* Date shortcuts */}
            <div className="flex items-center gap-2 flex-wrap no-print">
              <span className="text-xs text-muted-foreground font-medium">Período:</span>
              {(["hoy", "semana", "mes"] as const).map((s) => (
                <button key={s} onClick={() => applyShortcut(s)}
                  className="px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted transition-colors capitalize">
                  {s === "hoy" ? "Hoy" : s === "semana" ? "Esta semana" : "Este mes"}
                </button>
              ))}
              <input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)}
                title="Desde"
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              <span className="text-xs text-muted-foreground">→</span>
              <input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)}
                title="Hasta"
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-primary/30" />
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                  Limpiar
                </button>
              )}
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-2 items-center no-print">
              <input type="text" placeholder="Buscar…" value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 w-40" />
              <select value={tipoFilter} onChange={(e) => setTipoFilter(e.target.value as TipoMovimiento | "")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Tipo</option>
                <option value="INGRESO">Ingreso</option>
                <option value="EGRESO">Egreso</option>
              </select>
              <select value={conceptoFilter} onChange={(e) => setConceptoFilter(e.target.value as ConceptoCaja | "")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Concepto</option>
                {(Object.entries(CONCEPTO_META) as [ConceptoCaja, typeof CONCEPTO_META[ConceptoCaja]][]).map(([k, v]) => (
                  <option key={k} value={k}>{v.label}</option>
                ))}
              </select>
              <select value={formaPagoFilter} onChange={(e) => setFormaPagoFilter(e.target.value as FormaPago | "")}
                className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
                <option value="">Forma de pago</option>
                {(["EFECTIVO", "QR", "TRANSFERENCIA", "TARJETA"] as FormaPago[]).map((fp) => (
                  <option key={fp} value={fp}>{FORMA_PAGO_LABEL[fp]}</option>
                ))}
              </select>
            </div>

            {/* Summary */}
            {filtered.length > 0 && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground bg-muted/40 rounded-xl px-3 py-2">
                <span>{filtered.length} movimiento{filtered.length !== 1 ? "s" : ""}</span>
                <span className="text-emerald-600 font-semibold">+ {formatBs(ingresosFiltered)}</span>
                <span className="text-red-600 font-semibold">− {formatBs(egresosFiltered)}</span>
                <span className={`font-bold ${ingresosFiltered - egresosFiltered >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                  = {formatBs(ingresosFiltered - egresosFiltered)}
                </span>
              </div>
            )}

            {/* List grouped by day */}
            {filtered.length === 0 ? (
              <div className="text-center py-16 text-muted-foreground">
                <svg className="h-10 w-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                <p className="text-sm font-medium">Sin movimientos</p>
                <p className="text-xs mt-1">{hasFilters ? "Prueba ajustando los filtros." : "Registra el primer movimiento de caja."}</p>
              </div>
            ) : (
              <div className="space-y-3">
                {grouped.map(({ date, items }) => {
                  const dayIng = items.filter((m) => m.tipo === "INGRESO").reduce((s, m) => s + Number(m.monto), 0);
                  const dayEgr = items.filter((m) => m.tipo === "EGRESO").reduce((s, m) => s + Number(m.monto), 0);
                  return (
                    <div key={date}>
                      {/* Day separator */}
                      <div className="flex items-center justify-between px-1 mb-1">
                        <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                          {formatFechaGrupo(date + "T12:00:00")}
                        </p>
                        <div className="flex gap-3 text-[11px]">
                          <span className="text-emerald-600 font-semibold">+{formatBs(dayIng)}</span>
                          {dayEgr > 0 && <span className="text-red-600 font-semibold">−{formatBs(dayEgr)}</span>}
                        </div>
                      </div>
                      <div className="bg-card border border-border rounded-2xl overflow-hidden">
                        {items.map((m) => (
                          <MovimientoRow
                            key={m.id} m={m}
                            onDelete={() => handleDelete(m.id)}
                            onRecibo={() => setReciboM(m)}
                          />
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Tab: Cuentas por cobrar */}
        {activeTab === "cuentas" && (
          <CuentasPorCobrarList
            cuentas={cuentas}
            onRegistrarPago={(c) => { setPagoPreset(c); setModalTipo("INGRESO"); setShowModal(true); }}
          />
        )}
      </div>

      {/* Modals */}
      {showModal && (
        <RegistrarMovimientoModal
          token={token} backendUrl={backendUrl} contratos={cuentas}
          tipoInicial={modalTipo}
          pagoPreset={pagoPreset}
          onClose={() => { setShowModal(false); setPagoPreset(null); setModalTipo(undefined); }}
          onSaved={handleSaved}
        />
      )}
      {reciboM && <ReciboModal m={reciboM} onClose={() => setReciboM(null)} />}
    </>
  );
}
