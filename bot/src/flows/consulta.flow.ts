import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { consultarReserva } from '../api.js';

function fmt(n: number | string) { return parseFloat(String(n)).toFixed(2); }
function fmtDate(d: string) {
  try { return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' }); }
  catch { return d; }
}

const ESTADO_LABEL: Record<string, string> = {
  RESERVADO:  '🔵 Reservado',
  CONFIRMADO: '✅ Confirmado',
  ENTREGADO:  '📦 Entregado (en uso)',
  EN_USO:     '📦 En uso',
  DEVUELTO:   '🔄 Devuelto',
  CON_DEUDA:  '⚠️ Con deuda pendiente',
  CANCELADO:  '❌ Cancelado',
  CERRADO:    '✅ Cerrado',
};

export const consultaFlow = addKeyword<Provider>([
  '4', 'consultar', 'consulta', 'mi reserva', 'ver reserva',
  'estado', 'buscar reserva', '🔍 consultar mi reserva',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '🔍 *Consulta de reserva*\n\n' +
        'Ingresa tu *número de CI*, *celular* o *código de contrato* para buscar tu reserva.\n\n' +
        '_(Escribe *cancelar* para salir)_',
    });
  })
  .addAction({ capture: true }, async (ctx, { provider, endFlow }) => {
    const input = ctx.body.trim();
    if (input.toLowerCase() === 'cancelar')
      return endFlow('Escribe *menú* cuando quieras. 👋');

    const contrato = await consultarReserva(input);

    if (!contrato) {
      await provider.sendText({
        from: ctx.from,
        text:
          `❌ No encontré ninguna reserva activa con *${input}*.\n\n` +
          `Verifica el dato e inténtalo de nuevo, o escribe *menú* para volver.`,
      });
      return endFlow();
    }

    const eventoNombre = contrato.evento?.nombre ?? contrato.nombre_evento_ext ?? '—';
    const saldo = Number(contrato.total) - Number(contrato.total_pagado);
    const estadoLabel = ESTADO_LABEL[contrato.estado] ?? contrato.estado;

    const prendasTxt = contrato.prendas
      .map((p) => {
        const v = p.variacion
          ? ` (${p.variacion.nombre_variacion}${p.variacion.talla ? ` · ${p.variacion.talla}` : ''})`
          : '';
        return `  • ${p.modelo}${v} × ${p.total} — Bs. ${fmt(p.subtotal)}`;
      })
      .join('\n');

    const devueltos  = contrato.participantes.filter((p) => p.devuelto).length;
    const pendientes = contrato.participantes.filter((p) => !p.devuelto).length;

    await provider.sendText({
      from: ctx.from,
      text:
        `📋 *Contrato ${contrato.codigo}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Estado: ${estadoLabel}\n` +
        `👤 Cliente: ${contrato.cliente.nombre}\n` +
        `🎪 Evento: ${eventoNombre}\n` +
        `📅 Entrega: ${fmtDate(contrato.fecha_entrega)}\n` +
        `📅 Devolución: ${fmtDate(contrato.fecha_devolucion)}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👕 Prendas:\n${prendasTxt}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 Total: Bs. ${fmt(contrato.total)}\n` +
        `✅ Pagado: Bs. ${fmt(contrato.total_pagado)}\n` +
        (saldo > 0 ? `⚠️ Saldo pendiente: *Bs. ${fmt(saldo)}*\n` : `✅ Sin deuda\n`) +
        `👥 Participantes: ${devueltos} devueltos · ${pendientes} pendientes\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
