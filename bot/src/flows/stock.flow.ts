import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { getConjuntos, calcularStock } from '../api.js';

export const stockFlow = addKeyword<Provider>(['1', '2', 'stock', 'disponible', 'trajes', 'precio', 'precios', 'danza', 'disponibilidad'])
  .addAction(async (ctx, { provider }) => {
    await provider.sendList({
      from: ctx.from,
      list: {
        title: '🎭 Catálogo de trajes',
        description: '¿Qué danza te interesa?',
        button: 'Elegir danza',
        content: [
          '🎶 Tinku',
          '🕺 Caporales',
          '👑 Morenada',
          '😈 Diablada',
          '🌟 Saya',
          '🎵 Kullawada',
          '📋 Ver todos',
        ],
      },
    });
  })
  .addAction({ capture: true }, async (ctx, { provider, flowDynamic }) => {
    const input = ctx.body.trim().toLowerCase().replace(/^(🎶|🕺|👑|😈|🌟|🎵|📋)\s*/u, '');
    const conjuntos = await getConjuntos();

    if (!conjuntos.length) {
      await provider.sendText({ from: ctx.from, text: '⚠️ No pude conectarme al sistema. Intenta en un momento.\n\nEscribe *menú* para volver.' });
      return;
    }

    const lista = (input === 'ver todos' || input === 'todos')
      ? conjuntos
      : conjuntos.filter((c) =>
          c.danza.toLowerCase().includes(input) ||
          c.nombre.toLowerCase().includes(input)
        );

    if (!lista.length) {
      const danzas = [...new Set(conjuntos.map((c) => c.danza))].join(', ');
      await provider.sendText({
        from: ctx.from,
        text: `No encontré trajes para *${ctx.body.trim()}*.\n\nDanzas disponibles:\n${danzas}\n\nEscribe *menú* para volver.`,
      });
      return;
    }

    for (const c of lista) {
      const { disponibles, reservados, alquilados, total } = calcularStock(c);
      const estadoEmoji = disponibles > 0 ? '✅' : '❌';
      await provider.sendText({
        from: ctx.from,
        text:
          `${estadoEmoji} *${c.nombre}*\n` +
          `   Danza: ${c.danza}\n` +
          `   💰 Bs. ${parseFloat(c.precio_base).toFixed(0)} por evento\n` +
          `   📦 ${disponibles} disponibles de ${total}\n` +
          (reservados > 0 ? `   🔵 ${reservados} reservados\n` : '') +
          (alquilados  > 0 ? `   🟡 ${alquilados} en uso\n`    : ''),
      });
    }

    await provider.sendButton({
      from: ctx.from,
      title: '¿Qué deseas hacer?',
      body: 'Puedes hacer una reserva o volver al menú principal.',
      description: '',
      footer: 'FolkloreSoft Bolivia',
      buttons: [
        { type: 'reply', text: '📋 Hacer reserva' },
        { type: 'reply', text: '🔙 Menú principal' },
      ],
    });
  });
