"use client";

import { useState } from "react";
import type { UsuarioRow, SucursalOption } from "../page";

// ── Types & Constants ──────────────────────────────────────────────────────────

type Rol = "ADMIN" | "VENDEDOR" | "BODEGUERO" | "CAJERO";

const ROL_CONFIG: Record<Rol, { label: string; chip: string; desc: string; color: string }> = {
  ADMIN:     { label: "Administrador", chip: "bg-red-50 text-red-700 border-red-200",         desc: "Acceso total al sistema. Gestiona usuarios, configuración y todos los módulos.", color: "#ef4444" },
  VENDEDOR:  { label: "Vendedor",      chip: "bg-blue-50 text-blue-700 border-blue-200",      desc: "Crea y gestiona contratos, eventos y clientes. Puede registrar pagos.",          color: "#3b82f6" },
  BODEGUERO: { label: "Bodeguero",     chip: "bg-emerald-50 text-emerald-700 border-emerald-200", desc: "Gestiona el inventario físico, armado de conjuntos y transferencias.",       color: "#10b981" },
  CAJERO:    { label: "Cajero",        chip: "bg-amber-50 text-amber-700 border-amber-200",   desc: "Registra movimientos de caja, pagos y genera reportes financieros.",            color: "#f59e0b" },
};

const ROL_OPTIONS: Rol[] = ["ADMIN", "VENDEDOR", "BODEGUERO", "CAJERO"];

// ── Permissions matrix ─────────────────────────────────────────────────────────
// [module, description, ADMIN, VENDEDOR, BODEGUERO, CAJERO]
type PermLevel = "full" | "read" | "none";

interface ModuloPermiso {
  modulo: string;
  descripcion: string;
  permisos: Record<Rol, PermLevel>;
}

const PERMISOS_MATRIZ: ModuloPermiso[] = [
  { modulo: "Dashboard",           descripcion: "Resumen general del sistema",               permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "read", CAJERO: "read" } },
  { modulo: "Conjuntos / Catálogo",descripcion: "Gestión del catálogo de danzas y conjuntos",permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "read", CAJERO: "none" } },
  { modulo: "Inventario Físico",   descripcion: "Instancias, armado y pool de prendas",      permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "full", CAJERO: "none" } },
  { modulo: "Sucursales",          descripcion: "Configuración y datos de sucursales",       permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "read", CAJERO: "none" } },
  { modulo: "Transferencias",      descripcion: "Transferencias de prendas entre sucursales",permisos: { ADMIN: "full", VENDEDOR: "none", BODEGUERO: "full", CAJERO: "none" } },
  { modulo: "Contratos",           descripcion: "Creación y seguimiento de contratos",       permisos: { ADMIN: "full", VENDEDOR: "full", BODEGUERO: "read", CAJERO: "read" } },
  { modulo: "Eventos Folklóricos", descripcion: "Gestión de eventos y sus contratos",        permisos: { ADMIN: "full", VENDEDOR: "full", BODEGUERO: "none", CAJERO: "none" } },
  { modulo: "Caja",                descripcion: "Movimientos, ingresos y egresos",           permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "none", CAJERO: "full" } },
  { modulo: "Garantías",           descripcion: "Depósitos de seguridad de contratos",       permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "none", CAJERO: "read" } },
  { modulo: "Clientes",            descripcion: "Base de datos de clientes",                 permisos: { ADMIN: "full", VENDEDOR: "full", BODEGUERO: "none", CAJERO: "read" } },
  { modulo: "Reportes",            descripcion: "Reportes financieros y operativos",         permisos: { ADMIN: "full", VENDEDOR: "read", BODEGUERO: "read", CAJERO: "full" } },
  { modulo: "Usuarios",            descripcion: "Gestión de usuarios del sistema",           permisos: { ADMIN: "full", VENDEDOR: "none", BODEGUERO: "none", CAJERO: "none" } },
  { modulo: "Configuración",       descripcion: "Configuración general del sistema",         permisos: { ADMIN: "full", VENDEDOR: "none", BODEGUERO: "none", CAJERO: "none" } },
];

const inp = "w-full rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 transition-all";

// ── PermBadge ──────────────────────────────────────────────────────────────────

