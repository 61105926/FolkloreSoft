import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos, calcularStock } from '../api.js';

export const stockFlow = addKeyword<Provider>([
  'stock', 'disponible', 'trajes', 'disponibilidad', 'catálogo', 'catalogo',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '🎭 *Catálogo de trajes*\n\n' +
        '¿Qué danza te interesa? Escribe el nombre o escribe *todos* para ver todo el catálogo.\n\n' +
        '_Ejemplos: Tinku, Caporales, Morenada, Diablada, Saya…_\n\n' +
        '_(Escribe *cancelar* para salir)_',
    });
  })
  .addAction({ capture: true }, async (ctx, { provider, endFlow }) => {
    const input = ctx.body.trim().toLowerCase();

    if (input === 'cancelar') {
      return endFlow('Escribe *menú* cuando quieras. 👋');
    }

    const conjuntos = await getConjuntos();

    if (!conjuntos.length) {
      await provider.sendText({
        from: ctx.from,
        text: '⚠️ No pude conectarme al sistema. Intenta en un momento.\n\nEscribe *menú* para volver.',
      });
      return endFlow();
    }

    const lista = (input === 'todos' || input === 'ver todos')
      ? conjuntos
      : conjuntos.filter((c) =>
          c.danza.toLowerCase().includes(input) || c.nombre.toLowerCase().includes(input),
        );

    if (!lista.length) {
      const danzas = [...new Set(conjuntos.map((c) => c.danza))].join(', ');
      await provider.sendText({
        from: ctx.from,
        text:
          `No encontré trajes para *${ctx.body.trim()}*.\n\n` +
          `Danzas disponibles:\n${danzas}\n\n` +
          `Escribe *menú* para volver.`,
      });
      return endFlow();
    }

    const lineas = lista.map((c) => {
      const { disponibles, reservados, alquilados, total } = calcularStock(c);
      const estado = disponibles > 0 ? '✅' : '❌';
      return (
        `${estado} *${c.nombre}* — ${c.danza}\n` +
        `   💰 Bs. ${parseFloat(c.precio_base).toFixed(0)} · ` +
        `📦 ${disponibles} disp. de ${total}` +
        (reservados > 0 ? ` · 🔵 ${reservados} reserv.` : '') +
        (alquilados  > 0 ? ` · 🟡 ${alquilados} en uso` : '')
      );
    });

    await provider.sendText({
      from: ctx.from,
      text:
        `📦 *Disponibilidad de trajes*\n` +
        `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        lineas.join('\n') +
        `\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
        `Escribe *reservar* para hacer una reserva o *menú* para volver.`,
    });

    endFlow();
  });
