"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { ContratoModal } from "./contrato-modal";
import { imprimirContrato } from "./print-contrato";

// ── Types ──────────────────────────────────────────────────────────────────────

export type TipoEvento    = "FESTIVAL" | "CONCURSO" | "DESFILE" | "CEREMONIA" | "OTRO";
export type EstadoEvento  = "PLANIFICADO" | "CONFIRMADO" | "EN_CURSO" | "FINALIZADO" | "CANCELADO";
export type TipoContrato  = "DIRECTO" | "RESERVA";
export type EstadoContrato =
  | "RESERVADO" | "CONFIRMADO" | "ENTREGADO" | "EN_USO"
  | "DEVUELTO" | "CERRADO" | "CON_DEUDA" | "CON_GARANTIA_RETENIDA" | "CANCELADO";
export type CiudadContrato = "LA_PAZ" | "EL_ALTO" | "INTERIOR";
export type TipoGarantia  = "EFECTIVO" | "DOCUMENTO_CARNET" | "CARTA_INSTITUCIONAL" | "OTRO";
export type FormaPago      = "EFECTIVO" | "TRANSFERENCIA" | "QR" | "TARJETA";
export type TipoParticipante = "HOMBRE" | "CHOLITA" | "MACHA" | "NINO" | "OTRO";

export interface Sucursal { id: number; nombre: string; ciudad: string }

export interface VariacionOption {
  id: number;
  nombre_variacion: string;
  talla: string | null;
  color: string | null;
  codigo_variacion: string;
  precio_alquiler: string | null;
}

export interface InstanciaOption {
  id: number;
  codigo: string;
  estado: string;
}

export interface ConjuntoCatalogo {
  id: number; nombre: string; danza: string; precio_base: string;
  variaciones: VariacionOption[];
}

export interface ContratoGarantia {
  id: number; contratoId: number;
  participanteId: number | null;
  participante?: { id: number; nombre: string } | null;
  tipo: TipoGarantia;
  descripcion: string | null; valor: string | null;
  retenida: boolean; motivo_retencion: string | null; createdAt: string;
}

export interface ContratoParticipante {
  id: number; contratoId: number; prendaId: number | null;
  instanciaConjuntoId: number | null;
  instanciaConjunto?: { id: number; codigo: string; estado: string } | null;
  nombre: string; ci: string | null; celular: string | null; tipo: TipoParticipante;
  notas: string | null; devuelto: boolean; fecha_devolucion: string | null;
  garantias?: ContratoGarantia[];
  createdAt: string;
}

export interface Evento {
  id: number; nombre: string; descripcion: string | null;
  tipo: TipoEvento; estado: EstadoEvento;
  fecha_inicio: string; fecha_fin: string | null;
  lugar: string | null; sucursalId: number | null; sucursal: Sucursal | null;
  _count: { contratos: number };
}

export interface Cliente {
  id: number; nombre: string; celular: string | null; ci: string | null;
  email: string | null; rol: string;
}

export interface ContratoPrenda {
  id: number; contratoId: number; modelo: string; conjuntoId: number | null;
  variacionId: number | null;
  variacion?: { id: number; nombre_variacion: string; talla: string | null; color: string | null; codigo_variacion: string } | null;
  cantidad_hombres: number; cantidad_cholitas: number;
  cantidad_machas: number; cantidad_ninos: number;
  total: number; costo_unitario: string; subtotal: string;
  conjunto?: { id: number; nombre: string; danza: string } | null;
  participantes?: ContratoParticipante[];
}

export interface Contrato {
  id: number; codigo: string; tipo: TipoContrato; estado: EstadoContrato;
  eventoId: number | null; clienteId: number;
  nombre_evento_ext: string | null; institucion: string | null;
  ubicacion: string | null; ciudad: CiudadContrato;
  fecha_contrato: string; fecha_entrega: string; fecha_devolucion: string;
  fecha_entrega_real: string | null; fecha_devolucion_real: string | null;
  total: string; anticipo: string; total_pagado: string;
  forma_pago: FormaPago | null;
  observaciones: string | null; condiciones: string | null;
  cliente: { id: number; nombre: string; celular: string | null; ci: string | null };
  evento: { id: number; nombre: string } | null;
  prendas?: ContratoPrenda[];
  garantias?: ContratoGarantia[];
  participantes?: ContratoParticipante[];
  historial?: ContratoHistorial[];
  movimientosCaja?: MovimientoCajaContrato[];
  _count: { prendas: number; garantias: number; participantes: number };
}

