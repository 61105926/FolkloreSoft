import { addKeyword } from '@builderbot/bot';
import { getConjuntos } from '../api.js';

// Guardamos los datos del cliente paso a paso en el estado del flujo
export const reservaFlow = addKeyword(['3', 'reservar', 'reserva', 'quiero reservar'])
  .addAnswer(
    '¡Perfecto! Vamos a registrar tu reserva 📋\n\n¿Cuál es tu *nombre completo*?',
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ nombre: ctx.body.trim() });
    }
  )
  .addAnswer('¿Tu número de *CI* (cédula de identidad)?', { capture: true }, async (ctx, { state }) => {
    await state.update({ ci: ctx.body.trim() });
  })
  .addAnswer('¿Tu número de *celular* (para contactarte)?', { capture: true }, async (ctx, { state }) => {
    await state.update({ celular: ctx.body.trim() });
  })
  .addAnswer(
    '¿Qué *danza* necesitas? (Tinku, Caporales, Morenada, Diablada, Saya...)',
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      const danza = ctx.body.trim();
      const conjuntos = await getConjuntos();
      const opciones = conjuntos.filter((c) =>
        c.danza.toLowerCase().includes(danza.toLowerCase())
      );

      if (!opciones.length) {
        await flowDynamic(`No encontré trajes para *${danza}*. Por favor contacta a un asesor escribiendo *4*.`);
        return;
      }

      await state.update({ danza, conjuntoId: opciones[0].id, conjuntoNombre: opciones[0].nombre });

      if (opciones.length === 1) {
        await flowDynamic(`Traje seleccionado: *${opciones[0].nombre}*`);
      } else {
        const lista = opciones.map((c, i) => `${i + 1}. ${c.nombre}`).join('\n');
        await flowDynamic(`Encontré varios trajes:\n${lista}\n\nEl sistema seleccionará el primero disponible.`);
      }
    }
  )
  .addAnswer('¿Cuántos trajes necesitas?', { capture: true }, async (ctx, { state }) => {
    const n = parseInt(ctx.body.trim()) || 1;
    await state.update({ cantidad: n });
  })
  .addAnswer(
    '¿Fecha del evento? (formato DD/MM/AAAA)',
    { capture: true },
    async (ctx, { state }) => {
      await state.update({ fechaEvento: ctx.body.trim() });
    }
  )
  .addAnswer(
    '¿Nombre del evento o institución?',
    { capture: true },
    async (ctx, { state, flowDynamic }) => {
      await state.update({ evento: ctx.body.trim() });

      const s = state.getMyState() as Record<string, string>;
      const resumen =
        `✅ *Resumen de tu solicitud de reserva:*\n\n` +
        `👤 Nombre: ${s.nombre}\n` +
        `🪪 CI: ${s.ci}\n` +
        `📱 Celular: ${s.celular}\n` +
        `🎭 Traje: ${s.conjuntoNombre} (${s.danza})\n` +
        `🔢 Cantidad: ${s.cantidad}\n` +
        `📅 Fecha evento: ${s.fechaEvento}\n` +
        `🏫 Evento: ${s.evento}\n\n` +
        `Un asesor de *FolkloreSoft* se pondrá en contacto contigo para confirmar la reserva y coordinar el anticipo.\n\n` +
        `⏰ Horario de atención: Lun–Sáb 8:00–20:00\n\n` +
        `Escribe *menú* para volver al inicio.`;

      await flowDynamic(resumen);

      // Aquí podrías hacer POST a tu API para guardar la solicitud
      // await axios.post(`${API_URL}/bot/solicitudes`, { ...s });
    }
  );
