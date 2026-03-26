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
      `📦 *disponibilidad* — Ver trajes disponibles\n` +
      `💰 *cotizar* — Consultar precio\n` +
      `📋 *reservar* — Hacer una reserva\n` +
      `🔍 *consultar* — Ver mi reserva\n` +
      `❌ *cancelar* — Cancelar reserva\n` +
      `📞 *asesor* — Hablar con una persona\n\n` +
      `_Escribe la palabra resaltada o tu consulta._`,
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

// ── Opciones del menú — SOLO palabras clave completas (nunca dígitos sueltos)
// Los números del menú son decorativos; el usuario escribe la palabra.
export const opcionFlow = addKeyword<Provider>([
  'disponibilidad', 'trajes', 'catalogo', 'catálogo', 'stock', 'ver trajes',
  'cotizar', 'cotizacion', 'cotización', 'precio', 'precios', 'cuanto cuesta', 'cuánto cuesta',
  'reservar', 'alquilar', 'quiero reservar',
  'consultar', 'mi reserva', 'ver reserva', 'ver mi reserva',
  'cancelar', 'anular', 'cancelar reserva',
  'asesor', 'hablar con asesor', 'hablar con una persona',
  'admin', '/admin',
])
  .addAction(async (ctx, { gotoFlow, provider }) => {
    const o = ctx.body.trim().toLowerCase();

    if (o.includes('disponibilidad') || o.includes('trajes') || o.includes('stock') || o.includes('catalogo') || o.includes('catálogo'))
      return gotoFlow(stockFlow);
    if (o.includes('cotizar') || o.includes('precio') || o.includes('cuanto'))
      return gotoFlow(cotizacionFlow);
    if (o.includes('reservar') || o.includes('alquilar'))
      return gotoFlow(reservaFlow);
    if (o.includes('consultar') || o.includes('mi reserva') || o.includes('ver reserva'))
      return gotoFlow(consultaFlow);
    if (o.includes('cancelar') || o.includes('anular'))
      return gotoFlow(cancelarFlow);
    if (o.includes('asesor') || o.includes('hablar'))
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