export interface ContratoHistorial {
  id: number;
  tipo: string;
  descripcion: string | null;
  createdAt: string;
}

export interface MovimientoCajaContrato {
  id: number;
  tipo: "INGRESO" | "EGRESO";
  concepto: string;
  monto: string;
  descripcion: string | null;
  forma_pago: string;
  referencia: string | null;
  createdAt: string;
}

interface Props {
  initialContratos: Contrato[];
  initialClientes: Cliente[];
  initialEventos: Evento[];
  sucursales: Sucursal[];
  conjuntos: ConjuntoCatalogo[];
  token: string;
  backendUrl: string;
}

// ── Constants & Helpers ────────────────────────────────────────────────────────

export const ESTADO_EVENTO_MAP: Record<EstadoEvento, { label: string; chip: string; dot: string }> = {
  PLANIFICADO: { label: "Planificado", chip: "bg-blue-500/10 text-blue-600 border-blue-300/40",  dot: "bg-blue-500" },
  CONFIRMADO:  { label: "Confirmado",  chip: "bg-coca/10 text-coca border-coca/20",               dot: "bg-coca" },
  EN_CURSO:    { label: "En curso",    chip: "bg-gold/10 text-amber-700 border-amber-300/40",     dot: "bg-gold" },
  FINALIZADO:  { label: "Finalizado",  chip: "bg-gray-500/10 text-gray-600 border-gray-300/40",  dot: "bg-gray-400" },
  CANCELADO:   { label: "Cancelado",   chip: "bg-crimson/10 text-crimson border-crimson/20",      dot: "bg-crimson" },
};

export const ESTADO_CONTRATO_MAP: Record<EstadoContrato, { label: string; chip: string; dot: string }> = {
  RESERVADO:             { label: "Reservado",        chip: "bg-blue-500/10 text-blue-600 border-blue-300/40",     dot: "bg-blue-400" },
  CONFIRMADO:            { label: "Confirmado",        chip: "bg-coca/10 text-coca border-coca/20",                 dot: "bg-coca" },
  ENTREGADO:             { label: "Entregado",         chip: "bg-primary/10 text-primary border-primary/30",        dot: "bg-primary" },
  EN_USO:                { label: "En uso",            chip: "bg-gold/10 text-amber-700 border-amber-300/40",       dot: "bg-gold" },
  DEVUELTO:              { label: "Devuelto",          chip: "bg-emerald-500/10 text-emerald-600 border-emerald-300/40", dot: "bg-emerald-500" },
  CERRADO:               { label: "Cerrado",           chip: "bg-gray-500/10 text-gray-500 border-gray-300/40",     dot: "bg-gray-400" },
  CON_DEUDA:             { label: "Con deuda",         chip: "bg-crimson/10 text-crimson border-crimson/20",        dot: "bg-crimson" },
  CON_GARANTIA_RETENIDA: { label: "Garantía retenida", chip: "bg-orange-500/10 text-orange-600 border-orange-300/40", dot: "bg-orange-500" },
  CANCELADO:             { label: "Cancelado",         chip: "bg-muted text-muted-foreground border-border",        dot: "bg-muted-foreground" },
};

export const TIPO_EVENTO_OPTIONS: { value: TipoEvento; label: string }[] = [
  { value: "FESTIVAL", label: "Festival" }, { value: "CONCURSO", label: "Concurso" },
  { value: "DESFILE", label: "Desfile" },   { value: "CEREMONIA", label: "Ceremonia" },
  { value: "OTRO", label: "Otro" },
];

