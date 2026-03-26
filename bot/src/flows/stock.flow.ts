import { addKeyword } from '@builderbot/bot';
import { getConjuntos, calcularStock } from '../api';

export const stockFlow = addKeyword(['1', '2', 'stock', 'disponible', 'trajes', 'precio', 'precios', 'danza'])
  .addAnswer(
    '¿Qué danza te interesa? Por ejemplo:\n*Tinku, Caporales, Morenada, Diablada, Saya...*\n\nO escribe *todos* para ver todo el catálogo.',
    { capture: true },
    async (ctx, { flowDynamic }) => {
      const input = ctx.body.trim().toLowerCase();
      const conjuntos = await getConjuntos();

      if (!conjuntos.length) {
        await flowDynamic('⚠️ No pude conectarme al sistema. Intenta en un momento.');
        return;
      }

      // Filtrar o mostrar todos
      const lista = input === 'todos'
        ? conjuntos
        : conjuntos.filter((c) => c.danza.toLowerCase().includes(input) || c.nombre.toLowerCase().includes(input));

      if (!lista.length) {
        await flowDynamic(
          `No encontré trajes para *${ctx.body.trim()}*.\n\nDanzas disponibles:\n${[...new Set(conjuntos.map((c) => c.danza))].join(', ')}\n\nEscribe *menú* para volver.`
        );
        return;
      }

      // Mostrar resultados
      const msgs: string[] = [];
      for (const c of lista) {
        const { disponibles, reservados, alquilados, total } = calcularStock(c);
        const estadoEmoji = disponibles > 0 ? '✅' : '❌';
        msgs.push(
          `${estadoEmoji} *${c.nombre}*\n` +
          `   Danza: ${c.danza}\n` +
          `   💰 Bs. ${parseFloat(c.precio_base).toFixed(0)} por evento\n` +
          `   📦 Stock: ${disponibles} disponibles / ${total} total\n` +
          (reservados > 0 ? `   🔵 ${reservados} reservados\n` : '') +
          (alquilados > 0 ? `   🟡 ${alquilados} en uso\n` : '')
        );
      }

      // Enviar en bloques de 5 para no saturar
      for (let i = 0; i < msgs.length; i += 5) {
        await flowDynamic(msgs.slice(i, i + 5).join('\n─────────────────\n'));
      }

      await flowDynamic('¿Te interesa reservar algún traje? Escribe *3* o *reservar*.\nEscribe *menú* para volver al inicio.');
    }
  );
