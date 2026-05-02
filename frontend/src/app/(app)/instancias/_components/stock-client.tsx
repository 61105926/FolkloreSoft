"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";

// ── Types ─────────────────────────────────────────────────────────────────────

type Variacion = {
  id: number;
  nombre_variacion: string;
  talla: string | null;
  color: string | null;
  stock: number;
};

type Conjunto = {
  id: number;
  nombre: string;
  danza: string;
  imagen_url: string | null;
  stockTotal: number;
  variaciones: Variacion[];
};

type Movimiento = {
  id: number;
  tipo: string;
  cantidad: number;
  motivo: string | null;
  createdAt: string;
  variacion: {
    id: number;
    nombre_variacion: string;
    talla: string | null;
    conjunto: { id: number; nombre: string; danza: string };
  };
  user: { id: number; nombre: string } | null;
};

type Props = {
  resumen: Conjunto[];
  movimientos: Movimiento[];
  token: string;
  backendUrl: string;
};

const TIPO_LABELS: Record<string, string> = {
  COMPRA: "Compra", BAJA: "Baja", AJUSTE: "Ajuste", VENTA: "Venta",
};

// ── Component ─────────────────────────────────────────────────────────────────

export function StockClient({ resumen, movimientos: initMovimientos, token, backendUrl }: Props) {
  const [tab, setTab] = useState<"resumen" | "movimientos" | "nuevo">("resumen");
  const [movimientos, setMovimientos] = useState(initMovimientos);
  const [conjuntos] = useState(resumen);
  const [busqueda, setBusqueda] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    variacionId: "",
    tipo: "COMPRA" as "COMPRA" | "BAJA" | "AJUSTE",
    cantidad: "",
    motivo: "",
  });

  const todasVariaciones = conjuntos.flatMap((c) =>
    c.variaciones.map((v) => ({ ...v, conjuntoNombre: c.nombre, danza: c.danza }))
  );

  const variacionesFiltradas = todasVariaciones.filter((v) =>
    v.conjuntoNombre.toLowerCase().includes(busqueda.toLowerCase()) ||
    v.nombre_variacion.toLowerCase().includes(busqueda.toLowerCase()) ||
    (v.talla ?? "").toLowerCase().includes(busqueda.toLowerCase()) ||
    v.danza.toLowerCase().includes(busqueda.toLowerCase())
  );

  async function registrar() {
    if (!form.variacionId || !form.cantidad) return;
    setSaving(true);
    setError(null);
    try {
      const res = await fetch(`${backendUrl}/inventario/movimientos`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          variacionId: Number(form.variacionId),
          tipo: form.tipo,
          cantidad: Number(form.cantidad),
          motivo: form.motivo || undefined,
        }),
      });
      if (!res.ok) throw new Error(await res.text());
      const nuevo = await res.json();
      setMovimientos((prev) => [nuevo, ...prev]);
      setForm({ variacionId: "", tipo: "COMPRA", cantidad: "", motivo: "" });
      setTab("movimientos");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Error al registrar");
    } finally {
      setSaving(false);
    }
  }

  const conjuntosFiltrados = conjuntos.filter(
    (c) =>
      c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.danza.toLowerCase().includes(busqueda.toLowerCase()) ||
      c.variaciones.some((v) => (v.talla ?? "").toLowerCase().includes(busqueda.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-950" style={{ fontFamily: "var(--font-outfit)" }}>
          Gestión de Stock
        </h1>
        <p className="text-base font-medium text-gray-600 mt-1">
          Control de inventario por cantidad
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Conjuntos activos", value: conjuntos.length, cls: "bg-white border-gray-300 text-gray-900" },
          { label: "Unidades totales",  value: conjuntos.reduce((s, c) => s + c.stockTotal, 0), cls: "bg-emerald-50 border-emerald-300 text-emerald-800" },
          { label: "Sin stock",         value: conjuntos.filter((c) => c.stockTotal === 0).length, cls: "bg-red-50 border-red-300 text-red-800" },
          { label: "Movimientos",       value: movimientos.length, cls: "bg-amber-50 border-amber-300 text-amber-800" },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`rounded-2xl border-2 px-5 py-4 ${cls}`}>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wide">{label}</p>
            <p className="text-4xl font-extrabold mt-1">{value}</p>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b-2 border-gray-200">
        {(["resumen", "movimientos", "nuevo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-5 py-2.5 text-base font-bold border-b-4 -mb-px transition-colors",
              tab === t
                ? "border-[#991B1B] text-[#991B1B]"
                : "border-transparent text-gray-500 hover:text-gray-800"
            )}
          >
            {t === "resumen" ? "Resumen" : t === "movimientos" ? "Historial" : "Registrar movimiento"}
          </button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {tab === "resumen" && (
        <div className="space-y-5">
          <input
            type="text"
            placeholder="Buscar por danza, nombre, talla…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full max-w-sm rounded-xl border-2 border-gray-300 px-4 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#991B1B] transition-colors"
          />

          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {conjuntosFiltrados.map((conjunto) => (
              <div key={conjunto.id} className="rounded-2xl border-2 border-gray-200 overflow-hidden shadow-sm bg-white">
                {/* Card header */}
                <div className={cn(
                  "px-5 py-4 flex items-center justify-between gap-3",
                  conjunto.stockTotal === 0 ? "bg-red-50" : "bg-gray-50"
                )}>
                  <div>
                    <p className="text-base font-extrabold text-gray-900">{conjunto.nombre}</p>
                    <p className="text-sm font-semibold text-gray-500 mt-0.5">{conjunto.danza}</p>
                  </div>
                  <span className={cn(
                    "text-xl font-extrabold px-3 py-1 rounded-xl border-2",
                    conjunto.stockTotal === 0
                      ? "bg-red-100 border-red-300 text-red-700"
                      : conjunto.stockTotal < 5
                      ? "bg-amber-100 border-amber-300 text-amber-700"
                      : "bg-emerald-100 border-emerald-300 text-emerald-700"
                  )}>
                    {conjunto.stockTotal}
                  </span>
                </div>

                {/* Variaciones table */}
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-200 bg-gray-100">
                      <th className="text-left px-4 py-2.5 text-xs font-extrabold text-gray-600 uppercase tracking-wider">Variación</th>
                      <th className="text-center px-4 py-2.5 text-xs font-extrabold text-gray-600 uppercase tracking-wider">Talla</th>
                      <th className="text-right px-4 py-2.5 text-xs font-extrabold text-gray-600 uppercase tracking-wider">Stock</th>
                    </tr>
                  </thead>
                  <tbody>
                    {conjunto.variaciones.map((v, i) => (
                      <tr key={v.id} className={cn("border-b border-gray-100", i % 2 === 0 ? "bg-white" : "bg-gray-50")}>
                        <td className="px-4 py-3 text-sm font-bold text-gray-900">{v.nombre_variacion}</td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-sm font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg px-2 py-0.5">
                            {v.talla ?? "—"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={cn(
                            "text-lg font-extrabold",
                            v.stock === 0   && "text-red-600",
                            v.stock > 0 && v.stock < 3 && "text-amber-600",
                            v.stock >= 3    && "text-emerald-700"
                          )}>
                            {v.stock}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {tab === "movimientos" && (
        <div className="space-y-3">
          {movimientos.length === 0 && (
            <p className="text-base font-medium text-gray-500 py-12 text-center">
              No hay movimientos registrados aún.
            </p>
          )}
          {movimientos.map((m) => (
            <div key={m.id} className="rounded-2xl border-2 border-gray-200 bg-white px-5 py-4 flex items-start gap-4 shadow-sm">
              <span className={cn(
                "shrink-0 px-3 py-1 rounded-lg text-sm font-extrabold border-2",
                m.tipo === "COMPRA" ? "bg-emerald-100 border-emerald-300 text-emerald-800" :
                m.tipo === "BAJA"   ? "bg-red-100 border-red-300 text-red-800" :
                m.tipo === "VENTA"  ? "bg-orange-100 border-orange-300 text-orange-800" :
                                      "bg-blue-100 border-blue-300 text-blue-800"
              )}>
                {TIPO_LABELS[m.tipo] ?? m.tipo}
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-base font-extrabold text-gray-900">
                  {m.variacion.conjunto.nombre}
                </p>
                <p className="text-sm font-semibold text-gray-600">
                  {m.variacion.nombre_variacion}{m.variacion.talla ? ` · Talla ${m.variacion.talla}` : ""}
                </p>
                <p className="text-sm font-medium text-gray-500 mt-0.5">{m.motivo ?? "Sin motivo"}</p>
              </div>
              <div className="text-right shrink-0">
                <p className={cn(
                  "text-2xl font-extrabold",
                  m.cantidad > 0 ? "text-emerald-700" : "text-red-600"
                )}>
                  {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                </p>
                <p className="text-xs font-bold text-gray-500 mt-0.5">
                  {new Date(m.createdAt).toLocaleDateString("es-BO")}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Tab: Nuevo movimiento */}
      {tab === "nuevo" && (
        <div className="max-w-lg bg-white rounded-2xl border-2 border-gray-200 shadow-sm p-6 space-y-5">
          <h2 className="text-xl font-extrabold text-gray-900">Registrar movimiento de stock</h2>

          {error && (
            <div className="text-base font-semibold text-red-700 bg-red-50 border-2 border-red-200 rounded-xl p-4">{error}</div>
          )}

          {/* Tipo */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">Tipo de movimiento</p>
            <div className="flex gap-2">
              {(["COMPRA", "BAJA", "AJUSTE"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl text-base font-extrabold border-2 transition-colors",
                    form.tipo === t
                      ? t === "COMPRA" ? "bg-emerald-600 text-white border-emerald-600"
                        : t === "BAJA" ? "bg-red-600 text-white border-red-600"
                        : "bg-blue-600 text-white border-blue-600"
                      : "border-gray-300 text-gray-700 hover:bg-gray-50"
                  )}
                >
                  {TIPO_LABELS[t]}
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-500">
              {form.tipo === "COMPRA" && "Ingreso de nuevos trajes al inventario."}
              {form.tipo === "BAJA"   && "Traje dañado, perdido o dado de baja. Se resta del stock."}
              {form.tipo === "AJUSTE" && "Corrección manual. Positivo suma, negativo resta."}
            </p>
          </div>

          {/* Variación */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">Variación</p>
            <input
              type="text"
              placeholder="Buscar variación…"
              value={busqueda}
              onChange={(e) => setBusqueda(e.target.value)}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#991B1B] transition-colors"
            />
            <select
              className="w-full border-2 border-gray-300 rounded-xl px-4 py-2.5 text-base font-bold text-gray-900 bg-white focus:outline-none focus:border-[#991B1B] transition-colors"
              value={form.variacionId}
              onChange={(e) => setForm((f) => ({ ...f, variacionId: e.target.value }))}
            >
              <option value="">— Seleccionar variación —</option>
              {variacionesFiltradas.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.conjuntoNombre} · {v.nombre_variacion}
                  {v.talla ? ` (${v.talla})` : ""} — stock: {v.stock}
                </option>
              ))}
            </select>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">
              Cantidad {form.tipo === "AJUSTE" && <span className="font-semibold text-gray-500 normal-case">(positivo o negativo)</span>}
            </p>
            <input
              type="number"
              min={form.tipo === "AJUSTE" ? undefined : 1}
              value={form.cantidad}
              onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
              placeholder={form.tipo === "AJUSTE" ? "Ej: 5 o -3" : "Ej: 10"}
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-base font-bold text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#991B1B] transition-colors"
            />
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <p className="text-sm font-extrabold text-gray-700 uppercase tracking-wide">
              Motivo <span className="font-semibold text-gray-500 normal-case">(opcional)</span>
            </p>
            <input
              type="text"
              value={form.motivo}
              onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
              placeholder={
                form.tipo === "COMPRA" ? "Ej: Compra proveedor abril 2026" :
                form.tipo === "BAJA"   ? "Ej: Traje rasgado — evento 12/04" :
                                         "Ej: Conteo físico bodega"
              }
              className="w-full rounded-xl border-2 border-gray-300 px-4 py-2.5 text-base font-medium text-gray-900 placeholder:text-gray-400 focus:outline-none focus:border-[#991B1B] transition-colors"
            />
          </div>

          <button
            className="w-full py-3 rounded-xl bg-[#991B1B] hover:bg-[#7F1D1D] text-white text-base font-extrabold transition-colors disabled:opacity-40"
            disabled={saving || !form.variacionId || !form.cantidad}
            onClick={registrar}
          >
            {saving ? "Registrando…" : "Registrar movimiento"}
          </button>
        </div>
      )}
    </div>
  );
}
