"use client";

import { useState } from "react";
import type { SucursalRow } from "../page";

const inp = "w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

const CIUDADES = ["La Paz", "El Alto", "Cochabamba", "Santa Cruz", "Oruro", "Potosí", "Sucre", "Tarija", "Beni", "Pando", "Otra"];

// ── Modal ─────────────────────────────────────────────────────────────────────

function SucursalModal({ sucursal, token, backendUrl, onClose, onSaved, onDeleted }: {
  sucursal: SucursalRow | null;
  token: string; backendUrl: string;
  onClose: () => void;
  onSaved: (s: SucursalRow) => void;
  onDeleted?: (id: number) => void;
}) {
  const isEdit = !!sucursal;
  const [nombre,    setNombre]    = useState(sucursal?.nombre    ?? "");
  const [ciudad,    setCiudad]    = useState(sucursal?.ciudad    ?? "La Paz");
  const [direccion, setDireccion] = useState(sucursal?.direccion ?? "");
  const [telefono,  setTelefono]  = useState(sucursal?.telefono  ?? "");
  const [email,     setEmail]     = useState(sucursal?.email     ?? "");
  const [saving,    setSaving]    = useState(false);
  const [deleting,  setDeleting]  = useState(false);
  const [confirmDel, setConfirmDel] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  const handleSave = async () => {
    if (!nombre.trim()) { setError("El nombre es obligatorio"); return; }
    setSaving(true); setError(null);
    try {
      const url    = isEdit ? `${backendUrl}/sucursales/${sucursal!.id}` : `${backendUrl}/sucursales`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: nombre.trim(), ciudad,
          direccion: direccion.trim() || undefined,
          telefono:  telefono.trim()  || undefined,
          email:     email.trim()     || undefined,
        }),
      });
      if (res.ok) { onSaved(await res.json()); }
      else { const e = await res.json().catch(() => ({})) as { message?: string }; setError(e.message ?? "Error al guardar"); setSaving(false); }
    } catch { setError("Error de red"); setSaving(false); }
  };

  const handleDelete = async () => {
    if (!sucursal) return;
    setDeleting(true);
    try {
      const res = await fetch(`${backendUrl}/sucursales/${sucursal.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { onDeleted?.(sucursal.id); }
      else { const e = await res.json().catch(() => ({})) as { message?: string }; setError(e.message ?? "No se pudo eliminar"); setDeleting(false); setConfirmDel(false); }
    } catch { setError("Error de red"); setDeleting(false); setConfirmDel(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50 rounded-t-2xl">
          <h2 className="font-bold text-base text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            {isEdit ? "Editar sucursal" : "Nueva sucursal"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-200 transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-500/10 rounded-xl px-3 py-2">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Nombre <span className="text-red-500">*</span></label>
            <input className={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Sede Central La Paz" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Ciudad <span className="text-red-500">*</span></label>
            <select className={`${inp} cursor-pointer`} value={ciudad} onChange={(e) => setCiudad(e.target.value)}>
              {CIUDADES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Dirección</label>
            <input className={inp} value={direccion} onChange={(e) => setDireccion(e.target.value)} placeholder="Av. Ejemplo #123" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Teléfono / WhatsApp</label>
            <input className={inp} value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+591 2 1234567" type="tel" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-700">Email</label>
            <input className={inp} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="sucursal@folcklore.com" type="email" />
          </div>
        </div>

        <div className="px-6 pb-6 space-y-3">
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors">
              Cancelar
            </button>
            <button onClick={() => void handleSave()} disabled={saving}
              className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear sucursal"}
            </button>
          </div>

          {isEdit && !confirmDel && (
            <button onClick={() => setConfirmDel(true)}
              className="w-full py-2 rounded-xl border border-red-500/30 text-red-500 text-sm hover:bg-red-500/10 transition-colors">
              Eliminar sucursal
            </button>
          )}
          {isEdit && confirmDel && (
            <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-3 space-y-2">
              <p className="text-xs text-red-500 font-semibold">¿Confirmar eliminación? Esta acción no se puede deshacer.</p>
              <div className="flex gap-2">
                <button onClick={() => setConfirmDel(false)} className="flex-1 py-1.5 text-xs rounded-lg border-2 border-gray-300 text-gray-700 font-medium hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => void handleDelete()} disabled={deleting}
                  className="flex-1 py-1.5 text-xs rounded-lg bg-red-500 text-white hover:bg-red-600 transition-colors disabled:opacity-50">
                  {deleting ? "Eliminando…" : "Sí, eliminar"}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function SucursalesClient({ initialSucursales, token, backendUrl }: {
  initialSucursales: SucursalRow[];
  token: string;
  backendUrl: string;
}) {
  const [sucursales, setSucursales] = useState<SucursalRow[]>(initialSucursales);
  const [selected, setSelected] = useState<SucursalRow | null | "new">(null);

  const handleSaved = (s: SucursalRow) => {
    setSucursales((prev) => {
      const idx = prev.findIndex((x) => x.id === s.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = s; return next; }
      return [...prev, s];
    });
    setSelected(null);
  };

  const handleDeleted = (id: number) => {
    setSucursales((prev) => prev.filter((s) => s.id !== id));
    setSelected(null);
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>Sucursales</h1>
          <p className="text-sm text-gray-500 font-medium mt-0.5">Gestión de sedes y puntos de venta</p>
        </div>
        <button
          onClick={() => setSelected("new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva sucursal
        </button>
      </div>

      {/* Grid */}
      {sucursales.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed border-gray-300 py-20 flex flex-col items-center gap-3 text-gray-500">
          <svg className="h-10 w-10 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
          </svg>
          <p className="text-sm">No hay sucursales registradas</p>
          <button onClick={() => setSelected("new")} className="text-sm text-primary hover:underline">
            Crear la primera sucursal
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {sucursales.map((s) => (
            <button
              key={s.id}
              onClick={() => setSelected(s)}
              className="text-left rounded-2xl border-2 border-gray-200 bg-white p-5 hover:border-primary/50 hover:shadow-lg transition-all group shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary/20 transition-colors">
                  <svg className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                </div>
                <svg className="h-4 w-4 text-muted-foreground group-hover:text-foreground transition-colors mt-0.5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <div className="mt-3">
                <p className="font-bold text-sm">{s.nombre}</p>
                <div className="flex items-center gap-1.5 mt-1">
                  <svg className="h-3 w-3 text-muted-foreground shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="text-xs text-gray-500 font-medium">{s.ciudad}</span>
                </div>
                {s.direccion && (
                  <p className="text-xs text-gray-500 font-medium mt-0.5 truncate">{s.direccion}</p>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Modal */}
      {selected !== null && (
        <SucursalModal
          sucursal={selected === "new" ? null : selected}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
