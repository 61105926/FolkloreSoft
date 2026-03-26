import { addKeyword, EVENTS, utils } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { stockFlow }      from './stock.flow.js';
import { reservaFlow }    from './reserva.flow.js';
import { contactoFlow }   from './contacto.flow.js';
import { consultaFlow }   from './consulta.flow.js';
import { cotizacionFlow } from './cotizacion.flow.js';
import { cancelarFlow }   from './cancelar.flow.js';
import { adminFlow }      from './admin.flow.js';

type Ctx = { from: string; body: string };

function saludoPorHora(): string {
  const h = new Date().getHours();
  if (h >= 6  && h < 12) return '¡Buenos días!';
  if (h >= 12 && h < 19) return '¡Buenas tardes!';
  return '¡Buenas noches!';
}

export async function enviarMenu(ctx: Ctx, provider: Provider) {
  await provider.sendText({
    from: ctx.from,
    text:
      `🎭 *FolkloreSoft Bolivia — ${saludoPorHora()}*\n\n` +
      `1️⃣  Ver disponibilidad de trajes\n` +
      `2️⃣  Cotizar precio\n` +
      `3️⃣  Hacer una reserva\n` +
      `4️⃣  Consultar mi reserva\n` +
      `5️⃣  Cancelar reserva\n` +
      `6️⃣  Hablar con un asesor\n\n` +
      `_Responde con el número o escribe tu consulta._`,
  });
}

// ── Bienvenida — solo envía el menú, sin capture ─────────────────────────────
// (sin capture:true, el queue item completa inmediatamente)
export const menuFlow = addKeyword<Provider>(EVENTS.WELCOME)
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  });

// ── Volver al menú ────────────────────────────────────────────────────────────
export const volverFlow = addKeyword<Provider>([
  'menu', 'menú', 'inicio', 'hola', 'buenas', 'buenos días',
  'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hey',
])
  .addAction(async (ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  });

// ── Opciones del menú (números 1-6 y palabras clave directas) ─────────────────
export const opcionFlow = addKeyword<Provider>([
  '1', '2', '3', '4', '5', '6',
  'disponibilidad', 'trajes', 'catalogo', 'catálogo', 'stock',
  'cotizar', 'cotizacion', 'cotización', 'precio', 'precios',
  'reservar', 'reserva', 'alquilar',
  'consultar', 'mi reserva', 'ver reserva',
  'cancelar', 'anular',
  'asesor', 'hablar',
  'admin', '/admin',
])
  .addAction(async (ctx, { gotoFlow, provider }) => {
    const o = ctx.body.trim().toLowerCase();

    if (o === '1' || o.includes('disponibilidad') || o.includes('trajes') || o.includes('stock') || o.includes('catalogo') || o.includes('catálogo'))
      return gotoFlow(stockFlow);
    if (o === '2' || o.includes('cotizar') || o.includes('precio'))
      return gotoFlow(cotizacionFlow);
    if (o === '3' || o.includes('reservar') || o.includes('alquilar') || (o.includes('reserva') && !o.includes('consultar') && !o.includes('cancelar') && !o.includes('mi')))
      return gotoFlow(reservaFlow);
    if (o === '4' || o.includes('consultar') || o.includes('mi reserva') || o.includes('ver reserva'))
      return gotoFlow(consultaFlow);
    if (o === '5' || o.includes('cancelar') || o.includes('anular'))
      return gotoFlow(cancelarFlow);
    if (o === '6' || o.includes('asesor') || o.includes('hablar'))
      return gotoFlow(contactoFlow);
    if (o === 'admin' || o === '/admin')
      return gotoFlow(adminFlow);

    await enviarMenu(ctx, provider);
  });

// ── Cierre de sesión por inactividad (Queue Flow) ─────────────────────────────
export const endFlow = addKeyword<Provider>(utils.setEvent('END_FLOW'))
  .addAction(async (ctx, { endFlow: end, provider }) => {
    provider.forceClearUser(ctx.from);
    end('⏰ Cerramos la sesión por inactividad. ¡Escríbenos cuando quieras! 👋\n_Escribe *hola* para iniciar._');
  });