export const TIPO_GARANTIA_OPTIONS: { value: TipoGarantia; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" },
  { value: "DOCUMENTO_CARNET", label: "Documento / Carnet" },
  { value: "CARTA_INSTITUCIONAL", label: "Carta institucional" },
  { value: "OTRO", label: "Otro" },
];

export const FORMA_PAGO_OPTIONS: { value: FormaPago; label: string }[] = [
  { value: "EFECTIVO", label: "Efectivo" }, { value: "TRANSFERENCIA", label: "Transferencia" },
  { value: "QR", label: "QR" },             { value: "TARJETA", label: "Tarjeta" },
];

export const TIPO_PARTICIPANTE_OPTIONS: { value: TipoParticipante; label: string }[] = [
  { value: "HOMBRE", label: "Hombre" },
  { value: "CHOLITA", label: "Mujer" },
  { value: "MACHA", label: "Macha" },
  { value: "NINO", label: "Niño" },
  { value: "OTRO", label: "Otro" },
];

export function formatFecha(iso: string) {
  return new Date(iso).toLocaleDateString("es-BO", { day: "2-digit", month: "short", year: "numeric" });
}
export function formatBs(val: string | number) {
  return `Bs. ${parseFloat(String(val)).toLocaleString("es-BO", { minimumFractionDigits: 0 })}`;
}

/** True when a contract is overdue: expected return date passed and not yet closed/cancelled */
export function isVencido(c: Contrato): boolean {
  const ACTIVE = ["ENTREGADO", "EN_USO"] as EstadoContrato[];
  if (!ACTIVE.includes(c.estado)) return false;
  return new Date(c.fecha_devolucion) < new Date();
}

// ── Stats ──────────────────────────────────────────────────────────────────────

function ContratosStats({ contratos, activeFilter, onFilter }: {
  contratos: Contrato[];
  activeFilter: EstadoContrato | "VENCIDO" | "";
  onFilter: (f: EstadoContrato | "VENCIDO" | "") => void;
}) {
  const reservados = contratos.filter((c) => c.estado === "RESERVADO" || c.estado === "CONFIRMADO").length;
  const enUso      = contratos.filter((c) => c.estado === "EN_USO" || c.estado === "ENTREGADO").length;
  const vencidos   = contratos.filter(isVencido).length;
  const conDeuda   = contratos.filter((c) => c.estado === "CON_DEUDA").length;
  const cobrado    = contratos.reduce((s, c) => s + parseFloat(c.total_pagado), 0);

  const stats: { label: string; value: string | number; color: string; filter: EstadoContrato | "VENCIDO" | ""; sub: string | null; warn: boolean }[] = [
    { label: "Total",       value: contratos.length, color: "text-foreground", filter: "",          sub: null,                                               warn: false },
    { label: "Reservados",  value: reservados,        color: "text-blue-600",  filter: "RESERVADO", sub: null,                                               warn: false },
    { label: "En uso",      value: enUso,             color: "text-gold",      filter: "EN_USO",    sub: vencidos > 0 ? `${vencidos} vencido${vencidos > 1 ? "s" : ""}` : null, warn: vencidos > 0 },
    { label: "Con deuda",   value: conDeuda,          color: "text-crimson",   filter: "CON_DEUDA", sub: null,                                               warn: conDeuda > 0 },
    { label: "Cobrado",     value: `Bs. ${cobrado.toLocaleString("es-BO")}`, color: "text-coca", filter: "", sub: null,                                      warn: false },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {stats.map((s) => {
        const isActive = activeFilter === s.filter && s.filter !== "";
        return (
          <button
            key={s.label}
            onClick={() => s.filter !== "" && onFilter(isActive ? "" : s.filter)}
            className={`text-left rounded-2xl border px-4 py-3 transition-all ${
              isActive        ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-sm" :
              s.warn          ? "bg-card border-amber-300/50 hover:border-amber-400/70" :
              s.filter !== "" ? "bg-card border-border hover:border-primary/30 hover:shadow-sm cursor-pointer" :
                                "bg-card border-border cursor-default"
            }`}
          >
            <p className={`text-xl font-bold leading-tight ${s.color}`} style={{ fontFamily: "var(--font-outfit)" }}>{s.value}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{s.label}</p>
            {s.sub && <p className="text-[10px] text-amber-600 font-semibold mt-0.5">{s.sub}</p>}
            {isActive && <p className="text-[10px] text-primary mt-0.5">Filtrando ×</p>}
          </button>
        );
      })}
    </div>
  );
}

