"use client";

import { useState, useMemo } from "react";

// ── Types ──────────────────────────────────────────────────────────────────────

interface Cliente {
  id: number;
  nombre: string;
  celular: string | null;
  ci: string | null;
  email: string | null;
  rol: string;
  createdAt: string;
  _count: { contratos: number };
}

interface Props {
  initialClientes: Cliente[];
  token: string;
  backendUrl: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────

const ROL_OPTIONS = [
  { value: "PADRE",       label: "Padre de familia" },
  { value: "DOCENTE",     label: "Docente" },
  { value: "ORGANIZADOR", label: "Organizador" },
  { value: "OTRO",        label: "Otro" },
];

const ROL_CHIP: Record<string, string> = {
  PADRE:       "bg-blue-50 text-blue-700 border-blue-200",
  DOCENTE:     "bg-emerald-50 text-emerald-700 border-emerald-200",
  ORGANIZADOR: "bg-violet-50 text-violet-700 border-violet-200",
  OTRO:        "bg-gray-100 text-gray-700 border-gray-300",
};

const inp = "rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

// ── ClienteModal ──────────────────────────────────────────────────────────────

function ClienteModal({
  initial, token, backendUrl, onSaved, onClose,
}: {
  initial?: Cliente;
  token: string;
  backendUrl: string;
  onSaved: (c: Cliente) => void;
  onClose: () => void;
}) {
  const [nombre,  setNombre]  = useState(initial?.nombre  ?? "");
  const [celular, setCelular] = useState(initial?.celular ?? "");
  const [ci,      setCi]      = useState(initial?.ci      ?? "");
  const [email,   setEmail]   = useState(initial?.email   ?? "");
  const [rol,     setRol]     = useState(initial?.rol     ?? "OTRO");
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState("");

  const isEdit = !!initial;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    setSaving(true); setError("");
    try {
      const url    = isEdit ? `${backendUrl}/clientes/${initial!.id}` : `${backendUrl}/clientes`;
      const method = isEdit ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({
          nombre: nombre.trim(),
          celular: celular.trim() || undefined,
          ci:      ci.trim()      || undefined,
          email:   email.trim()   || undefined,
          rol,
        }),
      });
      if (res.ok) {
        const saved = await res.json() as Cliente;
        onSaved({ ...saved, _count: initial?._count ?? { contratos: 0 } });
        onClose();
      } else {
        const err = await res.json().catch(() => ({})) as { message?: string };
        setError(err.message ?? "Error al guardar");
      }
    } finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h3 className="font-bold text-base text-gray-900">{isEdit ? "Editar cliente" : "Nuevo cliente"}</h3>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <form onSubmit={(e) => void handleSubmit(e)} className="p-6 space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Nombre completo *</label>
            <input className={`${inp} w-full`} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Ej: Juan Pérez Mamani" required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">Celular</label>
              <input className={`${inp} w-full`} value={celular} onChange={(e) => setCelular(e.target.value)} placeholder="7XXXXXXX" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-gray-600">CI / DNI</label>
              <input className={`${inp} w-full`} value={ci} onChange={(e) => setCi(e.target.value)} placeholder="1234567 LP" />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Email</label>
            <input className={`${inp} w-full`} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Rol</label>
            <select className={`${inp} w-full cursor-pointer`} value={rol} onChange={(e) => setRol(e.target.value)}>
              {ROL_OPTIONS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
            </select>
          </div>
          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-medium">{error}</p>}
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors">Cancelar</button>
            <button type="submit" disabled={saving} className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
              {saving ? (isEdit ? "Guardando…" : "Creando…") : (isEdit ? "Guardar cambios" : "Crear cliente")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── DeleteConfirm ─────────────────────────────────────────────────────────────

function DeleteConfirm({ cliente, token, backendUrl, onDeleted, onClose }: {
  cliente: Cliente; token: string; backendUrl: string;
  onDeleted: (id: number) => void; onClose: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const [error,   setError]   = useState("");

  const handleDelete = async () => {
    setLoading(true); setError("");
    try {
      const res = await fetch(`${backendUrl}/clientes/${cliente.id}`, {
        method: "DELETE", headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) { onDeleted(cliente.id); onClose(); }
      else { const e = await res.json().catch(() => ({})) as { message?: string }; setError(e.message ?? "Error al eliminar"); }
    } finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-gray-200 rounded-2xl w-full max-w-sm p-6 space-y-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center shrink-0">
            <svg className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
          </div>
          <div>
            <h3 className="font-bold text-gray-900">Eliminar cliente</h3>
            <p className="text-sm text-gray-600 mt-0.5">{cliente.nombre}</p>
          </div>
        </div>
        {cliente._count.contratos > 0 && (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 font-medium">
            ⚠ Este cliente tiene {cliente._count.contratos} contrato(s). No se puede eliminar.
          </p>
        )}
        {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-medium">{error}</p>}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={() => void handleDelete()} disabled={loading || cliente._count.contratos > 0}
            className="flex-1 py-2 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
            {loading ? "Eliminando…" : "Eliminar"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── ClientesClient ─────────────────────────────────────────────────────────────

export function ClientesClient({ initialClientes, token, backendUrl }: Props) {
  const [clientes,      setClientes]      = useState(initialClientes);
  const [search,        setSearch]        = useState("");
  const [filterRol,     setFilterRol]     = useState("");
  const [showCreate,    setShowCreate]    = useState(false);
  const [editTarget,    setEditTarget]    = useState<Cliente | null>(null);
  const [deleteTarget,  setDeleteTarget]  = useState<Cliente | null>(null);

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return clientes.filter((c) =>
      (!q || c.nombre.toLowerCase().includes(q) || c.celular?.includes(q) || c.ci?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)) &&
      (!filterRol || c.rol === filterRol)
    );
  }, [clientes, search, filterRol]);

  const rolCounts = useMemo(() => {
    const m: Record<string, number> = {};
    clientes.forEach((c) => { m[c.rol] = (m[c.rol] ?? 0) + 1; });
    return m;
  }, [clientes]);

  const handleSaved = (saved: Cliente) => {
    setClientes((prev) => {
      const exists = prev.find((c) => c.id === saved.id);
      return exists ? prev.map((c) => c.id === saved.id ? saved : c) : [saved, ...prev];
    });
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <div>
          <h1 className="text-3xl font-extrabold text-gray-900">Clientes</h1>
          <p className="text-sm text-gray-600 font-medium mt-0.5">{clientes.length} cliente{clientes.length !== 1 ? "s" : ""} registrados</p>
        </div>
        <button onClick={() => setShowCreate(true)} className="px-4 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Nuevo cliente
        </button>
      </div>

      {/* Stats chips */}
      <div className="flex flex-wrap gap-2">
        <button onClick={() => setFilterRol("")}
          className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${!filterRol ? "bg-primary text-white border-primary" : "bg-white border border-gray-300 text-gray-600 hover:border-primary/50"}`}>
          Todos ({clientes.length})
        </button>
        {ROL_OPTIONS.map((r) => (
          <button key={r.value} onClick={() => setFilterRol(filterRol === r.value ? "" : r.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-colors ${filterRol === r.value ? ROL_CHIP[r.value] : "bg-white border border-gray-300 text-gray-600 hover:border-primary/50"}`}>
            {r.label} ({rolCounts[r.value] ?? 0})
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="flex gap-2 flex-wrap">
        <input className={`${inp} flex-1 min-w-[200px]`} placeholder="Buscar por nombre, celular, CI o email…" value={search} onChange={(e) => setSearch(e.target.value)} />
      </div>

      {/* Table */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Nombre</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden sm:table-cell">CI</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden md:table-cell">Celular</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden lg:table-cell">Email</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Rol</th>
              <th className="text-center px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden sm:table-cell">Contratos</th>
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-gray-500 text-sm">Sin resultados</td></tr>
            ) : filtered.map((c) => (
              <tr key={c.id} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <p className="font-semibold text-gray-900">{c.nombre}</p>
                  <p className="text-xs text-gray-500 font-medium mt-0.5">
                    {new Date(c.createdAt).toLocaleDateString("es-BO", { day: "numeric", month: "short", year: "numeric" })}
                  </p>
                </td>
                <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{c.ci ?? "—"}</td>
                <td className="px-4 py-3 hidden md:table-cell">
                  {c.celular
                    ? <a href={`tel:${c.celular}`} className="text-primary font-medium hover:underline">{c.celular}</a>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3 text-gray-600 hidden lg:table-cell">
                  {c.email
                    ? <a href={`mailto:${c.email}`} className="text-primary font-medium hover:underline truncate max-w-50 block">{c.email}</a>
                    : <span className="text-gray-400">—</span>}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${ROL_CHIP[c.rol] ?? "bg-gray-100 text-gray-700 border-gray-300"}`}>
                    {ROL_OPTIONS.find((r) => r.value === c.rol)?.label ?? c.rol}
                  </span>
                </td>
                <td className="px-4 py-3 text-center hidden sm:table-cell">
                  <span className={`text-xs font-bold ${c._count.contratos > 0 ? "text-primary" : "text-gray-400"}`}>
                    {c._count.contratos}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1 justify-end">
                    <button onClick={() => setEditTarget(c)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-700">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => setDeleteTarget(c)} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-red-50 transition-colors text-gray-400 hover:text-red-600">
                      <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium">
            {filtered.length} de {clientes.length} cliente{clientes.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {showCreate && (
        <ClienteModal token={token} backendUrl={backendUrl} onSaved={handleSaved} onClose={() => setShowCreate(false)} />
      )}
      {editTarget && (
        <ClienteModal initial={editTarget} token={token} backendUrl={backendUrl} onSaved={handleSaved} onClose={() => setEditTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirm cliente={deleteTarget} token={token} backendUrl={backendUrl}
          onDeleted={(id) => setClientes((prev) => prev.filter((c) => c.id !== id))}
          onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
