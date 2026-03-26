import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos, cotizar } from '../api.js';

export const cotizacionFlow = addKeyword<Provider>([
  '2', 'cotizar', 'cotizacion', 'cotización', 'precio', 'precios',
  'cuánto cuesta', 'cuanto cuesta', '💰 cotizar precio',
])
  .addAction(async (ctx, { provider }) => {
    const conjuntos = await getConjuntos();
    if (!conjuntos.length) {
      await provider.sendText({
        from: ctx.from,
        text: '⚠️ No pude conectarme al sistema. Intenta en un momento.\n\nEscribe *menú* para volver.',
      });
      return;
    }

    const danzas = [...new Set(conjuntos.map((c) => c.danza))];

    await provider.sendList({
      from: ctx.from,
      list: {
        title: '💰 Cotización de trajes',
        description: '¿Qué danza te interesa cotizar?',
        button: 'Elegir danza',
        content: danzas.map((d) => `🎭 ${d}`),
      },
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const input = ctx.body.trim().replace(/^🎭\s*/u, '').toLowerCase();
    const conjuntos = await getConjuntos();
    const opciones = conjuntos.filter(
      (c) => c.danza.toLowerCase().includes(input) || c.nombre.toLowerCase().includes(input),
    );

    if (!opciones.length) {
      const danzas = [...new Set(conjuntos.map((c) => c.danza))].join(', ');
      await provider.sendText({
        from: ctx.from,
        text: `No encontré trajes para *${ctx.body.trim()}*.\n\nDanzas disponibles:\n${danzas}\n\nEscribe *menú* para volver.`,
      });
      return endFlow();
    }

    // Si hay varios conjuntos de esa danza, mostrar lista
    if (opciones.length > 1) {
      await provider.sendList({
        from: ctx.from,
        list: {
          title: `Conjuntos de ${ctx.body.trim().replace(/^🎭\s*/u, '')}`,
          description: '¿Qué conjunto deseas cotizar?',
          button: 'Elegir conjunto',
          content: opciones.map((c) => c.nombre),
        },
      });
      await state.update({ opciones: JSON.stringify(opciones.map((c) => ({ id: c.id, nombre: c.nombre }))) });
    } else {
      await state.update({ conjuntoId: opciones[0].id, conjuntoNombre: opciones[0].nombre });
      await provider.sendText({ from: ctx.from, text: `✅ *${opciones[0].nombre}*\n\n🔢 ¿Cuántos trajes necesitas?` });
    }
  })
  // Puede recibir: selección de conjunto O cantidad (si había un único resultado)
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const s = state.getMyState() as Record<string, string>;

    // Si venimos de una selección de lista de conjuntos
    if (s.opciones && !s.conjuntoId) {
      const opciones = JSON.parse(s.opciones) as { id: number; nombre: string }[];
      const elegido = opciones.find(
        (o) => o.nombre.toLowerCase() === ctx.body.trim().toLowerCase(),
      ) ?? opciones[0];
      await state.update({ conjuntoId: elegido.id, conjuntoNombre: elegido.nombre });
      await provider.sendText({ from: ctx.from, text: `✅ *${elegido.nombre}*\n\n🔢 ¿Cuántos trajes necesitas?` });
      return;
    }

    // Si ya tenemos conjuntoId, recibimos la cantidad
    const cantidad = parseInt(ctx.body.trim()) || 1;
    await state.update({ cantidad });
    await provider.sendText({ from: ctx.from, text: '📅 ¿Para cuántos días necesitas los trajes? (ejemplo: 1, 2, 3)' });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'cancelar') {
      return endFlow('Cancelado. Escribe *menú* cuando quieras. 👋');
    }

    const s     = state.getMyState() as Record<string, string | number>;
    const dias  = parseInt(String(ctx.body.trim())) || 1;
    const cId   = Number(s.conjuntoId);
    const cant  = Number(s.cantidad) || 1;

    const resultado = await cotizar(cId, cant, dias);

    if (!resultado) {
      await provider.sendText({
        from: ctx.from,
        text: '⚠️ No pude calcular la cotización. Intenta de nuevo o escribe *menú* para volver.',
      });
      return endFlow();
    }

    const variacionesTxt = resultado.variaciones
      .map((v) => `  • ${v.nombre_variacion}${v.talla ? ` (talla ${v.talla})` : ''} — ${v._count.instancias} disponibles`)
      .join('\n');

    await provider.sendText({
      from: ctx.from,
      text:
        `💰 *Cotización — ${resultado.conjunto}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `🎭 Danza: ${resultado.danza}\n` +
        `💵 Precio por traje: *Bs. ${resultado.precio_unitario.toFixed(0)}*\n` +
        `🔢 Cantidad: ${resultado.cantidad} trajes\n` +
        `📅 Días: ${resultado.dias}\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `💰 *Subtotal: Bs. ${resultado.subtotal.toFixed(2)}*\n` +
        `💳 Anticipo mínimo (30%): *Bs. ${resultado.anticipo_minimo}*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        (variacionesTxt ? `👕 *Variaciones disponibles:*\n${variacionesTxt}\n\n` : '') +
        `_Precios sujetos a disponibilidad. Para reservar escribe *reservar*._\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
