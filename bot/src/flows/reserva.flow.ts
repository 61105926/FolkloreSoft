import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos } from '../api.js';

export const reservaFlow = addKeyword<Provider>(['3', 'reservar', 'reserva', 'quiero reservar', '📋 hacer reserva'])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text: '📋 *Solicitud de reserva*\n\nVamos a registrar tus datos. Escribe *cancelar* en cualquier momento para salir.\n\n¿Cuál es tu *nombre completo*?',
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

    // Mostrar lista de danzas disponibles
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
      return;
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

    await provider.sendText({
      from: ctx.from,
      text:
        `✅ *Solicitud de reserva enviada*\n\n` +
        `👤 Nombre: ${s.nombre}\n` +
        `🪪 CI: ${s.ci}\n` +
        `📱 Celular: ${s.celular}\n` +
        `🎭 Traje: ${s.conjuntoNombre}\n` +
        `🔢 Cantidad: ${s.cantidad}\n` +
        `📅 Fecha evento: ${s.fechaEvento}\n` +
        `🏫 Evento: ${s.evento}\n\n` +
        `Un asesor de *FolkloreSoft* se comunicará contigo para confirmar y coordinar el anticipo.\n\n` +
        `⏰ Atención: Lun–Sáb 8:00–20:00\n\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