// ── Confirm Delete Contrato ────────────────────────────────────────────────────

function ConfirmDeleteContrato({ contrato, token, backendUrl, onClose, onDeleted }: {
  contrato: Contrato; token: string; backendUrl: string; onClose: () => void; onDeleted: (id: number) => void;
}) {
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setDeleting(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/contratos/${contrato.id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
      if (res.ok) { onDeleted(contrato.id); onClose(); }
      else { const err = await res.json().catch(() => ({})); setError(err?.message ?? "Error al eliminar"); setDeleting(false); }
    } catch { setError("Error de red"); setDeleting(false); }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-crimson/10 flex items-center justify-center mx-auto">
          <svg className="h-6 w-6 text-crimson" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <div className="text-center">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>Eliminar contrato</h2>
          <p className="text-sm text-muted-foreground mt-1">
            ¿Eliminar <span className="font-semibold text-foreground">{contrato.codigo}</span>?
          </p>
          <p className="text-xs text-muted-foreground mt-1">Esta acción no se puede deshacer. Se liberarán todas las instancias asignadas.</p>
        </div>
        {error && <p className="text-xs text-crimson text-center">{error}</p>}
        <div className="flex gap-2">
          <Button variant="outline" className="flex-1" onClick={onClose} disabled={deleting}>Cancelar</Button>
          <Button className="flex-1 bg-crimson text-white hover:bg-crimson/90" onClick={handleDelete} disabled={deleting}>{deleting ? "Eliminando…" : "Eliminar"}</Button>
        </div>
      </div>
    </div>
  );
}

// ── ContratoCard ───────────────────────────────────────────────────────────────

