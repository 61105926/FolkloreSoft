import { addKeyword, EVENTS, utils } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { stockFlow }      from './stock.flow.js';
import { reservaFlow }    from './reserva.flow.js';
import { contactoFlow }   from './contacto.flow.js';
import { consultaFlow }   from './consulta.flow.js';
import { cotizacionFlow } from './cotizacion.flow.js';
import { cancelarFlow }   from './cancelar.flow.js';
import { adminFlow }      from './admin.flow.js';
import { detectIntent, responderLibre } from '../ia.js';

type Ctx = { from: string; body: string };
type RouteHandlers = { gotoFlow: (f: unknown) => void; provider: Provider };

function saludoPorHora(): string {
  const hora = new Date().toLocaleString('es-BO', {
    timeZone: 'America/La_Paz', hour: 'numeric', hour12: false,
  });
  const h = parseInt(hora);
  if (h >= 6  && h < 12) return '¡Buenos días!';
  if (h >= 12 && h < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

async function enviarMenu(ctx: Ctx, provider: Provider) {
  await provider.sendText({
    from: ctx.from,
    text:
      `🎭 *FolkloreSoft Bolivia — ${saludoPorHora()}*\n` +
      `¿En qué te puedo ayudar?\n\n` +
      `1️⃣ Ver disponibilidad de trajes\n` +
      `2️⃣ Cotizar precio\n` +
      `3️⃣ Hacer una reserva\n` +
      `4️⃣ Consultar mi reserva\n` +
      `5️⃣ Cancelar reserva\n` +
      `6️⃣ Hablar con un asesor\n\n` +
      `_Responde con el número o escribe tu consulta._`,
  });
}

async function routeOption(opt: string, ctx: Ctx, { gotoFlow, provider }: RouteHandlers) {
  const o = opt.toLowerCase().trim();

  if (o === '1' || o.includes('disponibilidad') || o.includes('trajes') || o.includes('stock'))
    return gotoFlow(stockFlow);
  if (o === '2' || o.includes('cotizar') || o.includes('precio'))
    return gotoFlow(cotizacionFlow);
  if (o === '3' || (o.includes('reserva') && !o.includes('consultar') && !o.includes('cancelar')))
    return gotoFlow(reservaFlow);
  if (o === '4' || o.includes('consultar') || o.includes('mi reserva'))
    return gotoFlow(consultaFlow);
  if (o === '5' || o.includes('cancelar'))
    return gotoFlow(cancelarFlow);
  if (o === '6' || o.includes('asesor') || o.includes('hablar'))
    return gotoFlow(contactoFlow);
  if (o === 'admin' || o === '/admin')
    return gotoFlow(adminFlow);

  // Fallback: detectar intención con IA
  const intent = await detectIntent(opt);
  switch (intent) {
    case 'STOCK':      return gotoFlow(stockFlow);
    case 'COTIZACION': return gotoFlow(cotizacionFlow);
    case 'RESERVA':    return gotoFlow(reservaFlow);
    case 'CONSULTA':   return gotoFlow(consultaFlow);
    case 'CANCELAR':   return gotoFlow(cancelarFlow);
    case 'ASESOR':     return gotoFlow(contactoFlow);
    default: {
      const respuesta = await responderLibre(opt);
      await provider.sendText({ from: ctx.from, text: respuesta });
      await enviarMenu(ctx, provider);
    }
  }
}

// ── Bienvenida ────────────────────────────────────────────────────────────────
export const menuFlow = addKeyword<Provider>(EVENTS.WELCOME)
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  })
  .addAction({ capture: true }, async (ctx, { gotoFlow, provider }) => {
    await routeOption(ctx.body.trim(), ctx, { gotoFlow, provider });
  });

// ── Volver al menú ────────────────────────────────────────────────────────────
export const volverFlow = addKeyword<Provider>([
  'menu', 'menú', 'inicio', 'hola', 'buenas', 'buenos días',
  'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hey',
])
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  })
  .addAction({ capture: true }, async (ctx, { gotoFlow, provider }) => {
    await routeOption(ctx.body.trim(), ctx, { gotoFlow, provider });
  });

// ── Cierre por inactividad (Queue Flow) ──────────────────────────────────────
export const endFlow = addKeyword<Provider>(utils.setEvent('END_FLOW'))
  .addAction(async (ctx, { endFlow: end, provider }) => {
    provider.forceClearUser(ctx.from);
    end('⏰ Cerramos la sesión por inactividad. ¡Escríbenos cuando quieras! 👋\n_Escribe *hola* para iniciar._');
  });
