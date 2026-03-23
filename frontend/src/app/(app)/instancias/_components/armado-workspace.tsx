"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  useDraggable,
  DragOverlay,
} from "@dnd-kit/core";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

// ── Types ──────────────────────────────────────────────────────────────

interface Componente { tipo: string; nombre: string }
interface RecetaItem { cantidad: number; componente: Componente }
interface Conjunto { id: number; nombre: string; danza: string; componentes: RecetaItem[] }
interface Sucursal { id: number; nombre: string }
interface PiezaFisica {
  id: number;
  serial: string;
  talla: string | null;
  componente: Componente;
  estado: string;
}
interface InstanciaConjunto {
  id: number;
  codigo: string;
  estado: string;
  notas?: string | null;
  sucursalId: number;
  variacion: { conjunto: Conjunto };
  sucursal: Sucursal;
  componentes: PiezaFisica[];
}
interface SucursalBasic { id: number; nombre: string; ciudad: string }

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

interface MovimientoInstancia {
  id: number;
  tipo: string;
  estadoAntes: string | null;
  estadoDespues: string | null;
  notas: string | null;
  createdAt: string;
}

interface Props {
  sucursales: SucursalBasic[];
  instanciasConjunto: InstanciaConjunto[];
  statsSucursales: StatsSucursal[];
  token: string;
  backendUrl: string;
}

// ── DnD Draggable Piece Card ───────────────────────────────────────────

