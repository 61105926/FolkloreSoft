import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos } from '../api.js';

export const reservaFlow = addKeyword<Provider>([
  '3', 'reservar', 'reserva', 'quiero reservar', '📋 hacer una reserva',
  'alquilar', 'necesito trajes',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '📋 *Solicitud de reserva*\n\n' +
        'Vamos a registrar tus datos. Escribe *cancelar* en cualquier momento para salir.\n\n' +
        '¿Cuál es tu *nombre completo*?',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    }
    await state.update({ nombre: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '🪪 ¿Tu número de *CI* (cédula de identidad)?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ ci: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '📱 ¿Tu número de *celular*?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ celular: ctx.body.trim() });

    const conjuntos = await getConjuntos();
    const danzas = [...new Set(conjuntos.map((c) => c.danza))];

    await provider.sendList({
      from: ctx.from,
      list: {
        title: '🎭 Elige la danza',
        description: '¿Qué traje necesitas?',
        button: 'Ver danzas',
        content: danzas.map((d) => `🎶 ${d}`),
      },
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    const danza = ctx.body.trim().replace(/^🎶\s*/u, '');
    const conjuntos = await getConjuntos();
    const opciones = conjuntos.filter((c) => c.danza.toLowerCase().includes(danza.toLowerCase()));

    if (!opciones.length) {
      await provider.sendText({ from: ctx.from, text: `No encontré trajes para *${danza}*.\n\nEscribe *menú* para volver.` });
      return endFlow();
    }
    await state.update({ danza, conjuntoNombre: opciones[0].nombre, conjuntoId: opciones[0].id });
    await provider.sendText({ from: ctx.from, text: `✅ Traje: *${opciones[0].nombre}*\n\n🔢 ¿Cuántos trajes necesitas?` });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ cantidad: parseInt(ctx.body.trim()) || 1 });
    await provider.sendText({ from: ctx.from, text: '📅 ¿Fecha del evento? (ejemplo: 25/06/2026)' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ fechaEvento: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '🏫 ¿Nombre del evento o institución?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ evento: ctx.body.trim() });

    const s = state.getMyState() as Record<string, string>;

    // ── Mostrar resumen para confirmación ─────────────────────────────────────
    await provider.sendButton({
      from: ctx.from,
      title: '📋 Confirmar solicitud de reserva',
      body:
        `👤 Nombre: ${s.nombre}\n` +
        `🪪 CI: ${s.ci}\n` +
        `📱 Celular: ${s.celular}\n` +
        `🎭 Traje: ${s.conjuntoNombre}\n` +
        `🔢 Cantidad: ${s.cantidad}\n` +
        `📅 Fecha: ${s.fechaEvento}\n` +
        `🏫 Evento: ${s.evento}`,
      description: '¿Los datos son correctos?',
      footer: 'FolkloreSoft Bolivia',
      buttons: [
        { type: 'reply', text: '✅ Confirmar' },
        { type: 'reply', text: '✏️ Corregir datos' },
        { type: 'reply', text: '❌ Cancelar' },
      ],
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow, gotoFlow }) => {
    const resp = ctx.body.trim().toLowerCase();

    if (resp.includes('cancelar') || resp === '❌ cancelar') {
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    }

    if (resp.includes('corregir') || resp.includes('✏️')) {
      return gotoFlow(reservaFlow);
    }

    // Confirmado — enviar solicitud
    const s = state.getMyState() as Record<string, string>;

    await provider.sendText({
      from: ctx.from,
      text:
        `✅ *¡Solicitud enviada exitosamente!*\n\n` +
        `Gracias *${s.nombre}* 🎭\n\n` +
        `Un asesor de *FolkloreSoft* se comunicará contigo al *${s.celular}* para confirmar y coordinar el anticipo.\n\n` +
        `📋 *Resumen:*\n` +
        `   Traje: ${s.conjuntoNombre}\n` +
        `   Cantidad: ${s.cantidad}\n` +
        `   Fecha: ${s.fechaEvento}\n` +
        `   Evento: ${s.evento}\n\n` +
        `⏰ Atención: Lun–Sáb 8:00–20:00\n\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
