import type { SendWaveProvider } from '@gamastudio/sendwave-provider';

// ── Tipos de payload ──────────────────────────────────────────────────────────

interface Prenda {
  modelo: string;
  total: number;
  costo_unitario: number;
  subtotal: number;
  variacion?: { nombre_variacion: string; talla?: string | null } | null;
}

interface Garantia {
  tipo: string;
  descripcion?: string | null;
  valor?: number | null;
}

interface Participante {
  nombre: string;
  ci?: string | null;
  tipo?: string | null;
  instanciaConjunto?: { codigo: string } | null;
}

interface Contrato {
  codigo: string;
  cliente: { nombre: string; celular?: string | null };
  evento?: { nombre: string } | null;
  nombre_evento_ext?: string | null;
  fecha_entrega: string;
  fecha_devolucion: string;
  total: number;
  total_pagado: number;
  anticipo: number;
  prendas: Prenda[];
  garantias: Garantia[];
  participantes: Participante[];
}

type NotifyPayload =
  | { type: 'COMPROBANTE_ENTREGA';      to: string; contrato: Contrato }
  | { type: 'PRENDA_LISTA';             to: string; data: { clienteNombre: string; contratoCode: string; participanteNombre: string; instanciaCodigo: string; prendaModelo: string } }
  | { type: 'DEVOLUCION_PARTICIPANTE';  to: string; data: { clienteNombre: string; contratoCode: string; participanteNombre: string; instanciaCodigo?: string | null } }
  | { type: 'RECORDATORIO_DEVOLUCION'; to: string; data: { clienteNombre: string; contratoCode: string; fechaDevolucion: string; pendientes: string[] } };

// ── Formateadores ─────────────────────────────────────────────────────────────

function fmt(n: number | string) {
  return parseFloat(String(n)).toFixed(2);
}

function fmtDate(d: string) {
  try {
    return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return d; }
}

function comprobante(c: Contrato): string {
  const eventoNombre = c.evento?.nombre ?? c.nombre_evento_ext ?? '—';
  const saldo = Number(c.total) - Number(c.total_pagado);

  const prendasTxt = c.prendas.map((p) => {
    const varTxt = p.variacion ? ` (${p.variacion.nombre_variacion}${p.variacion.talla ? ` · ${p.variacion.talla}` : ''})` : '';
    return `  • ${p.modelo}${varTxt} × ${p.total} — Bs. ${fmt(p.subtotal)}`;
  }).join('\n');

  const participantesTxt = c.participantes
    .filter((p) => p.instanciaConjunto)
    .map((p) => `  • ${p.nombre}${p.ci ? ` · CI ${p.ci}` : ''}${p.tipo ? ` (${p.tipo})` : ''} → 📦 ${p.instanciaConjunto!.codigo}`)
    .join('\n') || '  (sin asignaciones individuales)';

  const garantiasTxt = c.garantias.length
    ? c.garantias.map((g) => `  • ${g.tipo}${g.descripcion ? ` — ${g.descripcion}` : ''}${g.valor ? ` · Bs. ${fmt(g.valor)}` : ''}`).join('\n')
    : '  (sin garantías)';

  return (
    `🎭 *COMPROBANTE DE ENTREGA — FolkloreSoft*\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `📄 Contrato: *${c.codigo}*\n` +
    `👤 Cliente: ${c.cliente.nombre}\n` +
    `🎪 Evento: ${eventoNombre}\n` +
    `📅 Entrega: ${fmtDate(c.fecha_entrega)}\n` +
    `📅 Devolución: ${fmtDate(c.fecha_devolucion)}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👕 *PRENDAS ENTREGADAS:*\n${prendasTxt}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `👥 *PARTICIPANTES Y PRENDAS:*\n${participantesTxt}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `🔒 *GARANTÍAS RECIBIDAS:*\n${garantiasTxt}\n` +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `💰 Total: Bs. ${fmt(c.total)}\n` +
    `✅ Pagado: Bs. ${fmt(c.total_pagado)}\n` +
    (saldo > 0 ? `⚠️ Saldo pendiente: *Bs. ${fmt(saldo)}*\n` : `✅ Pagado completo\n`) +
    `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
    `_Por favor conserve este comprobante. Al devolver las prendas le será solicitado._\n` +
    `📞 Consultas: escriba *menú* a este número.`
  );
}

// ── Handler principal ─────────────────────────────────────────────────────────

export async function handleNotify(body: unknown, provider: SendWaveProvider) {
  const payload = body as NotifyPayload;

  switch (payload.type) {
    case 'COMPROBANTE_ENTREGA': {
      const to = normalizePhone(payload.to);
      await provider.sendText({ from: to, text: comprobante(payload.contrato) });
      break;
    }

    case 'PRENDA_LISTA': {
      const { data } = payload;
      const to = normalizePhone(payload.to);
      await provider.sendText({
        from: to,
        text:
          `✅ *Prenda lista para recoger — ${data.contratoCode}*\n\n` +
          `Hola *${data.clienteNombre}* 👋\n\n` +
          `La prenda de *${data.participanteNombre}* ya está preparada:\n` +
          `📦 Código: *${data.instanciaCodigo}*\n` +
          `👕 Modelo: ${data.prendaModelo}\n\n` +
          `Preséntese en nuestra sede para recogerla.\n` +
          `⏰ Lun–Sáb 8:00–20:00`,
      });
      break;
    }

    case 'DEVOLUCION_PARTICIPANTE': {
      const { data } = payload;
      const to = normalizePhone(payload.to);
      await provider.sendText({
        from: to,
        text:
          `✅ *Devolución registrada — ${data.contratoCode}*\n\n` +
          `Hola *${data.clienteNombre}* 👋\n\n` +
          `Hemos registrado la devolución de la prenda de *${data.participanteNombre}*` +
          (data.instanciaCodigo ? ` (${data.instanciaCodigo})` : '') + `.\n\n` +
          `Muchas gracias por elegirnos. ¡Hasta la próxima! 🎭`,
      });
      break;
    }

    case 'RECORDATORIO_DEVOLUCION': {
      const { data } = payload;
      const to = normalizePhone(payload.to);
      const pendientesTxt = data.pendientes.map((n) => `  • ${n}`).join('\n');
      await provider.sendText({
        from: to,
        text:
          `⏰ *Recordatorio de devolución — ${data.contratoCode}*\n\n` +
          `Hola *${data.clienteNombre}* 👋\n\n` +
          `La fecha de devolución es *${data.fechaDevolucion}*.\n\n` +
          `Prendas pendientes de devolver:\n${pendientesTxt}\n\n` +
          `Por favor acérquese a nuestra sede a tiempo para evitar cargos adicionales.\n` +
          `📞 Consultas: escriba *menú* a este número.`,
      });
      break;
    }
  }
}

function normalizePhone(phone: string): string {
  // Ensure Bolivia format: 591XXXXXXXX
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('591')) return digits;
  if (digits.startsWith('7') || digits.startsWith('6')) return `591${digits}`;
  return digits;
}
