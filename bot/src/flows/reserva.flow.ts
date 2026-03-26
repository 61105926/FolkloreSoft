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
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ nombre: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '🪪 ¿Tu número de *CI* (cédula de identidad)?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ ci: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '📱 ¿Tu número de *celular*?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ celular: ctx.body.trim() });

    const conjuntos = await getConjuntos();
    const danzas = [...new Set(conjuntos.map((c) => c.danza))];

    await provider.sendText({
      from: ctx.from,
      text:
        '🎭 ¿Qué *danza* necesitas?\n\n' +
        danzas.map((d, i) => `${i + 1}. ${d}`).join('\n') +
        '\n\nEscribe el nombre de la danza.',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');

    const danza = ctx.body.trim();
    const conjuntos = await getConjuntos();
    const opciones = conjuntos.filter((c) => c.danza.toLowerCase().includes(danza.toLowerCase()));

    if (!opciones.length) {
      await provider.sendText({
        from: ctx.from,
        text: `No encontré trajes para *${danza}*.\n\nEscribe *menú* para volver.`,
      });
      return endFlow();
    }

    await state.update({ danza, conjuntoNombre: opciones[0].nombre, conjuntoId: opciones[0].id });
    await provider.sendText({
      from: ctx.from,
      text: `✅ Traje: *${opciones[0].nombre}*\n\n🔢 ¿Cuántos trajes necesitas?`,
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ cantidad: parseInt(ctx.body.trim()) || 1 });
    await provider.sendText({ from: ctx.from, text: '📅 ¿Fecha del evento? (ejemplo: 25/06/2026)' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ fechaEvento: ctx.body.trim() });
    await provider.sendText({ from: ctx.from, text: '🏫 ¿Nombre del evento o institución?' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar')
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ evento: ctx.body.trim() });

    const s = state.getMyState() as Record<string, string>;

    await provider.sendText({
      from: ctx.from,
      text:
        `📋 *Confirmar solicitud de reserva*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `👤 Nombre: ${s.nombre}\n` +
        `🪪 CI: ${s.ci}\n` +
        `📱 Celular: ${s.celular}\n` +
        `🎭 Traje: ${s.conjuntoNombre}\n` +
        `🔢 Cantidad: ${s.cantidad}\n` +
        `📅 Fecha: ${s.fechaEvento}\n` +
        `🏫 Evento: ${s.evento}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `¿Los datos son correctos?\n` +
        `Escribe *confirmar* para enviar o *cancelar* para salir.`,
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow, gotoFlow }) => {
    const resp = ctx.body.trim().toLowerCase();

    if (resp === 'cancelar' || resp.includes('cancelar'))
      return endFlow('Reserva cancelada. Escribe *menú* cuando quieras. 👋');

    if (resp.includes('correg') || resp.includes('editar') || resp.includes('cambiar'))
      return gotoFlow(reservaFlow);

    // Cualquier otra respuesta = confirmar
    const s = state.getMyState() as Record<string, string>;

    await provider.sendText({
      from: ctx.from,
      text:
        `✅ *¡Solicitud enviada!*\n\n` +
        `Gracias *${s.nombre}* 🎭\n\n` +
        `Un asesor de *FolkloreSoft* se comunicará al *${s.celular}* para confirmar y coordinar el anticipo.\n\n` +
        `📋 Resumen:\n` +
        `   Traje: ${s.conjuntoNombre} · ${s.cantidad} unidades\n` +
        `   Fecha: ${s.fechaEvento}\n` +
        `   Evento: ${s.evento}\n\n` +
        `⏰ Atención: Lun–Sáb 8:00–20:00\n\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
