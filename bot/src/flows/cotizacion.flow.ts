import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos, cotizar } from '../api.js';

export const cotizacionFlow = addKeyword<Provider>([
  '2', 'cotizar', 'cotizacion', 'cotización', 'precio', 'precios',
  'cuánto cuesta', 'cuanto cuesta', '💰 cotizar precio',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '💰 *Cotización de trajes*\n\n' +
        'Escribe el nombre de la danza o conjunto que quieres cotizar.\n\n' +
        '_Ejemplos: Tinku, Caporales, Morenada…_\n\n' +
        '_(Escribe *cancelar* para salir)_',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const input = ctx.body.trim().toLowerCase();
    const conjuntos = await getConjuntos();

    if (!conjuntos.length) {
      await provider.sendText({
        from: ctx.from,
        text: '⚠️ No pude conectarme al sistema. Intenta en un momento.\n\nEscribe *menú* para volver.',
      });
      return endFlow();
    }

    const opciones = conjuntos.filter(
      (c) => c.danza.toLowerCase().includes(input) || c.nombre.toLowerCase().includes(input),
    );

    if (!opciones.length) {
      const danzas = [...new Set(conjuntos.map((c) => c.danza))].join(', ');
      await provider.sendText({
        from: ctx.from,
        text:
          `No encontré *${ctx.body.trim()}*.\n\n` +
          `Danzas disponibles:\n${danzas}\n\n` +
          `Escribe *menú* para volver.`,
      });
      return endFlow();
    }

    if (opciones.length > 1) {
      const lista = opciones.map((c, i) => `${i + 1}. ${c.nombre} (${c.danza})`).join('\n');
      await provider.sendText({
        from: ctx.from,
        text: `Encontré varios conjuntos:\n\n${lista}\n\nEscribe el nombre exacto del que deseas cotizar.`,
      });
      await state.update({ opciones: JSON.stringify(opciones.map((c) => ({ id: c.id, nombre: c.nombre }))) });
      return;
    }

    await state.update({ conjuntoId: opciones[0].id, conjuntoNombre: opciones[0].nombre });
    await provider.sendText({ from: ctx.from, text: `✅ *${opciones[0].nombre}*\n\n🔢 ¿Cuántos trajes necesitas?` });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const s = state.getMyState() as Record<string, string>;

    // Si venimos de lista múltiple, recibimos selección del conjunto
    if (s.opciones && !s.conjuntoId) {
      const opciones = JSON.parse(s.opciones) as { id: number; nombre: string }[];
      const elegido = opciones.find(
        (o) => o.nombre.toLowerCase().includes(ctx.body.trim().toLowerCase()),
      ) ?? opciones[0];
      await state.update({ conjuntoId: elegido.id, conjuntoNombre: elegido.nombre });
      await provider.sendText({ from: ctx.from, text: `✅ *${elegido.nombre}*\n\n🔢 ¿Cuántos trajes necesitas?` });
      return;
    }

    const cantidad = parseInt(ctx.body.trim()) || 1;
    await state.update({ cantidad });
    await provider.sendText({ from: ctx.from, text: '📅 ¿Para cuántos días necesitas los trajes? (escribe el número, ej: 1)' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const s      = state.getMyState() as Record<string, string | number>;
    const dias   = parseInt(String(ctx.body.trim())) || 1;
    const cId    = Number(s.conjuntoId);
    const cant   = Number(s.cantidad) || 1;

    const resultado = await cotizar(cId, cant, dias);

    if (!resultado) {
      await provider.sendText({
        from: ctx.from,
        text: '⚠️ No pude calcular la cotización. Intenta de nuevo o escribe *menú* para volver.',
      });
      return endFlow();
    }

    const variacionesTxt = resultado.variaciones.length
      ? resultado.variaciones
          .map((v) => `  • ${v.nombre_variacion}${v.talla ? ` (talla ${v.talla})` : ''} — ${v._count.instancias} unidades`)
          .join('\n')
      : '';

    await provider.sendText({
      from: ctx.from,
      text:
        `💰 *Cotización — ${resultado.conjunto}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎭 Danza: ${resultado.danza}\n` +
        `💵 Precio por traje: *Bs. ${resultado.precio_unitario.toFixed(0)}*\n` +
        `🔢 Cantidad: ${resultado.cantidad} trajes · ${resultado.dias} día(s)\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *Subtotal: Bs. ${resultado.subtotal.toFixed(2)}*\n` +
        `💳 Anticipo mínimo (30%): *Bs. ${resultado.anticipo_minimo}*\n` +
        (variacionesTxt ? `━━━━━━━━━━━━━━━━━━━━━━━━\n👕 Variaciones disponibles:\n${variacionesTxt}\n` : '') +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `_Precios sujetos a disponibilidad._\n` +
        `Escribe *reservar* para reservar o *menú* para volver.`,
    });

    endFlow();
  });
