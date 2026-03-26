import { addKeyword, EVENTS, utils } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { stockFlow } from './stock.flow.js';
import { reservaFlow } from './reserva.flow.js';
import { contactoFlow } from './contacto.flow.js';
import { consultaFlow } from './consulta.flow.js';
import { cotizacionFlow } from './cotizacion.flow.js';
import { cancelarFlow } from './cancelar.flow.js';
import { adminFlow } from './admin.flow.js';
import { detectIntent, responderLibre } from '../ia.js';

type Ctx = { from: string; body: string };
type RouteHandlers = { gotoFlow: (f: unknown) => void; provider: Provider };

function saludoPorHora(): string {
  const hora = new Date().toLocaleString('es-BO', {
    timeZone: 'America/La_Paz',
    hour: 'numeric',
    hour12: false,
  });
  const h = parseInt(hora);
  if (h >= 6  && h < 12) return '¡Buenos días!';
  if (h >= 12 && h < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

async function enviarMenu(ctx: Ctx, provider: Provider) {
  await provider.sendList({
    from: ctx.from,
    list: {
      title: `🎭 FolkloreSoft Bolivia — ${saludoPorHora()}`,
      description: '¿En qué te puedo ayudar hoy?',
      button: 'Ver opciones',
      content: [
        '📦 Ver disponibilidad de trajes',
        '💰 Cotizar precio',
        '📋 Hacer una reserva',
        '🔍 Consultar mi reserva',
        '❌ Cancelar reserva',
        '📞 Hablar con un asesor',
      ],
    },
  });
}

async function routeOption(opt: string, ctx: Ctx, { gotoFlow, provider }: RouteHandlers) {
  const o = opt.toLowerCase();

  if (o.includes('disponibilidad') || o.includes('trajes') || o === '1') return gotoFlow(stockFlow);
  if (o.includes('cotizar') || o.includes('precio') || o === '2')          return gotoFlow(cotizacionFlow);
  if (o.includes('reserva') && !o.includes('consultar') && !o.includes('cancelar') || o === '3') return gotoFlow(reservaFlow);
  if (o.includes('consultar') || o.includes('consulta') || o === '4')      return gotoFlow(consultaFlow);
  if (o.includes('cancelar') || o === '5')                                  return gotoFlow(cancelarFlow);
  if (o.includes('asesor') || o.includes('hablar') || o === '6')           return gotoFlow(contactoFlow);
  if (o === 'admin' || o === '/admin')                                       return gotoFlow(adminFlow);

  // ── Fallback: intentar detectar intención con IA ─────────────────────────
  const intent = await detectIntent(opt);
  switch (intent) {
    case 'STOCK':      return gotoFlow(stockFlow);
    case 'COTIZACION': return gotoFlow(cotizacionFlow);
    case 'RESERVA':    return gotoFlow(reservaFlow);
    case 'CONSULTA':   return gotoFlow(consultaFlow);
    case 'CANCELAR':   return gotoFlow(cancelarFlow);
    case 'ASESOR':     return gotoFlow(contactoFlow);
    default: {
      // Respuesta libre de Claude si ningún intent coincide
      const respuesta = await responderLibre(opt);
      await provider.sendText({ from: ctx.from, text: respuesta });
      await enviarMenu(ctx, provider);
    }
  }
}

// ── Bienvenida (primera vez que escribe) ─────────────────────────────────────
export const menuFlow = addKeyword<Provider>(EVENTS.WELCOME)
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  })
  .addAction({ capture: true }, async (ctx, { gotoFlow, provider }) => {
    await routeOption(ctx.body.trim(), ctx, { gotoFlow, provider });
  });

// ── Volver al menú (palabras clave) ──────────────────────────────────────────
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

// ── Cierre de sesión por inactividad (Queue Flow) ─────────────────────────────
export const endFlow = addKeyword<Provider>(utils.setEvent('END_FLOW'))
  .addAction(async (ctx, { endFlow: end, provider }) => {
    provider.forceClearUser(ctx.from);
    end('⏰ Cerramos la sesión por inactividad. ¡Escríbenos cuando quieras! 👋\n\n_Escribe *hola* para iniciar de nuevo._');
  });