function PermBadge({ level }: { level: PermLevel }) {
  if (level === "full")
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" /></svg>
          Completo
        </span>
      </div>
    );
  if (level === "read")
    return (
      <div className="flex items-center justify-center">
        <span className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
          Solo lectura
        </span>
      </div>
    );
  return (
    <div className="flex items-center justify-center">
      <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 px-2 py-0.5 rounded-full bg-gray-100 border border-gray-200">
        <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" /></svg>
        Sin acceso
      </span>
    </div>
  );
}

// ── UsuarioModal ───────────────────────────────────────────────────────────────

function UsuarioModal({ usuario, token, backendUrl, sucursales, onClose, onSaved }: {
  usuario: UsuarioRow | null; token: string; backendUrl: string;
  sucursales: SucursalOption[];
  onClose: () => void; onSaved: (u: UsuarioRow) => void;
}) {
  const isEdit = !!usuario;
  const [nombre,     setNombre]     = useState(usuario?.nombre ?? "");
  const [email,      setEmail]      = useState(usuario?.email  ?? "");
  const [rol,        setRol]        = useState<Rol>((usuario?.rol as Rol) ?? "VENDEDOR");
  const [activo,     setActivo]     = useState(usuario?.activo ?? true);
  const [sucursalId, setSucursalId] = useState<number | null>(usuario?.sucursalId ?? null);
  const [password,   setPassword]   = useState("");
  const [saving,     setSaving]     = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  const handleSave = async () => {
    if (!nombre.trim() || !email.trim()) { setError("Nombre y email son obligatorios"); return; }
    if (!isEdit && !password.trim()) { setError("La contraseña es obligatoria para nuevo usuario"); return; }
    setSaving(true); setError(null);
    try {
      const url    = isEdit ? `${backendUrl}/users/${usuario!.id}` : `${backendUrl}/users`;
      const method = isEdit ? "PATCH" : "POST";
      const body: Record<string, unknown> = { nombre: nombre.trim(), email: email.trim(), rol, activo, sucursalId: sucursalId ?? null };
      if (!isEdit) body.password = password;
      else if (password.trim()) body.password = password;
      const res = await fetch(url, {
        method, headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      if (res.ok) { onSaved(await res.json() as UsuarioRow); }
      else { const e = await res.json().catch(() => ({})) as { message?: string }; setError(e.message ?? "Error al guardar"); setSaving(false); }
    } catch { setError("Error de red"); setSaving(false); }
  };

  const rolInfo = ROL_CONFIG[rol];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white border-2 border-gray-200 rounded-2xl w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
          <h2 className="font-bold text-base text-gray-900" style={{ fontFamily: "var(--font-outfit)" }}>
            {isEdit ? "Editar usuario" : "Nuevo usuario"}
          </h2>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-gray-100 transition-colors text-gray-500 hover:text-gray-700">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-6 space-y-4">
          {error && <p className="text-xs text-red-700 bg-red-50 border border-red-200 rounded-xl px-3 py-2 font-medium">{error}</p>}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Nombre completo *</label>
            <input className={inp} value={nombre} onChange={(e) => setNombre(e.target.value)} placeholder="Nombre completo" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Email *</label>
            <input className={inp} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="correo@ejemplo.com" />
          </div>

          {/* Rol con preview de permisos */}
          <div className="space-y-2">
            <label className="text-xs font-semibold text-gray-600">Rol</label>
            <select className={`${inp} cursor-pointer`} value={rol} onChange={(e) => setRol(e.target.value as Rol)}>
              {ROL_OPTIONS.map((r) => <option key={r} value={r}>{ROL_CONFIG[r].label}</option>)}
            </select>
            <div className="px-3 py-2.5 rounded-xl border text-xs" style={{ borderColor: `${rolInfo.color}30`, backgroundColor: `${rolInfo.color}08` }}>
              <p className="font-semibold mb-1" style={{ color: rolInfo.color }}>{rolInfo.label}</p>
              <p className="text-muted-foreground">{rolInfo.desc}</p>
              <div className="mt-2 flex flex-wrap gap-1">
                {PERMISOS_MATRIZ.filter((m) => m.permisos[rol] !== "none").map((m) => (
                  <span key={m.modulo} className="px-1.5 py-0.5 rounded text-xs font-medium"
                    style={{ background: `${rolInfo.color}15`, color: rolInfo.color }}>
                    {m.modulo}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sucursal */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">Sucursal asignada</label>
            <select className={`${inp} cursor-pointer`} value={sucursalId ?? ""} onChange={(e) => setSucursalId(e.target.value ? Number(e.target.value) : null)}>
              <option value="">Sin sucursal</option>
              {sucursales.map((s) => <option key={s.id} value={s.id}>{s.nombre} — {s.ciudad}</option>)}
            </select>
          </div>

          {isEdit && (
            <div className="flex items-center justify-between py-2 border-t border-gray-200">
              <span className="text-sm text-gray-700 font-medium">Usuario activo</span>
              <button onClick={() => setActivo((v) => !v)}
                className={`relative w-10 h-6 rounded-full transition-colors ${activo ? "bg-primary" : "bg-muted-foreground/30"}`}>
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-transform ${activo ? "translate-x-5" : "translate-x-1"}`} />
              </button>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-semibold text-gray-600">{isEdit ? "Nueva contraseña (dejar vacío para no cambiar)" : "Contraseña *"}</label>
            <input className={inp} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
        </div>

        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onClose} className="flex-1 py-2 rounded-xl border-2 border-gray-300 text-sm text-gray-700 font-medium hover:border-gray-400 hover:bg-gray-50 transition-colors">Cancelar</button>
          <button onClick={() => void handleSave()} disabled={saving}
            className="flex-1 py-2 rounded-xl bg-primary text-white text-sm font-semibold shadow-sm hover:bg-primary/90 transition-colors disabled:opacity-50">
            {saving ? "Guardando…" : isEdit ? "Guardar cambios" : "Crear usuario"}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── UsuariosTab ────────────────────────────────────────────────────────────────

function UsuariosTab({ usuarios, sucursales, token, backendUrl, onSaved }: {
  usuarios: UsuarioRow[]; sucursales: SucursalOption[]; token: string; backendUrl: string;
  onSaved: (u: UsuarioRow) => void;
}) {
  const [selected, setSelected] = useState<UsuarioRow | null | "new">(null);
  const [search,   setSearch]   = useState("");

  const filtered = usuarios.filter((u) => {
    const q = search.toLowerCase();
    return !q || u.nombre.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
  });

  const countByRol = ROL_OPTIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r] = usuarios.filter((u) => u.rol === r).length;
    return acc;
  }, {});

  return (
    <div className="space-y-4">
      {/* Role summary chips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {ROL_OPTIONS.map((r) => {
          const cfg = ROL_CONFIG[r];
          return (
            <div key={r} className="rounded-2xl border-2 bg-white p-4"
              style={{ borderColor: `${cfg.color}40`, backgroundColor: `${cfg.color}08` }}>
              <p className="text-3xl font-bold" style={{ color: cfg.color, fontFamily: "var(--font-outfit)" }}>{countByRol[r] ?? 0}</p>
              <p className="text-xs font-semibold mt-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
            </div>
          );
        })}
      </div>

      {/* Filters + action */}
      <div className="flex gap-2 flex-wrap items-center">
        <input className="rounded-xl border-2 border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/40 flex-1 min-w-45"
          placeholder="Buscar por nombre o email…" value={search} onChange={(e) => setSearch(e.target.value)} />
        <button onClick={() => setSelected("new")}
          className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 transition-colors flex items-center gap-1.5">
          <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" /></svg>
          Nuevo usuario
        </button>
      </div>

      {/* Table */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm">
        {filtered.length === 0 ? (
          <div className="py-14 text-center text-gray-500 text-sm font-medium">Sin usuarios</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Usuario</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden sm:table-cell">Email</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Rol</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden md:table-cell">Accesos</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide hidden lg:table-cell">Sucursal</th>
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide">Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => {
                const cfg = ROL_CONFIG[u.rol as Rol] ?? ROL_CONFIG.VENDEDOR;
                const accesos = PERMISOS_MATRIZ.filter((m) => m.permisos[u.rol as Rol] === "full").length;
                const lecturas = PERMISOS_MATRIZ.filter((m) => m.permisos[u.rol as Rol] === "read").length;
                return (
                  <tr key={u.id} onClick={() => setSelected(u)}
                    className="border-b border-gray-100 last:border-0 hover:bg-gray-50 cursor-pointer transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold shrink-0"
                          style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                          {u.nombre?.charAt(0).toUpperCase() ?? "?"}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{u.nombre}</p>
                          <p className="text-xs text-gray-500 sm:hidden">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 hidden sm:table-cell">{u.email}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${cfg.chip}`}>{cfg.label}</span>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-emerald-700 font-semibold">{accesos} completo{accesos !== 1 ? "s" : ""}</span>
                        <span className="text-gray-400">·</span>
                        <span className="text-blue-700 font-semibold">{lecturas} solo lectura</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-600 font-medium">
                      {u.sucursal ? (
                        <span>{u.sucursal.nombre}</span>
                      ) : (
                        <span className="italic text-gray-400">Sin sucursal</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${u.activo ? "bg-emerald-50 text-emerald-700 border-emerald-200" : "bg-gray-100 text-gray-500 border-gray-300"}`}>
                        {u.activo ? "Activo" : "Inactivo"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        {filtered.length > 0 && (
          <div className="px-4 py-2.5 border-t border-gray-200 bg-gray-50 text-xs text-gray-500 font-medium">
            {filtered.length} de {usuarios.length} usuario{usuarios.length !== 1 ? "s" : ""}
          </div>
        )}
      </div>

      {selected !== null && (
        <UsuarioModal
          usuario={selected === "new" ? null : selected}
          token={token} backendUrl={backendUrl}
          sucursales={sucursales}
          onClose={() => setSelected(null)}
          onSaved={(u) => { onSaved(u); setSelected(null); }}
        />
      )}
    </div>
  );
}

// ── RolesTab ───────────────────────────────────────────────────────────────────

function RolesTab({ usuarios }: { usuarios: UsuarioRow[] }) {
  const [highlightRol, setHighlightRol] = useState<Rol | null>(null);

  const countByRol = ROL_OPTIONS.reduce<Record<string, number>>((acc, r) => {
    acc[r] = usuarios.filter((u) => u.rol === r && u.activo).length;
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Role cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROL_OPTIONS.map((r) => {
          const cfg = ROL_CONFIG[r];
          const fullCount = PERMISOS_MATRIZ.filter((m) => m.permisos[r] === "full").length;
          const readCount = PERMISOS_MATRIZ.filter((m) => m.permisos[r] === "read").length;
          const isHigh = highlightRol === r;
          return (
            <button key={r} onClick={() => setHighlightRol(isHigh ? null : r)}
              className={`text-left rounded-2xl border p-4 transition-all ${isHigh ? "ring-2" : "hover:shadow-sm"}`}
              style={{ borderColor: isHigh ? cfg.color : undefined }}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center"
                  style={{ backgroundColor: `${cfg.color}20` }}>
                  <svg className="h-4.5 w-4.5" style={{ color: cfg.color }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                      d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full" style={{ color: cfg.color, backgroundColor: `${cfg.color}15` }}>
                  {countByRol[r] ?? 0} activo{(countByRol[r] ?? 0) !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="font-bold text-sm">{cfg.label}</p>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{cfg.desc}</p>
              <div className="mt-3 flex gap-3 text-xs">
                <span className="text-emerald-600 font-semibold">{fullCount} completos</span>
                <span className="text-blue-600">{readCount} lectura</span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Permissions matrix */}
      <div className="rounded-2xl border-2 border-gray-200 bg-white overflow-hidden shadow-sm">
        <div className="px-5 py-4 border-b border-gray-200 bg-gray-50 flex items-center justify-between flex-wrap gap-2">
          <div>
            <p className="font-bold text-sm text-gray-900">Matriz de permisos</p>
            <p className="text-xs text-gray-500 font-medium mt-0.5">Acceso de cada rol a los módulos del sistema</p>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-600 font-medium">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Acceso completo</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500 inline-block" /> Solo lectura</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400 inline-block" /> Sin acceso</span>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 text-xs font-semibold text-gray-700 uppercase tracking-wide min-w-45">Módulo</th>
                {ROL_OPTIONS.map((r) => {
                  const cfg = ROL_CONFIG[r];
                  return (
                    <th key={r} className="text-center px-4 py-3 min-w-35">
                      <button onClick={() => setHighlightRol(highlightRol === r ? null : r)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${highlightRol === r ? "" : "opacity-80 hover:opacity-100"}`}
                        style={{ color: cfg.color, borderColor: `${cfg.color}30`, backgroundColor: highlightRol === r ? `${cfg.color}20` : `${cfg.color}10` }}>
                        {cfg.label}
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {PERMISOS_MATRIZ.map((m) => (
                <tr key={m.modulo} className="border-b border-gray-100 last:border-0 hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3">
                    <p className="font-semibold text-sm text-gray-900">{m.modulo}</p>
                    <p className="text-xs text-gray-500 font-medium">{m.descripcion}</p>
                  </td>
                  {ROL_OPTIONS.map((r) => {
                    const cfg = ROL_CONFIG[r];
                    const isHigh = highlightRol === r;
                    const level = m.permisos[r];
                    return (
                      <td key={r} className={`px-4 py-3 transition-colors ${isHigh ? "bg-opacity-5" : ""}`}
                        style={{ backgroundColor: isHigh ? `${cfg.color}08` : undefined }}>
                        <PermBadge level={level} />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {/* Summary row */}
            <tfoot>
              <tr className="border-t-2 border-gray-200 bg-gray-50">
                <td className="px-4 py-3 text-xs font-bold text-gray-700 uppercase tracking-wide">Total módulos con acceso</td>
                {ROL_OPTIONS.map((r) => {
                  const full = PERMISOS_MATRIZ.filter((m) => m.permisos[r] === "full").length;
                  const read = PERMISOS_MATRIZ.filter((m) => m.permisos[r] === "read").length;
                  const cfg  = ROL_CONFIG[r];
                  return (
                    <td key={r} className="px-4 py-3 text-center">
                      <p className="text-xs font-bold" style={{ color: cfg.color }}>{full + read} / {PERMISOS_MATRIZ.length}</p>
                      <p className="text-xs text-gray-500 font-medium">{full} compl. · {read} lectura</p>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Users by role */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {ROL_OPTIONS.map((r) => {
          const cfg = ROL_CONFIG[r];
          const members = usuarios.filter((u) => u.rol === r);
          return (
            <div key={r} className="rounded-2xl border-2 border-gray-200 bg-white p-4 space-y-3 shadow-sm">
              <p className="text-xs font-bold uppercase tracking-wide" style={{ color: cfg.color }}>{cfg.label}</p>
              {members.length === 0 ? (
                <p className="text-xs text-muted-foreground italic">Sin usuarios asignados</p>
              ) : (
                <div className="space-y-2">
                  {members.map((u) => (
                    <div key={u.id} className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0"
                        style={{ backgroundColor: `${cfg.color}20`, color: cfg.color }}>
                        {u.nombre.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-xs font-semibold truncate">{u.nombre}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{u.email}</p>
                      </div>
                      {!u.activo && (
                        <span className="text-[10px] text-muted-foreground border border-border rounded px-1">inactivo</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ── UsuariosClient (root) ──────────────────────────────────────────────────────

export function UsuariosClient({ initialUsuarios, sucursales, token, backendUrl }: {
  initialUsuarios: UsuarioRow[]; sucursales: SucursalOption[]; token: string; backendUrl: string;
}) {
  const [usuarios, setUsuarios] = useState<UsuarioRow[]>(initialUsuarios);
  const [tab, setTab] = useState<"usuarios" | "roles">("usuarios");

  const handleSaved = (u: UsuarioRow) => {
    setUsuarios((prev) => {
      const idx = prev.findIndex((x) => x.id === u.id);
      if (idx >= 0) { const next = [...prev]; next[idx] = u; return next; }
      return [u, ...prev];
    });
  };

  const TABS = [
    { id: "usuarios" as const, label: "Usuarios" },
    { id: "roles"    as const, label: "Roles y Permisos" },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>Usuarios</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Gestión de empleados, roles y permisos del sistema</p>
      </div>

      <div className="flex border-b border-border gap-1">
        {TABS.map((t) => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {tab === "usuarios" && <UsuariosTab usuarios={usuarios} sucursales={sucursales} token={token} backendUrl={backendUrl} onSaved={handleSaved} />}
      {tab === "roles"    && <RolesTab    usuarios={usuarios} />}
    </div>
  );
}
