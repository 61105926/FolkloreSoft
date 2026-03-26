import { addKeyword, EVENTS, utils } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { stockFlow } from './stock.flow.js';
import { reservaFlow } from './reserva.flow.js';
import { contactoFlow } from './contacto.flow.js';

async function enviarMenu(ctx: { from: string }, provider: Provider) {
  await provider.sendList({
    from: ctx.from,
    list: {
      title: '🎭 FolkloreSoft Bolivia',
      description: '¡Hola! ¿En qué te puedo ayudar hoy?',
      button: 'Ver opciones',
      content: [
        '📦 Ver disponibilidad de trajes',
        '💰 Consultar precios',
        '📋 Hacer una reserva',
        '📞 Hablar con un asesor',
      ],
    },
  });
}

export const menuFlow = addKeyword<Provider>(EVENTS.WELCOME)
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  })
  .addAction({ capture: true }, async (ctx, { gotoFlow, provider }) => {
    const opt = ctx.body.trim();
    if (opt.includes('disponibilidad') || opt.includes('precios') || opt === '1' || opt === '2') return gotoFlow(stockFlow);
    if (opt.includes('reserva') || opt === '3') return gotoFlow(reservaFlow);
    if (opt.includes('asesor') || opt === '4') return gotoFlow(contactoFlow);
    await provider.sendText({ from: ctx.from, text: 'No entendí tu opción. Selecciona del menú 👆' });
    await enviarMenu(ctx, provider);
  });

export const volverFlow = addKeyword<Provider>(['menu', 'menú', 'inicio', 'hola', 'buenas', 'buenos días', 'buenas tardes'])
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  })
  .addAction({ capture: true }, async (ctx, { gotoFlow, provider }) => {
    const opt = ctx.body.trim();
    if (opt.includes('disponibilidad') || opt.includes('precios') || opt === '1' || opt === '2') return gotoFlow(stockFlow);
    if (opt.includes('reserva') || opt === '3') return gotoFlow(reservaFlow);
    if (opt.includes('asesor') || opt === '4') return gotoFlow(contactoFlow);
    await provider.sendText({ from: ctx.from, text: 'Selecciona una opción del menú 👆' });
    await enviarMenu(ctx, provider);
  });

// Maneja cierre de sesión por inactividad (Queue Flow)
export const endFlow = addKeyword<Provider>(utils.setEvent('END_FLOW'))
  .addAction(async (ctx, { endFlow: end, provider }) => {
    provider.forceClearUser(ctx.from);
    end('Cerramos la sesión por inactividad. ¡Escríbenos cuando quieras! 👋');
  });
