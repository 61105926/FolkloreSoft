"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  COMPRA: "Compra",
  BAJA: "Baja",
  AJUSTE: "Ajuste",
};
const TIPO_COLORS: Record<string, string> = {
  COMPRA: "bg-emerald-100 text-emerald-800",
  BAJA: "bg-red-100 text-red-800",
  AJUSTE: "bg-blue-100 text-blue-800",
};


// ── Component ─────────────────────────────────────────────────────────────────

export function StockClient({ resumen, movimientos: initMovimientos, token, backendUrl }: Props) {
  const [tab, setTab] = useState<"resumen" | "movimientos" | "nuevo">("resumen");
  const [movimientos, setMovimientos] = useState(initMovimientos);
  const [conjuntos] = useState(resumen);
  const [busqueda, setBusqueda] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Formulario nuevo movimiento
  const [form, setForm] = useState({
    variacionId: "",
    tipo: "COMPRA" as "COMPRA" | "BAJA" | "AJUSTE",
    cantidad: "",
    motivo: "",
  });

  // Variaciones aplanadas para el select
  const todasVariaciones = conjuntos.flatMap((c) =>
    c.variaciones.map((v) => ({
      ...v,
      conjuntoNombre: c.nombre,
      danza: c.danza,
    }))
  );

  const variacionesFiltradas = todasVariaciones.filter(
    (v) =>
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
          Gestión de Stock
        </h1>
        <p className="text-gray-500 text-sm mt-1">
          Control de inventario por cantidad — sin piezas individuales
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-primary/5 border-2 border-primary/20">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-600">Conjuntos activos</p>
            <p className="text-3xl font-bold text-gray-900">{conjuntos.length}</p>
          </CardContent>
        </Card>
        <Card className="bg-emerald-50 border-2 border-emerald-200">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-600">Unidades totales</p>
            <p className="text-3xl font-bold text-emerald-700">
              {conjuntos.reduce((s, c) => s + c.stockTotal, 0)}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-red-50 border-2 border-red-200">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-600">Sin stock</p>
            <p className="text-3xl font-bold text-red-600">
              {conjuntos.filter((c) => c.stockTotal === 0).length}
            </p>
          </CardContent>
        </Card>
        <Card className="bg-amber-50 border-2 border-amber-200">
          <CardContent className="pt-4">
            <p className="text-xs font-medium text-gray-600">Movimientos</p>
            <p className="text-3xl font-bold text-amber-700">{movimientos.length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200">
        {(["resumen", "movimientos", "nuevo"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            className={cn(
              "px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
              tab === t
                ? "border-crimson text-crimson"
                : "border-transparent text-gray-500 hover:text-gray-900"
            )}
          >
            {t === "resumen" ? "Resumen" : t === "movimientos" ? "Historial" : "Registrar movimiento"}
          </button>
        ))}
      </div>

      {/* Tab: Resumen */}
      {tab === "resumen" && (
        <div className="space-y-4">
          <Input
            placeholder="Buscar por danza, nombre, talla…"
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="max-w-sm"
          />

          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {conjuntos
              .filter(
                (c) =>
                  c.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
                  c.danza.toLowerCase().includes(busqueda.toLowerCase()) ||
                  c.variaciones.some((v) =>
                    (v.talla ?? "").toLowerCase().includes(busqueda.toLowerCase())
                  )
              )
              .map((conjunto) => (
                <Card key={conjunto.id} className="overflow-hidden border-2 border-gray-200 shadow-sm rounded-2xl">
                  <CardHeader className="py-3 px-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-sm font-semibold text-gray-900">{conjunto.nombre}</CardTitle>
                        <p className="text-xs font-medium text-gray-500">{conjunto.danza}</p>
                      </div>
                      <Badge
                        className={cn(
                          "text-xs",
                          conjunto.stockTotal === 0
                            ? "bg-red-100 text-red-700"
                            : conjunto.stockTotal < 5
                            ? "bg-amber-100 text-amber-700"
                            : "bg-emerald-100 text-emerald-700"
                        )}
                      >
                        {conjunto.stockTotal} uds.
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-0">
                    <table className="w-full text-xs">
                      <thead className="bg-gray-50">
                        <tr>
                          <th className="text-left px-3 py-1.5 font-semibold text-gray-700 uppercase tracking-wide">Variación</th>
                          <th className="text-center px-3 py-1.5 font-semibold text-gray-700 uppercase tracking-wide">Talla</th>
                          <th className="text-right px-3 py-1.5 font-semibold text-gray-700 uppercase tracking-wide">Stock</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {conjunto.variaciones.map((v) => (
                          <tr key={v.id} className="hover:bg-gray-50">
                            <td className="px-3 py-1.5 text-gray-800">{v.nombre_variacion}</td>
                            <td className="px-3 py-1.5 text-center text-gray-500">
                              {v.talla ?? "—"}
                            </td>
                            <td className="px-3 py-1.5 text-right">
                              <span
                                className={cn(
                                  "font-semibold",
                                  v.stock === 0 && "text-red-600",
                                  v.stock > 0 && v.stock < 3 && "text-amber-600",
                                  v.stock >= 3 && "text-emerald-700"
                                )}
                              >
                                {v.stock}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </CardContent>
                </Card>
              ))}
          </div>
        </div>
      )}

      {/* Tab: Historial */}
      {tab === "movimientos" && (
        <div className="space-y-2">
          {movimientos.length === 0 && (
            <p className="text-gray-500 text-sm py-8 text-center">
              No hay movimientos registrados aún.
            </p>
          )}
          {movimientos.map((m) => (
            <Card key={m.id} className="px-4 py-3 bg-white border-2 border-gray-200 shadow-sm rounded-2xl">
              <div className="flex items-start gap-3">
                <Badge className={cn("shrink-0 mt-0.5 border font-medium", TIPO_COLORS[m.tipo] ?? "bg-gray-100 text-gray-700 border-gray-200")}>
                  {TIPO_LABELS[m.tipo] ?? m.tipo}
                </Badge>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-gray-900 truncate">
                    {m.variacion.conjunto.nombre} — {m.variacion.nombre_variacion}
                    {m.variacion.talla ? ` (${m.variacion.talla})` : ""}
                  </p>
                  <p className="text-xs font-medium text-gray-500">{m.motivo ?? "Sin motivo"}</p>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={cn(
                      "text-sm font-bold",
                      m.cantidad > 0 ? "text-emerald-700" : "text-red-600"
                    )}
                  >
                    {m.cantidad > 0 ? `+${m.cantidad}` : m.cantidad}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {new Date(m.createdAt).toLocaleDateString("es-BO")}
                  </p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Tab: Nuevo movimiento */}
      {tab === "nuevo" && (
        <Card className="max-w-lg bg-white border-2 border-gray-200 shadow-sm rounded-2xl">
          <CardHeader>
            <CardTitle className="text-base font-semibold text-gray-900">Registrar movimiento de stock</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <div className="text-sm text-red-600 bg-red-50 rounded p-3">{error}</div>
            )}

            <div className="space-y-1.5">
              <Label>Tipo de movimiento</Label>
              <div className="flex gap-2">
                {(["COMPRA", "BAJA", "AJUSTE"] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => setForm((f) => ({ ...f, tipo: t }))}
                    className={cn(
                      "flex-1 py-1.5 rounded text-xs font-medium border transition-colors",
                      form.tipo === t
                        ? t === "COMPRA"
                          ? "bg-emerald-600 text-white border-emerald-600"
                          : t === "BAJA"
                          ? "bg-red-600 text-white border-red-600"
                          : "bg-blue-600 text-white border-blue-600"
                        : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                    )}
                  >
                    {TIPO_LABELS[t]}
                  </button>
                ))}
              </div>
              <p className="text-xs font-medium text-gray-500">
                {form.tipo === "COMPRA" && "Ingreso de nuevos trajes al inventario."}
                {form.tipo === "BAJA" && "Traje dañado, perdido o dado de baja. Se resta del stock."}
                {form.tipo === "AJUSTE" && "Corrección manual. Ingresa un número positivo (suma) o negativo (resta)."}
              </p>
            </div>

            <div className="space-y-1.5">
              <Label>Variación</Label>
              <Input
                placeholder="Buscar variación…"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
              />
              <select
                className="w-full border-2 border-gray-200 rounded-xl px-3 py-2 text-sm bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition-colors"
                value={form.variacionId}
                onChange={(e) => setForm((f) => ({ ...f, variacionId: e.target.value }))}
              >
                <option value="">— Seleccionar —</option>
                {variacionesFiltradas.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.conjuntoNombre} · {v.nombre_variacion}
                    {v.talla ? ` (${v.talla})` : ""} — stock: {v.stock}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <Label>
                Cantidad
                {form.tipo === "AJUSTE" && (
                  <span className="text-xs text-gray-500 ml-1">(positivo o negativo)</span>
                )}
              </Label>
              <Input
                type="number"
                min={form.tipo === "AJUSTE" ? undefined : 1}
                value={form.cantidad}
                onChange={(e) => setForm((f) => ({ ...f, cantidad: e.target.value }))}
                placeholder={form.tipo === "AJUSTE" ? "Ej: 5 o -3" : "Ej: 10"}
              />
            </div>

            <div className="space-y-1.5">
              <Label>Motivo <span className="text-gray-500">(opcional)</span></Label>
              <Input
                value={form.motivo}
                onChange={(e) => setForm((f) => ({ ...f, motivo: e.target.value }))}
                placeholder={
                  form.tipo === "COMPRA"
                    ? "Ej: Compra proveedor abril 2026"
                    : form.tipo === "BAJA"
                    ? "Ej: Traje rasgado — evento 12/04"
                    : "Ej: Conteo físico bodega"
                }
              />
            </div>

            <Button
              className="w-full bg-crimson hover:bg-crimson-dark text-white font-semibold shadow-sm"
              disabled={saving || !form.variacionId || !form.cantidad}
              onClick={registrar}
            >
              {saving ? "Registrando…" : "Registrar movimiento"}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
