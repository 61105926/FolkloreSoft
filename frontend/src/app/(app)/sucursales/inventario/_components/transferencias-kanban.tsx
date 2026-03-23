"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Transferencia } from "../page";

interface Sucursal { id: number; nombre: string; ciudad: string }
interface InstanciaDisponible {
  id: number;
  codigo: string;
  estado: string;
  variacion: { conjunto: { nombre: string; danza: string } };
  sucursal: { id: number; nombre: string };
}

interface StatsSucursal {
  sucursalId: number;
  nombre: string;
  ciudad: string;
  disponible: number;
  alquilado: number;
  enTransferencia: number;
  dadoDeBaja: number;
  total: number;
}

interface Props {
  initialTransferencias: Transferencia[];
  sucursales: Sucursal[];
  instanciasDisponibles: InstanciaDisponible[];
  statsSucursales: StatsSucursal[];
  token: string;
  backendUrl: string;
}

const COLUMNS: { estado: Transferencia["estado"]; label: string; color: string; dotColor: string }[] = [
  { estado: "SOLICITADO", label: "Solicitado", color: "border-gold/30 bg-gold/5", dotColor: "bg-gold" },
  { estado: "EN_TRANSITO", label: "En Tránsito", color: "border-primary/30 bg-primary/5", dotColor: "bg-primary" },
  { estado: "RECIBIDO", label: "Recibido", color: "border-coca/30 bg-coca/5", dotColor: "bg-coca" },
];

function TransferenciaCard({
  t,
  onAdvance,
  advancing,
}: {
  t: Transferencia;
  onAdvance?: () => void;
  advancing: boolean;
}) {
  const date = new Date(t.createdAt).toLocaleDateString("es-BO", {
    day: "2-digit",
    month: "short",
  });

  return (
    <div className="bg-card border border-border rounded-xl p-3 space-y-2 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="font-mono text-xs font-bold text-primary">{t.instanciaConjunto.codigo}</p>
          <p className="text-xs font-medium truncate">{t.instanciaConjunto.variacion.conjunto.nombre}</p>
          <p className="text-xs text-muted-foreground">{t.instanciaConjunto.variacion.conjunto.danza}</p>
        </div>
        <span className="text-xs text-muted-foreground shrink-0">{date}</span>
      </div>

      <div className="flex items-center gap-1 text-xs text-muted-foreground">
        <span className="truncate">{t.sucursalOrigen.nombre}</span>
        <svg className="h-3 w-3 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
        </svg>
        <span className="truncate">{t.sucursalDestino.nombre}</span>
      </div>

      {t.notas && (
        <p className="text-xs text-muted-foreground/70 italic line-clamp-1">{t.notas}</p>
      )}

      {onAdvance && (
        <Button
          size="sm"
          variant="outline"
          className="w-full text-xs h-7"
          onClick={onAdvance}
          disabled={advancing}
        >
          {advancing ? "Actualizando…" : t.estado === "SOLICITADO" ? "Marcar En Tránsito" : "Confirmar Recepción"}
        </Button>
      )}
    </div>
  );
}

