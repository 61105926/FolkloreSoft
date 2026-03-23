"use client";

import { useState } from "react";
import type { UsuarioRow } from "../page";

const ROL_CONFIG: Record<string, { label: string; chip: string }> = {
  ADMIN:     { label: "Admin",     chip: "bg-red-500/10 text-red-600 border-red-500/20" },
  VENDEDOR:  { label: "Vendedor",  chip: "bg-blue-500/10 text-blue-600 border-blue-500/20" },
  BODEGUERO: { label: "Bodeguero", chip: "bg-green-500/10 text-green-600 border-green-500/20" },
  CAJERO:    { label: "Cajero",    chip: "bg-amber-500/10 text-amber-600 border-amber-500/20" },
};

const ROL_OPTIONS = ["ADMIN", "VENDEDOR", "BODEGUERO", "CAJERO"] as const;

const inp = "w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

// ── Modal ─────────────────────────────────────────────────────────────────────

function UsuarioModal({
  usuario,
  token,
  backendUrl,
  onClose,
  onSaved,
}: {
  usuario: UsuarioRow | null;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onSaved: (u: UsuarioRow) => void;
}) {
  const isEdit = !!usuario;
  const [nombre, setNombre] = useState(usuario?.nombre ?? "");
  const [email, setEmail] = useState(usuario?.email ?? "");
  const [rol, setRol] = useState<string>(usuario?.rol ?? "VENDEDOR");
  const [activo, setActivo] = useState(usuario?.activo ?? true);
  const [password, setPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    if (!nombre.trim() || !email.trim()) { setError("Nombre y email son obligatorios"); return; }
    if (!isEdit && !password.trim()) { setError("La contraseña es obligatoria para nuevo usuario"); return; }
    setSaving(true); setError(null);
    try {
      const url = isEdit ? `${backendUrl}/users/${usuario!.id}` : `${backendUrl}/users`;
      const method = isEdit ? "PATCH" : "POST";
      const body: Record<string, unknown> = { nombre: nombre.trim(), email: email.trim(), rol, activo };
      if (!isEdit) body.password = password;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { onSaved(await res.json()); }
      else {
        const e = await res.json().catch(() => ({}));
        setError(e?.message ?? "Error al guardar");
        setSaving(false);
      }
    } catch { setError("Error de red"); setSaving(false); }
  };

  const handleChangePassword = async () => {
    if (!password.trim()) { setError("Ingresa la nueva contraseña"); return; }
    setSaving(true); setError(null);
    try {
      const res = await fetch(`${backendUrl}/users/${usuario!.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ password }),
      });
      if (res.ok) { setPassword(""); setError(null); setSaving(false); }
      else { const e = await res.json().catch(() => ({})); setError(e?.message ?? "Error"); setSaving(false); }
    } catch { setError("Error de red"); setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background border border-border rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-500 bg-red-500/10 rounded-lg px-3 py-2">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Nombre completo <span className="text-red-500">*</span></label>
            <input className={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email <span className="text-red-500">*</span></label>
            <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>

          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Rol</label>
            <select className={`${inp} cursor-pointer`} value={rol} onChange={(e) => setRol(e.target.value)}>
              {ROL_OPTIONS.map((r) => (
                <option key={r} value={r}>{ROL_CONFIG[r].label}</option>
              ))}
            </select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between py-2">
              <span className="text-sm text-muted-foreground">Usuario activo</span>
              <button
                onClick={() => setActivo((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors ${activo ? "bg-primary" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </div>
          )}

          {!isEdit && (
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Contraseña <span className="text-red-500">*</span></label>
              <input className={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          )}

          {isEdit && (
            <div className="space-y-2 pt-2 border-t border-border">
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Cambiar contraseña</p>
              <div className="flex gap-2">
                <input className={`${inp} flex-1`} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Nueva contraseña" />
                <button
                  onClick={handleChangePassword}
                  disabled={saving}
                  className="px-3 py-2 text-xs rounded-xl bg-muted hover:bg-muted/80 border border-border transition-colors disabled:opacity-50"
                >
                  Cambiar
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
            Cancelar
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
          >
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main ──────────────────────────────────────────────────────────────────────

export function UsuariosClient({
  initialUsuarios,
  token,
  backendUrl,
}: {
  initialUsuarios: UsuarioRow[];
  token: string;
  backendUrl: string;
}) {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>(initialUsuarios);
  const [selected, setSelected] = useState<UsuarioRow | null | "new">(null);

  const handleSaved = (u: UsuarioRow) => {
    setUsuarios((prev) => {
      const idx = prev.findIndex((x) => x.id === u.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = u; return next; }
      return [u, ...prev];
    });
    setSelected(null);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Usuarios</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Gestión de empleados y permisos del sistema</p>
        </div>
        <button
          onClick={() => setSelected("new")}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-xl text-sm font-semibold hover:bg-primary/90 transition-colors"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        {usuarios.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground text-sm">No hay usuarios registrados</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/30">
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {usuarios.map((u) => {
                const cfg = ROL_CONFIG[u.rol] ?? { label: u.rol, chip: "bg-muted text-muted-foreground border-border" };
                const inicial = u.nombre?.charAt(0).toUpperCase() ?? "?";
                return (
                  <tr
                    key={u.id}
                    onClick={() => setSelected(u)}
                    className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                          {inicial}
                        </div>
                        <span className="font-medium">{u.nombre}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.chip}`}>
                        {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.activo ? "bg-green-500/10 text-green-600 border-green-500/20" : "bg-muted text-muted-foreground border-border"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal */}
      {selected !== null && (
        <UsuarioModal
          usuario={selected === "new" ? null : selected}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
        />
      )}
    </div>
  );
}
