'use client';

import { useState, useMemo, useRef, useCallback } from 'react';
import type { ConjuntoCatalogo, VariacionCatalogo } from '../page';

/* ─────────────────────────────────── env ────────────────────────────────── */
const WA_NUMBER = process.env.NEXT_PUBLIC_WHATSAPP_NUMBER ?? '59170000000';
const BACKEND = process.env.NEXT_PUBLIC_BACKEND_URL ?? 'http://localhost:3001';

/* ─────────────────────────────────── helpers ─────────────────────────────── */
function bs(n: number) {
  return n.toLocaleString('es-BO', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

function varLabel(v: VariacionCatalogo) {
  const parts = [v.nombre_variacion];
  if (v.talla) parts.push(`Talla ${v.talla}`);
  if (v.color) parts.push(v.color);
  return parts.join(' · ');
}

function efectivePrecio(c: ConjuntoCatalogo, variacionId: number | null): number {
  if (variacionId) {
    const v = c.variaciones.find((x) => x.id === variacionId);
    if (v?.precio_alquiler) return v.precio_alquiler;
  }
  return c.precio_base;
}

/* ─────────────────────────────────── types ──────────────────────────────── */
export type CartItem = {
  key: string; // unique per item
  conjuntoId: number;
  conjuntoNombre: string;
  danza: string;
  imagen_url: string | null;
  variacionId: number | null;
  variacionNombre: string | null;
  talla: string | null;
  cantidad: number;
  dias: number;
  precioUnitario: number;
};

type ReservaForm = {
  nombre: string;
  ci: string;
  celular: string;
  fechaEvento: string;
  evento: string;
};

/* ─────────────────────────────────── modal ──────────────────────────────── */
function Modal({
  open,
  onClose,
  children,
  maxWidth = 'max-w-lg',
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  maxWidth?: string;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className={`relative z-10 w-full ${maxWidth} max-h-[92vh] overflow-y-auto rounded-2xl bg-white shadow-2xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </div>
  );
}

function ModalHeader({
  title,
  subtitle,
  badge,
  onClose,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
  onClose: () => void;
}) {
  return (
    <div>
      <div className="h-1 aguayo-stripe w-full rounded-t-2xl" />
      <div className="px-6 pt-5 pb-4 border-b border-gray-100 flex items-start justify-between gap-4">
        <div>
          {badge && (
            <p className="text-xs font-semibold uppercase tracking-widest text-crimson mb-1">{badge}</p>
          )}
          <h2 className="text-xl font-bold text-graphite" style={{ fontFamily: 'var(--font-outfit)' }}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-gray-400 mt-0.5">{subtitle}</p>}
        </div>
        <button
          onClick={onClose}
          className="mt-1 p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors shrink-0"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}

/* ────────────────────────── add-to-cart modal ───────────────────────────── */
function AddToCartModal({
  conjunto,
  onClose,
  onAdd,
}: {
  conjunto: ConjuntoCatalogo | null;
  onClose: () => void;
  onAdd: (item: Omit<CartItem, 'key'>) => void;
}) {
  const [variacionId, setVariacionId] = useState<number | null>(null);
  const [cantidad, setCantidad] = useState(1);
  const [dias, setDias] = useState(1);

  // Reset when conjunto changes
  const prevId = useRef<number | null>(null);
  if (conjunto && conjunto.id !== prevId.current) {
    prevId.current = conjunto.id;
    // Auto-select first available variation
  }

  if (!conjunto) return null;

  const tieneVariaciones = conjunto.variaciones.length > 0;
  const varSeleccionada = variacionId ? conjunto.variaciones.find((v) => v.id === variacionId) : null;

  // available stock for selected variation (or global if no variation selected)
  const maxCant = varSeleccionada
    ? varSeleccionada.disponible
    : conjunto.variaciones.reduce((s, v) => s + v.disponible, 0);

  const precio = efectivePrecio(conjunto, variacionId);
  const subtotal = precio * cantidad;
  const anticipo = Math.ceil(subtotal * 0.3);

  // Need to pick a variation if they exist
  const canAdd = !tieneVariaciones || variacionId !== null;

  function handleAdd() {
    if (!canAdd) return;
    onAdd({
      conjuntoId: conjunto!.id,
      conjuntoNombre: conjunto!.nombre,
      danza: conjunto!.danza,
      imagen_url: conjunto!.imagen_url,
      variacionId,
      variacionNombre: varSeleccionada ? varLabel(varSeleccionada) : null,
      talla: varSeleccionada?.talla ?? null,
      cantidad,
      dias,
      precioUnitario: precio,
    });
    onClose();
  }

  return (
    <Modal open onClose={onClose}>
      <ModalHeader
        badge={conjunto.danza}
        title={conjunto.nombre}
        subtitle={`Bs. ${bs(conjunto.precio_base)} / traje`}
        onClose={onClose}
      />

      <div className="px-6 py-5 space-y-5">
        {/* Variation selector */}
        {tieneVariaciones && (
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Variación / Talla *
            </label>
            <div className="grid grid-cols-2 gap-2">
              {conjunto.variaciones.map((v) => {
                const agotada = v.disponible === 0;
                const sel = variacionId === v.id;
                return (
                  <button
                    key={v.id}
                    onClick={() => !agotada && setVariacionId(v.id)}
                    disabled={agotada}
                    className={`relative px-3 py-2.5 rounded-xl border text-left transition-all ${
                      sel
                        ? 'border-crimson bg-crimson-light ring-2 ring-crimson/20'
                        : agotada
                        ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                        : 'border-gray-200 hover:border-crimson/40 hover:bg-gray-50'
                    }`}
                  >
                    <p className="text-sm font-semibold text-graphite leading-tight">
                      {v.nombre_variacion}
                      {v.talla && <span className="font-normal text-gray-500"> · {v.talla}</span>}
                    </p>
                    {v.color && <p className="text-xs text-gray-400 mt-0.5">{v.color}</p>}
                    <div className="flex items-center gap-1 mt-1">
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${
                          agotada ? 'bg-red-400' : v.disponible <= 3 ? 'bg-amber-400' : 'bg-emerald-400'
                        }`}
                      />
                      <span className="text-xs text-gray-400">
                        {agotada ? 'Sin stock' : `${v.disponible} disp.`}
                      </span>
                    </div>
                    {v.precio_alquiler && v.precio_alquiler !== conjunto.precio_base && (
                      <span className="absolute top-2 right-2 text-xs font-bold text-crimson">
                        Bs.{bs(v.precio_alquiler)}
                      </span>
                    )}
                    {sel && (
                      <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-crimson flex items-center justify-center">
                        <svg className="w-2.5 h-2.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
            {tieneVariaciones && !variacionId && (
              <p className="text-xs text-crimson mt-1.5">Selecciona una variación para continuar.</p>
            )}
          </div>
        )}

        {/* Qty + days */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Cantidad
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setCantidad((n) => Math.max(1, n - 1))}
                className="px-3 py-2.5 text-gray-400 hover:text-crimson hover:bg-gray-50 transition-colors font-bold text-lg leading-none"
              >
                −
              </button>
              <span className="flex-1 text-center font-bold text-graphite text-lg">{cantidad}</span>
              <button
                onClick={() => setCantidad((n) => (maxCant > 0 ? Math.min(maxCant, n + 1) : n + 1))}
                className="px-3 py-2.5 text-gray-400 hover:text-crimson hover:bg-gray-50 transition-colors font-bold text-lg leading-none"
              >
                +
              </button>
            </div>
            {maxCant > 0 && (
              <p className="text-xs text-gray-400 mt-1 text-center">Máx. {maxCant} disponibles</p>
            )}
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-2">
              Días
            </label>
            <div className="flex items-center border border-gray-200 rounded-xl overflow-hidden">
              <button
                onClick={() => setDias((n) => Math.max(1, n - 1))}
                className="px-3 py-2.5 text-gray-400 hover:text-crimson hover:bg-gray-50 transition-colors font-bold text-lg leading-none"
              >
                −
              </button>
              <span className="flex-1 text-center font-bold text-graphite text-lg">{dias}</span>
              <button
                onClick={() => setDias((n) => n + 1)}
                className="px-3 py-2.5 text-gray-400 hover:text-crimson hover:bg-gray-50 transition-colors font-bold text-lg leading-none"
              >
                +
              </button>
            </div>
          </div>
        </div>

        {/* Price preview */}
        <div className="bg-linear-to-br from-crimson-light to-[#FFF7ED] rounded-2xl p-4 space-y-2">
          <div className="flex justify-between text-sm text-gray-500">
            <span>Precio / traje</span>
            <span className="font-medium text-gray-700">Bs. {bs(precio)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500">
            <span>
              {cantidad} traje{cantidad !== 1 ? 's' : ''} × {dias} día{dias !== 1 ? 's' : ''}
            </span>
            <span className="font-medium text-gray-700">Bs. {bs(subtotal)}</span>
          </div>
          <div className="border-t border-crimson/10 pt-2 flex justify-between">
            <span className="font-bold text-graphite">Subtotal</span>
            <span className="font-bold text-xl text-crimson" style={{ fontFamily: 'var(--font-outfit)' }}>
              Bs. {bs(subtotal)}
            </span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-gold font-semibold">Anticipo mínimo (30%)</span>
            <span className="font-bold text-gold">Bs. {bs(anticipo)}</span>
          </div>
        </div>
      </div>

      <div className="px-6 pb-6 flex flex-col gap-2.5">
        <button
          onClick={handleAdd}
          disabled={!canAdd}
          className="w-full py-3 rounded-xl bg-crimson text-white font-bold text-base hover:bg-crimson-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          Agregar al carrito →
        </button>
        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl border border-gray-200 text-gray-500 font-medium text-sm hover:bg-gray-50 transition-colors"
        >
          Cancelar
        </button>
      </div>
    </Modal>
  );
}

/* ──────────────────────────────── cart drawer ───────────────────────────── */
function CartDrawer({
  open,
  items,
  onClose,
  onRemove,
  onUpdateCantidad,
  onUpdateDias,
  onReservar,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
  onRemove: (key: string) => void;
  onUpdateCantidad: (key: string, delta: number) => void;
  onUpdateDias: (key: string, delta: number) => void;
  onReservar: () => void;
}) {
  if (!open) return null;

  const total = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const anticipo = Math.ceil(total * 0.3);

  return (
    <div className="fixed inset-0 z-50 flex" onClick={onClose}>
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      {/* Panel slides from right */}
      <div
        className="relative ml-auto w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="h-1 aguayo-stripe w-full" />
        <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
          <div>
            <h2 className="font-bold text-graphite text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>
              Tu selección
            </h2>
            <p className="text-xs text-gray-400">
              {items.length} producto{items.length !== 1 ? 's' : ''}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <p className="text-sm">Sin productos aún.</p>
              <p className="text-xs mt-1">Explora el catálogo y agrega trajes.</p>
            </div>
          ) : (
            items.map((item) => (
              <div key={item.key} className="bg-gray-50 rounded-2xl p-3.5">
                <div className="flex items-start gap-3">
                  {/* Image/initial */}
                  <div className="w-12 h-12 rounded-xl bg-linear-to-br from-[#3D0A0A] to-graphite shrink-0 flex items-center justify-center overflow-hidden">
                    {item.imagen_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={item.imagen_url} alt={item.conjuntoNombre} className="w-full h-full object-cover" />
                    ) : (
                      <span className="text-white/40 font-bold text-lg" style={{ fontFamily: 'var(--font-outfit)' }}>
                        {item.conjuntoNombre.charAt(0)}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-graphite text-sm leading-tight truncate">{item.conjuntoNombre}</p>
                    <p className="text-xs text-gray-400">{item.danza}</p>
                    {item.variacionNombre && (
                      <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-crimson-light text-crimson text-xs font-medium">
                        {item.variacionNombre}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => onRemove(item.key)}
                    className="p-1 rounded-lg text-gray-300 hover:text-red-400 hover:bg-red-50 transition-colors shrink-0"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>

                <div className="mt-3 flex items-center justify-between gap-2">
                  {/* Qty */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-1">Cant.</span>
                    <button
                      onClick={() => onUpdateCantidad(item.key, -1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-crimson hover:text-crimson text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-graphite">{item.cantidad}</span>
                    <button
                      onClick={() => onUpdateCantidad(item.key, 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-crimson hover:text-crimson text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Days */}
                  <div className="flex items-center gap-1">
                    <span className="text-xs text-gray-400 mr-1">Días</span>
                    <button
                      onClick={() => onUpdateDias(item.key, -1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-crimson hover:text-crimson text-sm font-bold transition-colors"
                    >
                      −
                    </button>
                    <span className="w-7 text-center text-sm font-bold text-graphite">{item.dias}</span>
                    <button
                      onClick={() => onUpdateDias(item.key, 1)}
                      className="w-6 h-6 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:border-crimson hover:text-crimson text-sm font-bold transition-colors"
                    >
                      +
                    </button>
                  </div>
                  {/* Subtotal */}
                  <div className="text-right">
                    <p className="text-xs text-gray-400">Subtotal</p>
                    <p className="font-bold text-crimson text-sm">
                      Bs. {bs(item.precioUnitario * item.cantidad)}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer summary + CTA */}
        {items.length > 0 && (
          <div className="border-t border-gray-100 px-5 py-4 space-y-3">
            <div className="bg-linear-to-br from-crimson-light to-[#FFF7ED] rounded-xl p-3 space-y-1.5">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Total estimado</span>
                <span className="font-bold text-graphite">Bs. {bs(total)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gold font-semibold">Anticipo mínimo (30%)</span>
                <span className="font-bold text-gold">Bs. {bs(anticipo)}</span>
              </div>
            </div>
            <button
              onClick={onReservar}
              className="w-full py-3 rounded-xl bg-crimson text-white font-bold text-base hover:bg-crimson-dark transition-colors shadow-md"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              Solicitar reserva →
            </button>
            <p className="text-xs text-gray-400 text-center">
              Un asesor confirmará disponibilidad y anticipo.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

/* ───────────────────────────────── reserva modal ───────────────────────── */
function ReservaModal({
  open,
  items,
  onClose,
}: {
  open: boolean;
  items: CartItem[];
  onClose: () => void;
}) {
  const [form, setForm] = useState<ReservaForm>({
    nombre: '',
    ci: '',
    celular: '',
    fechaEvento: '',
    evento: '',
  });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  function update(k: keyof ReservaForm, v: string) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  const total = items.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);
  const anticipo = Math.ceil(total * 0.3);

  const isValid =
    form.nombre.trim() &&
    form.ci.trim() &&
    form.celular.trim() &&
    form.fechaEvento &&
    form.evento.trim();

  async function handleEnviar() {
    if (!isValid || loading) return;
    setLoading(true);
    setError('');

    const payload = {
      nombre: form.nombre.trim(),
      ci: form.ci.trim(),
      celular: form.celular.trim(),
      evento: form.evento.trim(),
      fechaEvento: form.fechaEvento,
      items: items.map((i) => ({
        conjuntoId: i.conjuntoId,
        conjuntoNombre: i.conjuntoNombre,
        danza: i.danza,
        variacionId: i.variacionId,
        variacionNombre: i.variacionNombre,
        talla: i.talla,
        cantidad: i.cantidad,
        dias: i.dias,
        precioUnitario: i.precioUnitario,
        subtotal: i.precioUnitario * i.cantidad,
      })),
      totalEstimado: total,
      anticipoMin: anticipo,
    };

    try {
      const res = await fetch(`${BACKEND}/bot/public/solicitud-reserva`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error('Error al enviar');

      setSent(true);

      // Also open WhatsApp with summary
      const itemsText = items
        .map(
          (i) =>
            `  • ${i.conjuntoNombre}${i.variacionNombre ? ` (${i.variacionNombre})` : ''} × ${i.cantidad} — Bs. ${bs(i.precioUnitario * i.cantidad)}`,
        )
        .join('\n');

      const msg =
        `🎭 *Solicitud de reserva — FolkloreSoft*\n\n` +
        `👤 *${form.nombre}*\n` +
        `🪪 CI: ${form.ci}\n` +
        `📱 Celular: ${form.celular}\n\n` +
        `🏫 Evento: ${form.evento}\n` +
        `📅 Fecha: ${form.fechaEvento}\n\n` +
        `🛒 *Trajes seleccionados:*\n${itemsText}\n\n` +
        `💰 Total estimado: *Bs. ${bs(total)}*\n` +
        `💳 Anticipo mínimo (30%): *Bs. ${bs(anticipo)}*\n\n` +
        `_Solicitud enviada desde el catálogo web._`;

      window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
    } catch {
      setError('No se pudo enviar la solicitud. Intenta de nuevo o contáctanos por WhatsApp.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal open={open} onClose={onClose} maxWidth="max-w-lg">
      {sent ? (
        <div className="p-8 text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-graphite mb-2" style={{ fontFamily: 'var(--font-outfit)' }}>
            ¡Solicitud enviada!
          </h3>
          <p className="text-gray-500 text-sm mb-1">
            Tu solicitud fue registrada. También se abrió WhatsApp para que
            puedas confirmar directamente con un asesor.
          </p>
          <p className="text-xs text-gray-400 mb-6">⏰ Atención: Lun–Sáb 8:00–20:00</p>
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-crimson text-white font-semibold hover:bg-crimson-dark transition-colors"
          >
            Volver al catálogo
          </button>
        </div>
      ) : (
        <>
          <ModalHeader
            badge="Solicitud de reserva"
            title="Tus datos"
            subtitle={`${items.length} producto${items.length !== 1 ? 's' : ''} · Total Bs. ${bs(total)}`}
            onClose={onClose}
          />

          <div className="px-6 py-5 space-y-4">
            {/* Order summary */}
            <div className="bg-gray-50 rounded-xl divide-y divide-gray-100">
              {items.map((item) => (
                <div key={item.key} className="px-3 py-2.5 flex justify-between items-center gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-graphite truncate">{item.conjuntoNombre}</p>
                    <p className="text-xs text-gray-400">
                      {item.variacionNombre ? `${item.variacionNombre} · ` : ''}
                      {item.cantidad} × {item.dias} día{item.dias !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <span className="text-sm font-bold text-crimson shrink-0">
                    Bs. {bs(item.precioUnitario * item.cantidad)}
                  </span>
                </div>
              ))}
              <div className="px-3 py-2 flex justify-between">
                <span className="text-sm font-bold text-graphite">Total</span>
                <span className="font-bold text-crimson">Bs. {bs(total)}</span>
              </div>
            </div>

            {/* Form fields */}
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nombre completo *
                </label>
                <input
                  type="text"
                  placeholder="Ej. María García Mamani"
                  value={form.nombre}
                  onChange={(e) => update('nombre', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  CI *
                </label>
                <input
                  type="text"
                  placeholder="Cédula de identidad"
                  value={form.ci}
                  onChange={(e) => update('ci', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Celular *
                </label>
                <input
                  type="tel"
                  placeholder="Ej. 70000000"
                  value={form.celular}
                  onChange={(e) => update('celular', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Fecha del evento *
                </label>
                <input
                  type="date"
                  value={form.fechaEvento}
                  onChange={(e) => update('fechaEvento', e.target.value)}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1.5">
                  Nombre del evento *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Entrada Universitaria"
                  value={form.evento}
                  onChange={(e) => update('evento', e.target.value)}
                  className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson transition-colors"
                />
              </div>
            </div>

            {error && (
              <p className="text-xs text-red-500 bg-red-50 rounded-lg px-3 py-2">{error}</p>
            )}

            <div className="bg-gold-light border border-gold/30 rounded-xl p-3 text-xs text-[#92610F]">
              <strong>¿Cómo funciona?</strong> Tu solicitud se registra en nuestro sistema y se
              abre WhatsApp con el resumen. Un asesor confirmará disponibilidad y te indicará
              cómo realizar el anticipo.
            </div>
          </div>

          <div className="px-6 pb-6 flex flex-col gap-2.5">
            <button
              onClick={handleEnviar}
              disabled={!isValid || loading}
              className="w-full py-3 rounded-xl bg-[#25D366] text-white font-bold text-base hover:bg-[#20BD5A] disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-md flex items-center justify-center gap-2"
              style={{ fontFamily: 'var(--font-outfit)' }}
            >
              {loading ? (
                <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
              )}
              {loading ? 'Enviando…' : 'Enviar solicitud por WhatsApp'}
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}

/* ──────────────────────────────── product card ──────────────────────────── */
function ConjuntoCard({
  conjunto,
  onAgregar,
}: {
  conjunto: ConjuntoCatalogo;
  onAgregar: (c: ConjuntoCatalogo) => void;
}) {
  const totalDisp = conjunto.variaciones.reduce((s, v) => s + v.disponible, 0);
  const totalInst = conjunto.variaciones.reduce((s, v) => s + v.total, 0);
  const pct = totalInst > 0 ? Math.round((totalDisp / totalInst) * 100) : 0;

  const availColor =
    totalDisp === 0
      ? 'bg-red-100 text-red-700'
      : totalDisp <= 5
      ? 'bg-amber-100 text-amber-700'
      : 'bg-emerald-100 text-emerald-700';

  const availLabel =
    totalDisp === 0 ? 'Sin stock' : totalDisp <= 5 ? `Solo ${totalDisp}` : `${totalDisp} disp.`;

  // Show up to 3 variation chips
  const varChips = conjunto.variaciones.slice(0, 4);

  return (
    <div className="group bg-white rounded-2xl shadow-sm hover:shadow-xl border border-gray-100 overflow-hidden transition-all duration-300 hover:-translate-y-1 flex flex-col">
      {/* Image */}
      <div className="relative h-48 bg-linear-to-br from-[#3D0A0A] to-graphite overflow-hidden flex items-center justify-center">
        {conjunto.imagen_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={conjunto.imagen_url}
            alt={conjunto.nombre}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <span className="text-5xl font-bold text-white/15 select-none" style={{ fontFamily: 'var(--font-outfit)' }}>
            {conjunto.nombre.charAt(0)}
          </span>
        )}
        <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full text-xs font-semibold bg-crimson text-white shadow">
          {conjunto.danza}
        </span>
        <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-xs font-semibold shadow ${availColor}`}>
          {availLabel}
        </span>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 gap-3">
        <div>
          <h3 className="font-bold text-graphite text-base leading-tight" style={{ fontFamily: 'var(--font-outfit)' }}>
            {conjunto.nombre}
          </h3>
          {totalInst > 0 && (
            <div className="mt-1.5">
              <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{
                    width: `${pct}%`,
                    background: pct === 0 ? '#EF4444' : pct < 40 ? '#F59E0B' : '#10B981',
                  }}
                />
              </div>
            </div>
          )}

          {/* Variation chips */}
          {varChips.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {varChips.map((v) => (
                <span
                  key={v.id}
                  className={`px-2 py-0.5 rounded-full text-xs border ${
                    v.disponible > 0
                      ? 'border-gray-200 text-gray-500 bg-gray-50'
                      : 'border-gray-100 text-gray-300 line-through'
                  }`}
                >
                  {v.nombre_variacion}{v.talla ? ` ${v.talla}` : ''}
                </span>
              ))}
              {conjunto.variaciones.length > 4 && (
                <span className="px-2 py-0.5 rounded-full text-xs border border-gray-200 text-gray-400">
                  +{conjunto.variaciones.length - 4} más
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-end justify-between mt-auto gap-2">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wide">Desde</p>
            <p className="text-xl font-bold text-crimson" style={{ fontFamily: 'var(--font-outfit)' }}>
              Bs.&nbsp;{bs(conjunto.precio_base)}
            </p>
          </div>
          <button
            onClick={() => onAgregar(conjunto)}
            disabled={totalDisp === 0}
            className="px-4 py-2 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson-dark disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Agregar
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─────────────────────────────────── main ───────────────────────────────── */
export function CatalogoClient({ conjuntos }: { conjuntos: ConjuntoCatalogo[] }) {
  const [search, setSearch] = useState('');
  const [danzaFilter, setDanzaFilter] = useState('Todos');
  const [addingConjunto, setAddingConjunto] = useState<ConjuntoCatalogo | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [cartOpen, setCartOpen] = useState(false);
  const [reservaOpen, setReservaOpen] = useState(false);

  const catalogoRef = useRef<HTMLDivElement>(null);

  const danzas = useMemo(
    () => ['Todos', ...Array.from(new Set(conjuntos.map((c) => c.danza))).sort()],
    [conjuntos],
  );

  const filtered = useMemo(() => {
    let list = conjuntos;
    if (danzaFilter !== 'Todos') list = list.filter((c) => c.danza === danzaFilter);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (c) => c.nombre.toLowerCase().includes(q) || c.danza.toLowerCase().includes(q),
      );
    }
    return list;
  }, [conjuntos, danzaFilter, search]);

  const totalCart = cart.reduce((s, i) => s + i.precioUnitario * i.cantidad, 0);

  const handleAdd = useCallback((item: Omit<CartItem, 'key'>) => {
    setCart((prev) => [
      ...prev,
      { ...item, key: `${item.conjuntoId}-${item.variacionId ?? 0}-${Date.now()}` },
    ]);
    setCartOpen(true);
  }, []);

  const handleRemove = useCallback((key: string) => {
    setCart((prev) => prev.filter((i) => i.key !== key));
  }, []);

  const handleUpdateCantidad = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, cantidad: Math.max(1, i.cantidad + delta) } : i,
      ),
    );
  }, []);

  const handleUpdateDias = useCallback((key: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) =>
        i.key === key ? { ...i, dias: Math.max(1, i.dias + delta) } : i,
      ),
    );
  }, []);

  return (
    <div className="min-h-screen bg-cream">
      {/* ── NAV ───────────────────────────────────────────────────────── */}
      <nav className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-crimson flex items-center justify-center">
              <span className="text-white font-bold text-base" style={{ fontFamily: 'var(--font-outfit)' }}>F</span>
            </div>
            <span className="font-bold text-graphite text-lg hidden sm:block" style={{ fontFamily: 'var(--font-outfit)' }}>
              FOLCKLORE
            </span>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart button */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative flex items-center gap-2 px-4 py-2 rounded-xl border border-gray-200 text-gray-700 text-sm font-semibold hover:border-crimson hover:text-crimson transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
              <span className="hidden sm:inline">Mi selección</span>
              {cart.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-crimson text-white text-xs font-bold flex items-center justify-center">
                  {cart.length}
                </span>
              )}
              {cart.length > 0 && (
                <span className="hidden sm:inline text-crimson font-bold">
                  · Bs. {bs(totalCart)}
                </span>
              )}
            </button>

            <a
              href={`https://wa.me/${WA_NUMBER}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20BD5A] transition-colors shadow-sm"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
              </svg>
              <span className="hidden sm:inline">WhatsApp</span>
            </a>
          </div>
        </div>
      </nav>

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="aguayo-stripe w-full h-1" />
        <div
          className="absolute inset-0"
          style={{ background: 'radial-gradient(ellipse at 70% 50%, #3D0A0A 0%, #18181B 60%, #0D0D0F 100%)' }}
        />
        <div
          className="absolute right-0 top-1/2 -translate-y-1/2 w-96 h-96 rounded-full opacity-10 pointer-events-none"
          style={{ background: 'radial-gradient(circle, #D4AF37 0%, transparent 70%)' }}
        />
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
          <div className="max-w-2xl">
            <div className="flex flex-wrap gap-2 mb-5">
              {['Caporales', 'Morenada', 'Tinku', 'Diablada', 'Saya'].map((d) => (
                <span key={d} className="px-3 py-1 rounded-full text-xs font-medium border border-white/10 text-white/50 bg-white/5">
                  {d}
                </span>
              ))}
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-outfit)' }}>
              Trajes folklóricos{' '}
              <span style={{ color: '#D4AF37' }}>bolivianos</span>
              <br />para tu evento
            </h1>
            <div className="aguayo-stripe w-20 h-1 rounded-full mb-5" />
            <p className="text-gray-300 text-base leading-relaxed mb-6">
              Elige varios trajes, selecciona talla y variación, calcula el precio al instante
              y envía tu solicitud de reserva en segundos.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => catalogoRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="px-6 py-3 rounded-xl bg-crimson text-white font-bold hover:bg-crimson-dark transition-colors shadow-lg"
                style={{ fontFamily: 'var(--font-outfit)' }}
              >
                Ver catálogo →
              </button>
            </div>
          </div>
        </div>
        {/* Stats */}
        <div className="relative z-10 border-t border-white/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 grid grid-cols-3 gap-4">
            {[
              { n: conjuntos.length, label: 'Conjuntos' },
              { n: conjuntos.reduce((s, c) => s + c.variaciones.reduce((sv, v) => sv + v.total, 0), 0), label: 'Trajes en stock' },
              { n: Array.from(new Set(conjuntos.map((c) => c.danza))).length, label: 'Danzas' },
            ].map(({ n, label }) => (
              <div key={label} className="text-center">
                <p className="text-xl font-bold text-gold" style={{ fontFamily: 'var(--font-outfit)' }}>{n}</p>
                <p className="text-xs text-gray-400">{label}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="aguayo-stripe w-full h-1" />
      </section>

      {/* ── CATALOG ──────────────────────────────────────────────────── */}
      <section ref={catalogoRef} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-7">
          <h2 className="text-2xl font-bold text-graphite mb-1" style={{ fontFamily: 'var(--font-outfit)' }}>
            Catálogo de trajes
          </h2>
          <p className="text-gray-500 text-sm">Selecciona variación/talla y agrega al carrito · Puedes elegir varios trajes distintos</p>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-7">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="Buscar traje o danza…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-crimson/20 focus:border-crimson bg-white transition-colors"
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {danzas.map((d) => (
              <button
                key={d}
                onClick={() => setDanzaFilter(d)}
                className={`px-3.5 py-2 rounded-xl text-sm font-medium transition-colors border ${
                  danzaFilter === d
                    ? 'bg-crimson text-white border-crimson'
                    : 'bg-white text-gray-600 border-gray-200 hover:border-crimson/40 hover:text-crimson'
                }`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm">No se encontraron trajes.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((c) => (
              <ConjuntoCard key={c.id} conjunto={c} onAgregar={setAddingConjunto} />
            ))}
          </div>
        )}
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────── */}
      <section className="bg-white border-t border-gray-100 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-bold text-graphite mb-8 text-center" style={{ fontFamily: 'var(--font-outfit)' }}>
            ¿Cómo funciona?
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {[
              { icon: '🔍', step: '1', title: 'Explora', desc: 'Navega por todos los trajes y filtra por danza.' },
              { icon: '👕', step: '2', title: 'Elige talla', desc: 'Selecciona variación y talla en cada traje.' },
              { icon: '🛒', step: '3', title: 'Arma tu pedido', desc: 'Agrega varios trajes distintos al carrito.' },
              { icon: '📱', step: '4', title: 'Reserva', desc: 'Llena tus datos y envía por WhatsApp. ¡Listo!' },
            ].map(({ icon, step, title, desc }) => (
              <div key={step} className="relative text-center p-4">
                <div className="w-12 h-12 rounded-2xl bg-crimson-light flex items-center justify-center mx-auto mb-3">
                  <span className="text-xl">{icon}</span>
                </div>
                <span className="absolute top-3 left-1/2 translate-x-3 w-5 h-5 rounded-full bg-crimson text-white text-xs font-bold flex items-center justify-center">
                  {step}
                </span>
                <h3 className="font-bold text-graphite mb-1 text-sm" style={{ fontFamily: 'var(--font-outfit)' }}>
                  {title}
                </h3>
                <p className="text-xs text-gray-500">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────── */}
      <footer className="bg-graphite">
        <div className="aguayo-stripe w-full h-1" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <div className="w-8 h-8 rounded-lg bg-crimson flex items-center justify-center">
                  <span className="text-white font-bold text-sm" style={{ fontFamily: 'var(--font-outfit)' }}>F</span>
                </div>
                <span className="text-white font-bold" style={{ fontFamily: 'var(--font-outfit)' }}>FOLCKLORE</span>
              </div>
              <p className="text-gray-400 text-sm">Especialistas en trajes folklóricos bolivianos.</p>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide">Sedes</h4>
              <div className="space-y-1 text-sm text-gray-400">
                <p>📍 <strong className="text-white">La Paz</strong> — Av. 16 de Julio #1234</p>
                <p>📍 <strong className="text-white">Cochabamba</strong> — Av. Heroínas #567</p>
              </div>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-2 text-sm uppercase tracking-wide">Atención</h4>
              <p className="text-sm text-gray-400 mb-3">⏰ Lun–Sáb 8:00–20:00</p>
              <a
                href={`https://wa.me/${WA_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-[#25D366] text-white text-sm font-semibold hover:bg-[#20BD5A] transition-colors"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                </svg>
                Escribir por WhatsApp
              </a>
            </div>
          </div>
          <div className="border-t border-white/10 pt-5 text-center text-xs text-gray-500">
            © {new Date().getFullYear()} FOLCKLORE Bolivia
          </div>
        </div>
      </footer>

      {/* ── MODALS & OVERLAYS ────────────────────────────────────────── */}
      <AddToCartModal
        conjunto={addingConjunto}
        onClose={() => setAddingConjunto(null)}
        onAdd={handleAdd}
      />

      <CartDrawer
        open={cartOpen}
        items={cart}
        onClose={() => setCartOpen(false)}
        onRemove={handleRemove}
        onUpdateCantidad={handleUpdateCantidad}
        onUpdateDias={handleUpdateDias}
        onReservar={() => {
          setCartOpen(false);
          setReservaOpen(true);
        }}
      />

      <ReservaModal
        open={reservaOpen}
        items={cart}
        onClose={() => {
          setReservaOpen(false);
          setCart([]);
        }}
      />

      {/* Floating cart button (mobile) */}
      {cart.length > 0 && (
        <button
          onClick={() => setCartOpen(true)}
          className="fixed bottom-6 left-6 z-30 flex items-center gap-2 px-4 py-3 rounded-full bg-crimson text-white shadow-xl hover:bg-crimson-dark transition-all"
          style={{ fontFamily: 'var(--font-outfit)' }}
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
          </svg>
          <span className="font-bold text-sm">{cart.length} · Bs. {bs(totalCart)}</span>
        </button>
      )}

      {/* Floating WhatsApp */}
      <a
        href={`https://wa.me/${WA_NUMBER}`}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-30 w-14 h-14 rounded-full bg-[#25D366] shadow-xl flex items-center justify-center hover:scale-110 transition-transform"
        title="WhatsApp"
      >
        <svg className="w-7 h-7 text-white" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 00-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
        </svg>
      </a>
    </div>
  );
}