function NuevaTransferenciaForm({
  sucursales,
  instanciasDisponibles,
  token,
  backendUrl,
  onCreated,
}: {
  sucursales: Sucursal[];
  instanciasDisponibles: InstanciaDisponible[];
  token: string;
  backendUrl: string;
  onCreated: (t: Transferencia) => void;
}) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState({
    instanciaConjuntoId: "",
    sucursalOrigenId: "",
    sucursalDestinoId: "",
    notas: "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedInstancia = instanciasDisponibles.find(
    (i) => i.id === Number(form.instanciaConjuntoId)
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instanciaConjuntoId || !form.sucursalOrigenId || !form.sucursalDestinoId) {
      setError("Completa todos los campos requeridos");
      return;
    }
    if (form.sucursalOrigenId === form.sucursalDestinoId) {
      setError("Origen y destino deben ser distintos");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/transferencias`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          instanciaConjuntoId: Number(form.instanciaConjuntoId),
          sucursalOrigenId: Number(form.sucursalOrigenId),
          sucursalDestinoId: Number(form.sucursalDestinoId),
          notas: form.notas || undefined,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        onCreated(data);
        setForm({ instanciaConjuntoId: "", sucursalOrigenId: "", sucursalDestinoId: "", notas: "" });
        setOpen(false);
      } else {
        const err = await res.json().catch(() => ({}));
        setError(err.message ?? "Error al crear la transferencia");
      }
    } finally {
      setSaving(false);
    }
  };

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} className="bg-primary text-primary-foreground" size="sm">
        <svg className="h-4 w-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Nueva transferencia
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg" style={{ fontFamily: "var(--font-outfit)" }}>
            Nueva Transferencia
          </h2>
          <button onClick={() => setOpen(false)} className="w-8 h-8 rounded-xl flex items-center justify-center hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label className="text-xs font-medium text-muted-foreground">Conjunto físico *</label>
            <select
              value={form.instanciaConjuntoId}
              onChange={(e) => {
                const inst = instanciasDisponibles.find((i) => i.id === Number(e.target.value));
                setForm((p) => ({
                  ...p,
                  instanciaConjuntoId: e.target.value,
                  sucursalOrigenId: inst ? String(inst.sucursal.id) : p.sucursalOrigenId,
                }));
              }}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">Seleccionar…</option>
              {instanciasDisponibles.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.codigo} — {i.variacion.conjunto.nombre} ({i.sucursal.nombre})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">Origen *</label>
              <select
                value={form.sucursalOrigenId}
                onChange={(e) => setForm((p) => ({ ...p, sucursalOrigenId: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Seleccionar…</option>
                {sucursales.map((s) => (
                  <option key={s.id} value={s.id}>{s.nombre}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">Destino *</label>
              <select
                value={form.sucursalDestinoId}
                onChange={(e) => setForm((p) => ({ ...p, sucursalDestinoId: e.target.value }))}
                className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">Seleccionar…</option>
                {sucursales
                  .filter((s) => String(s.id) !== form.sucursalOrigenId)
                  .map((s) => (
                    <option key={s.id} value={s.id}>{s.nombre}</option>
                  ))}
              </select>
            </div>
          </div>

          {selectedInstancia && (
            <div className="px-3 py-2 rounded-xl bg-muted/50 text-xs text-muted-foreground">
              {selectedInstancia.variacion.conjunto.nombre} · {selectedInstancia.variacion.conjunto.danza}
            </div>
          )}

          <div>
            <label className="text-xs font-medium text-muted-foreground">Notas (opcional)</label>
            <textarea
              value={form.notas}
              onChange={(e) => setForm((p) => ({ ...p, notas: e.target.value }))}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border bg-background px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Observaciones…"
            />
          </div>

          {error && (
            <p className="text-xs text-crimson bg-crimson/10 border border-crimson/20 px-3 py-2 rounded-lg">{error}</p>
          )}

          <div className="flex gap-2 pt-1">
            <Button type="button" variant="outline" className="flex-1" onClick={() => setOpen(false)}>Cancelar</Button>
            <Button type="submit" disabled={saving} className="flex-1 bg-primary text-primary-foreground">
              {saving ? "Creando…" : "Crear transferencia"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function TransferenciasKanban({ initialTransferencias, sucursales, instanciasDisponibles, statsSucursales, token, backendUrl }: Props) {
  const [transferencias, setTransferencias] = useState<Transferencia[]>(initialTransferencias);
  const [advancing, setAdvancing] = useState<number | null>(null);

  const handleAdvance = async (t: Transferencia) => {
    const endpoint =
      t.estado === "SOLICITADO"
        ? `${backendUrl}/transferencias/${t.id}/en-transito`
        : `${backendUrl}/transferencias/${t.id}/recibir`;

    setAdvancing(t.id);
    try {
      const res = await fetch(endpoint, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const updated: Transferencia = await res.json();
        setTransferencias((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
      }
    } finally {
      setAdvancing(null);
    }
  };

  const handleCreated = (t: Transferencia) => {
    setTransferencias((prev) => [t, ...prev]);
  };

  return (
    <div className="space-y-6">
      {/* Stats por sucursal */}
      {statsSucursales.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {statsSucursales.map((s) => (
            <div key={s.sucursalId} className="flex-1 min-w-50 rounded-2xl border border-border bg-card p-4 space-y-2">
              <div>
                <p className="font-semibold text-sm">{s.nombre}</p>
                <p className="text-xs text-muted-foreground">{s.ciudad} · {s.total} total</p>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-green-500 shrink-0" /><span className="text-muted-foreground">{s.disponible} disponibles</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-red-500 shrink-0" /><span className="text-muted-foreground">{s.alquilado} alquilados</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" /><span className="text-muted-foreground">{s.enTransferencia} en tránsito</span></div>
                <div className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-gray-400 shrink-0" /><span className="text-muted-foreground">{s.dadoDeBaja} de baja</span></div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Sucursales — Transferencias
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Mueve indumentaria entre sucursales
          </p>
        </div>
        <NuevaTransferenciaForm
          sucursales={sucursales}
          instanciasDisponibles={instanciasDisponibles}
          token={token}
          backendUrl={backendUrl}
          onCreated={handleCreated}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {COLUMNS.map((col) => {
          const cards = transferencias.filter((t) => t.estado === col.estado);
          return (
            <div key={col.estado} className={`rounded-2xl border-2 ${col.color} p-4 space-y-3 min-h-[20rem]`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${col.dotColor}`} />
                  <span className="text-sm font-semibold">{col.label}</span>
                </div>
                <Badge variant="secondary" className="text-xs">{cards.length}</Badge>
              </div>
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 opacity-40">
                  <svg className="h-8 w-8 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                      d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <p className="text-xs text-muted-foreground mt-2">Sin transferencias</p>
                </div>
              ) : (
                cards.map((t) => (
                  <TransferenciaCard
                    key={t.id}
                    t={t}
                    onAdvance={col.estado !== "RECIBIDO" ? () => handleAdvance(t) : undefined}
                    advancing={advancing === t.id}
                  />
                ))
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