function ContratoCard({
  c, onOpen, onDelete, onUpdated, token, backendUrl,
}: {
  c: Contrato;
  onOpen: () => void;
  onDelete: () => void;
  onUpdated: (c: Contrato) => void;
  token: string;
  backendUrl: string;
}) {
  const estilo  = ESTADO_CONTRATO_MAP[c.estado];
  const deuda   = parseFloat(c.total) - parseFloat(c.total_pagado);
  const vencido = isVencido(c);
  const activo  = !["CERRADO", "CANCELADO"].includes(c.estado);
  const [actioning, setActioning] = useState(false);
  const [printing, setPrinting] = useState(false);

  const handlePrint = async () => {
    setPrinting(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${c.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) imprimirContrato(await res.json() as Contrato);
    } finally { setPrinting(false); }
  };

  const quickAction = async (endpoint: string) => {
    setActioning(true);
    try {
      const res = await fetch(`${backendUrl}/contratos/${c.id}/${endpoint}`, {
        method: "PATCH", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) onUpdated(await res.json());
    } finally { setActioning(false); }
  };

  const totalNum  = parseFloat(c.total) || 0;
  const pagadoNum = parseFloat(c.total_pagado) || 0;
  const pagosPct  = totalNum > 0 ? Math.min(100, Math.round((pagadoNum / totalNum) * 100)) : 0;

  return (
    <div
      className={`bg-card rounded-2xl border flex flex-col transition-all hover:shadow-md ${
        vencido ? "border-amber-400/50" : activo ? "border-border" : "border-border/50 opacity-75"
      }`}
    >
      {/* Top: código + estado */}
      <div className="px-4 pt-3.5 pb-0 flex items-start justify-between gap-2">
        <p className="text-[11px] font-mono text-muted-foreground leading-none mt-0.5">{c.codigo}</p>
        <div className="flex items-center gap-1 flex-wrap justify-end">
          {vencido && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-700 border border-amber-400/30 leading-none">
              VENCIDO
            </span>
          )}
          <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border leading-none ${estilo.chip}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${estilo.dot}`} />{estilo.label}
          </span>
        </div>
      </div>

      {/* Client */}
      <div className="px-4 pt-2 pb-3">
        <p className="text-sm font-bold leading-tight">{c.cliente.nombre}</p>
        {c.cliente.celular && <p className="text-xs text-muted-foreground mt-0.5">{c.cliente.celular}</p>}
      </div>

      {/* Event + dates */}
      <div className="px-4 py-2.5 border-t border-border/50 bg-muted/20 space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <p className="text-xs text-muted-foreground truncate flex-1">
            {c.evento?.nombre ?? c.nombre_evento_ext ?? c.institucion ?? <span className="italic">Sin evento</span>}
          </p>
          <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md shrink-0">
            {c.ciudad.replace("_", " ")}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs">
          <span className="text-muted-foreground">Ent:</span>
          <span>{formatFecha(c.fecha_entrega)}</span>
          <span className="text-muted-foreground mx-0.5">·</span>
          <span className="text-muted-foreground">Dev:</span>
          <span className={vencido ? "text-amber-600 font-semibold" : "text-muted-foreground"}>
            {formatFecha(c.fecha_devolucion)}{vencido ? " ⚠" : ""}
          </span>
        </div>
      </div>

      {/* Financials */}
      <div className={`px-4 py-2.5 border-t border-border/50 space-y-2 ${deuda > 0.01 ? "bg-red-500/3" : ""}`}>
        <div className="flex items-center gap-4">
          <div className="flex-1">
            <p className="text-base font-bold text-primary leading-none">{formatBs(c.total)}</p>
            <p className="text-[10px] text-muted-foreground mt-0.5">Total</p>
          </div>
          {pagadoNum > 0 && (
            <div>
              <p className="text-sm font-semibold text-emerald-600 leading-none">{formatBs(pagadoNum)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Cobrado</p>
            </div>
          )}
          {deuda > 0.01 && (
            <div>
              <p className="text-sm font-bold text-red-600 leading-none">{formatBs(deuda)}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">Pendiente</p>
            </div>
          )}
        </div>
        {/* Payment progress bar */}
        {totalNum > 0 && (
          <div className="space-y-0.5">
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${pagosPct >= 100 ? "bg-emerald-500" : pagosPct > 0 ? "bg-primary" : "bg-muted-foreground/20"}`}
                style={{ width: `${pagosPct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground text-right">{pagosPct}% cobrado</p>
          </div>
        )}
      </div>

      {/* Footer: counts + actions */}
      <div className="px-4 pb-3.5 pt-2 border-t border-border/50 flex items-center justify-between gap-2">
        <div className="flex flex-col gap-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground flex-wrap">
            {c._count.prendas > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                {c._count.prendas} prendas
              </span>
            )}
            {c._count.garantias > 0 && (
              <span className="flex items-center gap-0.5">
                <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                {c._count.garantias} garantías
              </span>
            )}
          </div>
          {c._count.participantes > 0 && (() => {
            const total     = c._count.participantes;
            const devueltos = (c.participantes ?? []).filter((p) => p.devuelto).length;
            const pct       = Math.round((devueltos / total) * 100);
            const allBack   = devueltos === total;
            return (
              <div className="space-y-0.5">
                <div className="flex items-center justify-between gap-1">
                  <span className="flex items-center gap-0.5 text-[11px] text-muted-foreground">
                    <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                    {devueltos}/{total} devolvieron
                  </span>
                  <span className={`text-[10px] font-semibold ${allBack ? "text-emerald-600" : "text-muted-foreground"}`}>{pct}%</span>
                </div>
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${allBack ? "bg-emerald-500" : "bg-primary"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })()}
        </div>
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => void handlePrint()}
            disabled={printing}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors disabled:opacity-50"
            title="Imprimir comprobante"
          >
            {printing
              ? <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v4m0 8v4M4 12h4m8 0h4" /></svg>
              : <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 9V2h12v7M6 18H4a2 2 0 01-2-2v-5a2 2 0 012-2h16a2 2 0 012 2v5a2 2 0 01-2 2h-2M6 14h12v8H6v-8z" /></svg>
            }
          </button>
          <button
            onClick={onDelete}
            className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-crimson/10 text-muted-foreground hover:text-crimson transition-colors"
            title="Eliminar contrato"
          >
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </button>
          {/* Quick lifecycle actions */}
          {c.estado === "RESERVADO" && (
            <button
              onClick={() => void quickAction("confirmar")}
              disabled={actioning}
              className="px-2.5 py-1.5 rounded-xl bg-blue-500/10 text-blue-700 dark:text-blue-400 text-xs font-semibold hover:bg-blue-500/20 transition-colors disabled:opacity-50"
              title="Confirmar contrato"
            >
              {actioning ? "…" : "Confirmar"}
            </button>
          )}
          {c.estado === "CONFIRMADO" && (
            <button
              onClick={() => void quickAction("entregar")}
              disabled={actioning}
              className="px-2.5 py-1.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-400 text-xs font-semibold hover:bg-amber-500/20 transition-colors disabled:opacity-50"
              title="Marcar como entregado"
            >
              {actioning ? "…" : "Entregar"}
            </button>
          )}
          {(c.estado === "ENTREGADO" || c.estado === "EN_USO") && (
            <button
              onClick={() => void quickAction("devolver")}
              disabled={actioning}
              className="px-2.5 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
              title="Marcar como devuelto"
            >
              {actioning ? "…" : "Devolver"}
            </button>
          )}
          <button
            onClick={onOpen}
            className="px-3 py-1.5 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition-colors"
          >
            Gestionar →
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ContratosClient ───────────────────────────────────────────────────────

export function ContratosClient({ initialContratos, initialClientes, initialEventos, sucursales, conjuntos, token, backendUrl }: Props) {
  const [contratos, setContratos] = useState<Contrato[]>(initialContratos);
  const [clientes, setClientes] = useState<Cliente[]>(initialClientes);
  const [eventos, setEventos] = useState<Evento[]>(initialEventos);

  // Filters & sort
  const [eventoFilter, setEventoFilter] = useState<number | "">("");
  const [search, setSearch] = useState("");
  const [estadoFilter, setEstadoFilter] = useState<EstadoContrato | "VENCIDO" | "">("");
  const [ciudadFilter, setCiudadFilter] = useState<CiudadContrato | "">("");
  const [sortBy, setSortBy] = useState<"reciente" | "urgente">("reciente");

  // Modals
  const [showContratoModal, setShowContratoModal] = useState(false);
  const [editandoContrato, setEditandoContrato] = useState<Contrato | null>(null);
  const [eliminandoContrato, setEliminandoContrato] = useState<Contrato | null>(null);
  const [contratoEventoPreset, setContratoEventoPreset] = useState<Evento | null>(null);

  // Event counts per evento
  const eventoCounts = useMemo(() => {
    const map: Record<number, number> = {};
    contratos.forEach((c) => { if (c.eventoId) map[c.eventoId] = (map[c.eventoId] ?? 0) + 1; });
    return map;
  }, [contratos]);

  // Filtered + sorted contratos
  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    const list = contratos.filter((c) =>
      (eventoFilter === "" || c.eventoId === eventoFilter) &&
      (estadoFilter === "" || estadoFilter === "VENCIDO" ? estadoFilter === "" || isVencido(c) : c.estado === estadoFilter) &&
      (!ciudadFilter || c.ciudad === ciudadFilter) &&
      (!q ||
        c.codigo.toLowerCase().includes(q) ||
        c.cliente.nombre.toLowerCase().includes(q) ||
        (c.nombre_evento_ext ?? "").toLowerCase().includes(q) ||
        (c.evento?.nombre ?? "").toLowerCase().includes(q) ||
        (c.institucion ?? "").toLowerCase().includes(q)
      )
    );
    if (sortBy === "urgente") {
      return [...list].sort((a, b) => {
        // Active contracts sorted by closest devolucion; closed last
        const aActive = !["CERRADO", "CANCELADO"].includes(a.estado);
        const bActive = !["CERRADO", "CANCELADO"].includes(b.estado);
        if (aActive !== bActive) return aActive ? -1 : 1;
        return new Date(a.fecha_devolucion).getTime() - new Date(b.fecha_devolucion).getTime();
      });
    }
    return list; // default: already sorted by createdAt desc from API
  }, [contratos, eventoFilter, estadoFilter, ciudadFilter, search, sortBy]);

  const handleEventoSaved = (saved: Evento) => setEventos((prev) => {
    const idx = prev.findIndex((e) => e.id === saved.id);
    if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
    return [saved, ...prev];
  });

  const handleContratoSaved = (saved: Contrato) => {
    setContratos((prev) => {
      const idx = prev.findIndex((c) => c.id === saved.id);
      if (idx >= 0) { const n = [...prev]; n[idx] = saved; return n; }
      return [saved, ...prev];
    });
  };

  const handleContratoDeleted = (id: number) => {
    setContratos((prev) => prev.filter((c) => c.id !== id));
  };

  const openNuevoContrato = () => {
    setEditandoContrato(null);
    setContratoEventoPreset(null);
    setShowContratoModal(true);
  };

  const openEditContrato = (c: Contrato) => {
    setEditandoContrato(c);
    setContratoEventoPreset(null);
    setShowContratoModal(true);
  };

  const anyFilter = search || estadoFilter || ciudadFilter || eventoFilter !== "";
  const vencidosList = contratos.filter(isVencido);

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Contratos de Alquiler</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestión de contratos de vestuario folklórico</p>
        </div>
        <Button className="bg-primary text-primary-foreground shrink-0" onClick={openNuevoContrato}>
          <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nuevo contrato
        </Button>
      </div>

      {/* Stats — clickable */}
      <ContratosStats contratos={contratos} activeFilter={estadoFilter} onFilter={setEstadoFilter} />

      {/* Vencidos alert banner */}
      {vencidosList.length > 0 && (
        <div className="rounded-2xl bg-amber-500/10 border border-amber-400/30 px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <svg className="h-4 w-4 text-amber-600 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            <p className="text-sm font-semibold text-amber-700">
              {vencidosList.length} contrato{vencidosList.length > 1 ? "s" : ""} vencido{vencidosList.length > 1 ? "s" : ""}
            </p>
            <div className="flex flex-wrap gap-1">
              {vencidosList.slice(0, 3).map((c) => (
                <button
                  key={c.id}
                  onClick={() => openEditContrato(c)}
                  className="text-xs text-amber-700 bg-amber-500/20 px-2 py-0.5 rounded-full font-mono hover:bg-amber-500/30 transition-colors"
                >
                  {c.codigo}
                </button>
              ))}
              {vencidosList.length > 3 && <span className="text-xs text-amber-600">+{vencidosList.length - 3} más</span>}
            </div>
          </div>
          <button
            onClick={() => setEstadoFilter(estadoFilter === "VENCIDO" ? "" : "VENCIDO")}
            className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all whitespace-nowrap ${
              estadoFilter === "VENCIDO"
                ? "bg-amber-500 text-white border-amber-500"
                : "bg-amber-500/10 text-amber-700 border-amber-400/30 hover:bg-amber-500/20"
            }`}
          >
            {estadoFilter === "VENCIDO" ? "Mostrando vencidos ×" : "Ver vencidos →"}
          </button>
        </div>
      )}

      {/* Event filter chips + sort */}
      <div className="flex flex-wrap gap-2 items-center">
        <button
          onClick={() => setEventoFilter("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
            eventoFilter === "" ? "bg-primary/10 text-primary border-primary/30" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
          }`}
        >
          Todos <span className="ml-1 opacity-60">{contratos.length}</span>
        </button>
        {eventos.map((e) => {
          const count = eventoCounts[e.id] ?? 0;
          const active = eventoFilter === e.id;
          return (
            <button
              key={e.id}
              onClick={() => setEventoFilter(active ? "" : e.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all ${
                active ? "bg-primary/10 text-primary border-primary/30" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"
              }`}
            >
              <span>{e.nombre}</span>
              <span className="opacity-60">{count}</span>
            </button>
          );
        })}

        {/* Sort toggle — right side */}
        <div className="ml-auto flex items-center gap-1 rounded-xl border border-border bg-muted/30 p-0.5">
          {([["reciente", "Recientes"], ["urgente", "Urgentes"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setSortBy(val)}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                sortBy === val ? "bg-background shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Search + filters */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/40"
            placeholder="Código, cliente, evento, institución…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button onClick={() => setSearch("")} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          )}
        </div>
        <select
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          value={typeof estadoFilter === "string" && !["VENCIDO"].includes(estadoFilter) ? estadoFilter : ""}
          onChange={(e) => setEstadoFilter(e.target.value as EstadoContrato | "")}
        >
          <option value="">Todos los estados</option>
          {(Object.keys(ESTADO_CONTRATO_MAP) as EstadoContrato[]).map((s) => (
            <option key={s} value={s}>{ESTADO_CONTRATO_MAP[s].label}</option>
          ))}
        </select>
        <select
          className="rounded-xl border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 cursor-pointer"
          value={ciudadFilter}
          onChange={(e) => setCiudadFilter(e.target.value as CiudadContrato | "")}
        >
          <option value="">Todas las ciudades</option>
          <option value="LA_PAZ">La Paz</option>
          <option value="EL_ALTO">El Alto</option>
          <option value="INTERIOR">Interior</option>
        </select>
      </div>

      {/* Results count */}
      {anyFilter && (
        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">{filtered.length} resultado{filtered.length !== 1 ? "s" : ""}</p>
          <button onClick={() => { setSearch(""); setEstadoFilter(""); setCiudadFilter(""); setEventoFilter(""); }} className="text-xs text-primary hover:underline">Limpiar filtros</button>
        </div>
      )}

      {/* Cards grid */}
      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <p className="font-semibold text-muted-foreground">{anyFilter ? "Sin resultados para los filtros actuales" : "No hay contratos aún"}</p>
          {anyFilter
            ? <button onClick={() => { setSearch(""); setEstadoFilter(""); setCiudadFilter(""); setEventoFilter(""); }} className="mt-2 text-sm text-primary hover:underline">Limpiar filtros →</button>
            : <button onClick={openNuevoContrato} className="mt-2 text-sm text-primary hover:underline">Crear el primer contrato →</button>
          }
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((c) => (
            <ContratoCard
              key={c.id}
              c={c}
              onOpen={() => openEditContrato(c)}
              onDelete={() => setEliminandoContrato(c)}
              onUpdated={handleContratoSaved}
              token={token}
              backendUrl={backendUrl}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      {showContratoModal && (
        <ContratoModal
          contrato={editandoContrato}
          eventoPreset={contratoEventoPreset}
          clientes={clientes}
          conjuntos={conjuntos}
          token={token}
          backendUrl={backendUrl}
          onClose={() => { setShowContratoModal(false); setEditandoContrato(null); setContratoEventoPreset(null); }}
          onSaved={(c) => { handleContratoSaved(c); setShowContratoModal(false); setEditandoContrato(null); setContratoEventoPreset(null); }}
          onDeleted={(id) => { handleContratoDeleted(id); setShowContratoModal(false); setEditandoContrato(null); }}
          onClienteCreado={(cl) => setClientes((prev) => [...prev, cl])}
        />
      )}
      {eliminandoContrato && (
        <ConfirmDeleteContrato
          contrato={eliminandoContrato} token={token} backendUrl={backendUrl}
          onClose={() => setEliminandoContrato(null)}
          onDeleted={(id) => { handleContratoDeleted(id); setEliminandoContrato(null); }}
        />
      )}
    </div>
  );
}
