import { addKeyword, EVENTS } from '@builderbot/bot';
import { stockFlow } from './stock.flow';
import { reservaFlow } from './reserva.flow';
import { contactoFlow } from './contacto.flow';

const MENU_TEXT = `¡Hola! 👋 Bienvenido a *FolkloreSoft Bolivia* 🎭

¿En qué te puedo ayudar?

1️⃣  Ver disponibilidad de trajes
2️⃣  Consultar precios
3️⃣  Hacer una reserva
4️⃣  Hablar con un asesor

Responde con el número de tu opción.`;

export const menuFlow = addKeyword(EVENTS.WELCOME)
  .addAnswer(MENU_TEXT, { capture: true }, async (ctx, { gotoFlow, flowDynamic }) => {
    const opt = ctx.body.trim();
    if (opt === '1' || opt === '2') return gotoFlow(stockFlow);
    if (opt === '3') return gotoFlow(reservaFlow);
    if (opt === '4') return gotoFlow(contactoFlow);
    await flowDynamic('No entendí tu opción. Escribe *menú* para volver a empezar.');
  });

// Permitir volver al menú en cualquier momento
export const volverFlow = addKeyword(['menu', 'menú', 'inicio', 'hola', 'buenas', 'buenos'])
  .addAnswer(MENU_TEXT, { capture: true }, async (ctx, { gotoFlow, flowDynamic }) => {
    const opt = ctx.body.trim();
    if (opt === '1' || opt === '2') return gotoFlow(stockFlow);
    if (opt === '3') return gotoFlow(reservaFlow);
    if (opt === '4') return gotoFlow(contactoFlow);
    await flowDynamic('No entendí tu opción. Escribe *menú* para volver a empezar.');
  });