function PiezaCard({ pieza, isDragging }: { pieza: PiezaFisica; isDragging?: boolean }) {
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id: `pieza-${pieza.id}`,
    data: { pieza },
  });

  const style = transform
    ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border bg-card cursor-grab active:cursor-grabbing select-none transition-all duration-150 ${
        isDragging ? "opacity-30" : "hover:border-primary/50 hover:shadow-sm"
      }`}
    >
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
            d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
        </svg>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-semibold truncate">{pieza.componente.tipo}</p>
        <p className="text-xs text-muted-foreground truncate font-mono">{pieza.serial}</p>
        {pieza.talla && <p className="text-xs text-muted-foreground">T: {pieza.talla}</p>}
      </div>
    </div>
  );
}

// ── Droppable Slot ─────────────────────────────────────────────────────

function SlotDroppable({
  tipo,
  index,
  filled,
  pieza,
  onRemove,
}: {
  tipo: string;
  index: number;
  filled: boolean;
  pieza?: PiezaFisica;
  onRemove?: () => void;
}) {
  const droppableId = `slot-${tipo}-${index}`;
  const { isOver, setNodeRef } = useDroppable({ id: droppableId, data: { tipo, index } });

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[3.5rem] rounded-xl border-2 border-dashed transition-all duration-150 ${
        filled
          ? "border-coca/40 bg-coca/5"
          : isOver
          ? "border-primary bg-primary/5 scale-[1.02]"
          : "border-border bg-muted/30 hover:border-primary/30"
      }`}
    >
      {filled && pieza ? (
        <div className="flex items-center gap-2 px-3 py-2">
          <div className="w-7 h-7 rounded-lg bg-coca/20 flex items-center justify-center shrink-0">
            <svg className="h-3.5 w-3.5 text-coca" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold">{pieza.componente.tipo}</p>
            <p className="text-xs text-muted-foreground font-mono">{pieza.serial}</p>
          </div>
          <button
            onClick={onRemove}
            className="w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-crimson hover:bg-crimson/10 transition-colors shrink-0"
          >
            <svg className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-3">
          <div className="w-7 h-7 rounded-lg bg-muted flex items-center justify-center shrink-0">
            <span className="text-xs text-muted-foreground">?</span>
          </div>
          <div>
            <p className="text-xs font-medium text-muted-foreground">{tipo}</p>
            <p className="text-xs text-muted-foreground/50">{isOver ? "Soltar aquí" : "Arrastra una pieza"}</p>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Estado badge ────────────────────────────────────────────────────────

const ESTADO_CHIP: Record<string, string> = {
  DISPONIBLE:       "bg-green-500/10 text-green-600 border-green-500/20",
  ALQUILADO:        "bg-red-500/10 text-red-600 border-red-500/20",
  EN_TRANSFERENCIA: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  DADO_DE_BAJA:     "bg-gray-500/10 text-gray-500 border-gray-500/20",
};

// ── InstanciaDrawer ──────────────────────────────────────────────────────

function InstanciaDrawer({ instancia, token, backendUrl, onClose, onNotasSaved }: {
  instancia: InstanciaConjunto;
  token: string;
  backendUrl: string;
  onClose: () => void;
  onNotasSaved: (id: number, notas: string) => void;
}) {
  const [notas, setNotas] = useState(instancia.notas ?? "");
  const [savingNotas, setSavingNotas] = useState(false);
  const [historial, setHistorial] = useState<MovimientoInstancia[]>([]);
  const [loadingHist, setLoadingHist] = useState(true);

  const loadHistorial = useCallback(async () => {
    setLoadingHist(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${instancia.id}/historial`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setHistorial(await res.json());
    } finally { setLoadingHist(false); }
  }, [backendUrl, instancia.id, token]);

  useEffect(() => { void loadHistorial(); }, [loadHistorial]);

  const handleSaveNotas = async () => {
    setSavingNotas(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/${instancia.id}/notas`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ notas }),
      });
      if (res.ok) { onNotasSaved(instancia.id, notas); await loadHistorial(); }
    } finally { setSavingNotas(false); }
  };

  const chipClass = ESTADO_CHIP[instancia.estado] ?? "bg-muted text-muted-foreground border-border";

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="h-full w-full max-w-md bg-background border-l border-border shadow-2xl flex flex-col overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
          <div>
            <p className="font-bold text-base font-mono">{instancia.codigo}</p>
            <p className="text-xs text-muted-foreground">{instancia.variacion.conjunto.nombre} · {instancia.sucursal.nombre}</p>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-xl hover:bg-muted transition-colors">
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        <div className="p-5 space-y-5 flex-1">
          {/* Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Estado</p>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${chipClass}`}>{instancia.estado.replace(/_/g, " ")}</span>
            </div>
            <div className="rounded-xl border border-border p-3">
              <p className="text-xs text-muted-foreground">Sucursal</p>
              <p className="text-sm font-medium">{instancia.sucursal.nombre}</p>
            </div>
          </div>

          {/* Notas */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Notas / Observaciones</p>
            <textarea
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              rows={4}
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Estado de la prenda, daños, observaciones…"
            />
            <button
              onClick={handleSaveNotas}
              disabled={savingNotas}
              className="w-full py-2 rounded-xl bg-primary text-primary-foreground text-sm hover:bg-primary/90 transition-colors disabled:opacity-50"
            >
              {savingNotas ? "Guardando…" : "Guardar notas"}
            </button>
          </div>

          {/* Historial */}
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Historial</p>
            {loadingHist ? (
              <div className="flex justify-center py-4"><div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>
            ) : historial.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-4">Sin movimientos registrados</p>
            ) : (
              <div className="space-y-2">
                {historial.map((m) => (
                  <div key={m.id} className="rounded-xl border border-border p-3 space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold">{m.tipo.replace(/_/g, " ")}</span>
                      <span className="text-xs text-muted-foreground">{new Date(m.createdAt).toLocaleDateString("es-BO")}</span>
                    </div>
                    {m.estadoDespues && <p className="text-xs text-muted-foreground">→ {m.estadoDespues.replace(/_/g, " ")}</p>}
                    {m.notas && <p className="text-xs text-muted-foreground italic">{m.notas}</p>}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ── InventarioTab ────────────────────────────────────────────────────────

function InventarioTab({ instancias, sucursales, token, backendUrl }: {
  instancias: InstanciaConjunto[];
  sucursales: SucursalBasic[];
  token: string;
  backendUrl: string;
}) {
  const [search, setSearch] = useState("");
  const [filterSucursal, setFilterSucursal] = useState("");
  const [filterEstado, setFilterEstado] = useState("");
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [darBajaMotivo, setDarBajaMotivo] = useState("");
  const [showBajaConfirm, setShowBajaConfirm] = useState(false);
  const [savingBaja, setSavingBaja] = useState(false);
  const [drawerInstancia, setDrawerInstancia] = useState<InstanciaConjunto | null>(null);
  const [localInstancias, setLocalInstancias] = useState(instancias);

  const filtered = localInstancias.filter((inst) => {
    const q = search.toLowerCase();
    const matchSearch = !q || inst.codigo.toLowerCase().includes(q) || inst.variacion.conjunto.nombre.toLowerCase().includes(q);
    const matchSucursal = !filterSucursal || inst.sucursalId.toString() === filterSucursal;
    const matchEstado = !filterEstado || inst.estado === filterEstado;
    return matchSearch && matchSucursal && matchEstado;
  });

  const toggleSelect = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) setSelected(new Set());
    else setSelected(new Set(filtered.map((i) => i.id)));
  };

  const handleDarDeBaja = async () => {
    setSavingBaja(true);
    try {
      const res = await fetch(`${backendUrl}/inventario/instancias-conjunto/dar-de-baja`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ids: Array.from(selected), motivo: darBajaMotivo || undefined }),
      });
      if (res.ok) {
        setLocalInstancias((prev) => prev.map((i) => selected.has(i.id) ? { ...i, estado: "DADO_DE_BAJA" } : i));
        setSelected(new Set()); setShowBajaConfirm(false); setDarBajaMotivo("");
      }
    } finally { setSavingBaja(false); }
  };

  const handleNotasSaved = (id: number, notas: string) => {
    setLocalInstancias((prev) => prev.map((i) => i.id === id ? { ...i, notas } : i));
    setDrawerInstancia((prev) => prev?.id === id ? { ...prev, notas } : prev);
  };

  const inp = "rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 transition-all";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2 items-center">
        <input
          className={`${inp} flex-1 min-w-[180px]`}
          placeholder="Buscar código o conjunto…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select className={`${inp} cursor-pointer`} value={filterSucursal} onChange={(e) => setFilterSucursal(e.target.value)}>
          <option value="">Todas las sucursales</option>
          {sucursales.map((s) => <option key={s.id} value={s.id.toString()}>{s.nombre}</option>)}
        </select>
        <select className={`${inp} cursor-pointer`} value={filterEstado} onChange={(e) => setFilterEstado(e.target.value)}>
          <option value="">Todos los estados</option>
          {["DISPONIBLE", "ALQUILADO", "EN_TRANSFERENCIA", "DADO_DE_BAJA"].map((e) => (
            <option key={e} value={e}>{e.replace(/_/g, " ")}</option>
          ))}
        </select>
        {selected.size > 0 && (
          <button
            onClick={() => setShowBajaConfirm(true)}
            className="px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors"
          >
            Dar de baja ({selected.size})
          </button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 w-8">
                <input type="checkbox" className="rounded" checked={selected.size === filtered.length && filtered.length > 0} onChange={toggleAll} />
              </th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Código</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Conjunto</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Estado</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Sucursal</th>
              <th className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wide">Notas</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-10 text-muted-foreground text-sm">Sin resultados</td></tr>
            ) : filtered.map((inst) => {
              const chip = ESTADO_CHIP[inst.estado] ?? "bg-muted text-muted-foreground border-border";
              return (
                <tr
                  key={inst.id}
                  onClick={() => setDrawerInstancia(inst)}
                  className="border-b border-border last:border-0 hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" className="rounded" checked={selected.has(inst.id)} onChange={() => toggleSelect(inst.id)} />
                  </td>
                  <td className="px-4 py-3 font-mono font-bold">{inst.codigo}</td>
                  <td className="px-4 py-3">
                    <p className="font-medium">{inst.variacion.conjunto.nombre}</p>
                    <p className="text-xs text-muted-foreground">{inst.variacion.conjunto.danza}</p>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${chip}`}>
                      {inst.estado.replace(/_/g, " ")}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{inst.sucursal.nombre}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs max-w-[160px] truncate">{inst.notas ?? "-"}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Drawer */}
      {drawerInstancia && (
        <InstanciaDrawer
          instancia={drawerInstancia}
          token={token}
          backendUrl={backendUrl}
          onClose={() => setDrawerInstancia(null)}
          onNotasSaved={handleNotasSaved}
        />
      )}

      {/* Dar de baja confirm */}
      {showBajaConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-background border border-border rounded-2xl w-full max-w-sm p-6 space-y-4">
            <h3 className="font-bold text-base">Dar de baja {selected.size} instancia(s)</h3>
            <p className="text-sm text-muted-foreground">Esta acción cambia el estado a DADO_DE_BAJA. No se puede revertir fácilmente.</p>
            <textarea
              className="w-full rounded-xl border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/40 resize-none"
              rows={3}
              value={darBajaMotivo}
              onChange={(e) => setDarBajaMotivo(e.target.value)}
              placeholder="Motivo de la baja (opcional)…"
            />
            <div className="flex gap-3">
              <button onClick={() => setShowBajaConfirm(false)} className="flex-1 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={handleDarDeBaja} disabled={savingBaja} className="flex-1 py-2 rounded-xl bg-red-500 text-white text-sm hover:bg-red-600 transition-colors disabled:opacity-50">
                {savingBaja ? "Procesando…" : "Confirmar baja"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ── Stats Cards ───────────────────────────────────────────────────────────

function StatsSucursalesCards({ stats }: { stats: StatsSucursal[] }) {
  if (stats.length === 0) return null;
  return (
    <div className="flex flex-wrap gap-3">
      {stats.map((s) => (
        <div key={s.sucursalId} className="flex-1 min-w-[200px] rounded-2xl border border-border bg-card p-4 space-y-2">
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
  );
}

// ── Main Workspace ─────────────────────────────────────────────────────

export function ArmadoWorkspace({ sucursales, instanciasConjunto, statsSucursales, token, backendUrl }: Props) {
  const [mainTab, setMainTab] = useState<"armado" | "inventario">("armado");
  const [selectedSucursal, setSelectedSucursal] = useState<number | null>(
    sucursales.length > 0 ? sucursales[0].id : null
  );
  const [selectedInstancia, setSelectedInstancia] = useState<InstanciaConjunto | null>(null);
  const [slots, setSlots] = useState<Record<string, PiezaFisica | null>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const filteredInstancias = instanciasConjunto.filter(
    (ic) => !selectedSucursal || ic.sucursal.id === selectedSucursal
  );

  // Pool: instanciasComponente disponibles en la sucursal (flat from all instanciasConjunto)
  const [poolPiezas, setPoolPiezas] = useState<PiezaFisica[]>([]);
  const [loadingPool, setLoadingPool] = useState(false);

  const loadPool = useCallback(
    async (sucursalId: number) => {
      setLoadingPool(true);
      try {
        const res = await fetch(`${backendUrl}/inventario/pool?sucursalId=${sucursalId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setPoolPiezas(data);
        }
      } finally {
        setLoadingPool(false);
      }
    },
    [backendUrl, token]
  );

  const handleSelectInstancia = (inst: InstanciaConjunto) => {
    setSelectedInstancia(inst);
    setSlots({});
    setMessage(null);
    if (selectedSucursal) loadPool(selectedSucursal);
  };

  // Build required slots from recipe
  const requiredSlots = selectedInstancia
    ? selectedInstancia.variacion.conjunto.componentes.flatMap((rc) =>
        Array.from({ length: rc.cantidad }, (_, i) => ({
          tipo: rc.componente.tipo,
          index: i,
          key: `${rc.componente.tipo}-${i}`,
        }))
      )
    : [];

  // IDs already assigned to slots
  const assignedIds = new Set(
    Object.values(slots)
      .filter(Boolean)
      .map((p) => p!.id)
  );

  const availablePool = poolPiezas.filter((p) => !assignedIds.has(p.id));

  // ── DnD Handlers ──

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragOver = (_event: DragOverEvent) => {};

  const handleDragEnd = ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;

    const pieceData = active.data.current?.pieza as PiezaFisica | undefined;
    const slotData = over.data.current as { tipo: string; index: number } | undefined;

    if (!pieceData || !slotData) return;

    const slotKey = `${slotData.tipo}-${slotData.index}`;
    // Check type match
    if (pieceData.componente.tipo !== slotData.tipo) return;
    // Check slot not already filled
    if (slots[slotKey]) return;

    setSlots((prev) => ({ ...prev, [slotKey]: pieceData }));
  };

  const handleRemoveSlot = (key: string) => {
    setSlots((prev) => {
      const next = { ...prev };
      delete next[key];
      return next;
    });
  };

  const allSlotsFilled = requiredSlots.length > 0 && requiredSlots.every((s) => slots[s.key]);

  const handleEnsamblar = async () => {
    if (!selectedInstancia || !allSlotsFilled) return;
    setSaving(true);
    setMessage(null);
    try {
      const componenteIds = Object.values(slots)
        .filter(Boolean)
        .map((p) => p!.id);

      const res = await fetch(
        `${backendUrl}/inventario/instancias-conjunto/${selectedInstancia.id}/ensamblar`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ componenteIds }),
        }
      );

      if (res.ok) {
        setMessage({ type: "success", text: `Conjunto ${selectedInstancia.codigo} ensamblado correctamente.` });
        setSlots({});
        setSelectedInstancia(null);
        if (selectedSucursal) loadPool(selectedSucursal);
      } else {
        const err = await res.json().catch(() => ({}));
        setMessage({ type: "error", text: err.message ?? "Error al ensamblar." });
      }
    } finally {
      setSaving(false);
    }
  };

  const activePieza = activeId
    ? poolPiezas.find((p) => `pieza-${p.id}` === activeId)
    : null;

  return (
    <DndContext sensors={sensors} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Inventario Físico
          </h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Armado de conjuntos y gestión del inventario físico
          </p>
        </div>

        {/* Stats por sucursal */}
        <StatsSucursalesCards stats={statsSucursales} />

        {/* Main tabs */}
        <div className="flex border-b border-border gap-1">
          {(["armado", "inventario"] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setMainTab(tab)}
              className={`px-5 py-2.5 text-sm font-semibold border-b-2 -mb-px transition-colors ${mainTab === tab ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"}`}
            >
              {tab === "armado" ? "Armado" : "Inventario"}
            </button>
          ))}
        </div>

        {mainTab === "inventario" && (
          <InventarioTab instancias={instanciasConjunto} sucursales={sucursales} token={token} backendUrl={backendUrl} />
        )}

        {mainTab === "armado" && <>

        {/* Sucursal selector */}
        <div className="flex flex-wrap gap-2">
          {sucursales.map((s) => (
            <button
              key={s.id}
              onClick={() => {
                setSelectedSucursal(s.id);
                setSelectedInstancia(null);
                setSlots({});
                loadPool(s.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium border transition-all duration-150 ${
                selectedSucursal === s.id
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card border-border hover:border-primary/50 text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.nombre} · {s.ciudad}
            </button>
          ))}
        </div>

        {message && (
          <div className={`flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium ${
            message.type === "success"
              ? "bg-coca/10 text-coca border border-coca/20"
              : "bg-crimson/10 text-crimson border border-crimson/20"
          }`}>
            {message.type === "success" ? "✓" : "⚠"} {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left — Instancias list */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              Instancias ({filteredInstancias.length})
            </p>
            <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
              {filteredInstancias.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No hay instancias en esta sucursal
                </p>
              ) : (
                filteredInstancias.map((inst) => (
                  <button
                    key={inst.id}
                    onClick={() => handleSelectInstancia(inst)}
                    className={`w-full text-left px-4 py-3 rounded-xl border transition-all duration-150 ${
                      selectedInstancia?.id === inst.id
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card hover:border-primary/40"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold">{inst.codigo}</span>
                      <Badge
                        variant="outline"
                        className={`text-xs ${
                          inst.estado === "DISPONIBLE"
                            ? "border-coca/40 text-coca"
                            : inst.estado === "ALQUILADO"
                            ? "border-crimson/40 text-crimson"
                            : "border-gold/40 text-gold"
                        }`}
                      >
                        {inst.estado}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{inst.variacion.conjunto.nombre}</p>
                    <p className="text-xs text-muted-foreground/60">{inst.variacion.conjunto.danza}</p>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Center — Maniquí (slots) */}
          <div className="lg:col-span-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              Maniquí
            </p>
            {!selectedInstancia ? (
              <div className="flex flex-col items-center justify-center py-16 border-2 border-dashed border-border rounded-2xl">
                <svg className="h-10 w-10 text-muted-foreground/30 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" />
                </svg>
                <p className="text-sm text-muted-foreground">Selecciona una instancia</p>
              </div>
            ) : (
              <div className="space-y-2">
                <div className="px-4 py-3 rounded-xl bg-card border border-border">
                  <p className="font-bold text-sm" style={{ fontFamily: "var(--font-outfit)" }}>
                    {selectedInstancia.variacion.conjunto.nombre}
                  </p>
                  <p className="text-xs text-muted-foreground">{selectedInstancia.codigo} · {selectedInstancia.variacion.conjunto.danza}</p>
                </div>

                {requiredSlots.map((slot) => (
                  <SlotDroppable
                    key={slot.key}
                    tipo={slot.tipo}
                    index={slot.index}
                    filled={!!slots[slot.key]}
                    pieza={slots[slot.key] ?? undefined}
                    onRemove={() => handleRemoveSlot(slot.key)}
                  />
                ))}

                <Button
                  onClick={handleEnsamblar}
                  disabled={!allSlotsFilled || saving}
                  className="w-full bg-coca text-white hover:bg-coca/90 mt-2"
                >
                  {saving ? "Ensamblando…" : "Ensamblar Conjunto"}
                </Button>
              </div>
            )}
          </div>

          {/* Right — Pool */}
          <div className="lg:col-span-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground px-1">
              Pool disponible ({availablePool.length})
            </p>
            {loadingPool ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              </div>
            ) : availablePool.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl">
                <p className="text-sm text-muted-foreground">Sin piezas disponibles</p>
                {!selectedSucursal && (
                  <p className="text-xs text-muted-foreground/60 mt-1">Selecciona una sucursal</p>
                )}
              </div>
            ) : (
              <div className="space-y-1.5 max-h-[60vh] overflow-y-auto">
                {availablePool.map((pieza) => (
                  <PiezaCard key={pieza.id} pieza={pieza} isDragging={`pieza-${pieza.id}` === activeId} />
                ))}
              </div>
            )}
          </div>
        </div>
        </>}
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {activePieza ? (
          <div className="px-3 py-2 rounded-xl border bg-card shadow-xl opacity-90 w-52">
            <p className="text-xs font-semibold">{activePieza.componente.tipo}</p>
            <p className="text-xs text-muted-foreground font-mono">{activePieza.serial}</p>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
