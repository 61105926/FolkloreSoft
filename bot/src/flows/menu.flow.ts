import { addKeyword, EVENTS, utils } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { reservaFlow }  from './reserva.flow.js';
import { contactoFlow } from './contacto.flow.js';
import { consultaFlow } from './consulta.flow.js';
import { adminFlow }    from './admin.flow.js';

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
      `1️⃣ *Reservar trajes*\n` +
      `2️⃣ *Ver mi contrato*\n` +
      `3️⃣ *Hablar con un asesor*\n\n` +
      `_Escribe el número de la opción._`,
  });
}

// ── Bienvenida ─────────────────────────────────────────────────────────────────
export const menuFlow = addKeyword<Provider>(EVENTS.WELCOME)
  .addAction(async (ctx: Ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  });

// ── Volver al menú ─────────────────────────────────────────────────────────────
export const volverFlow = addKeyword<Provider>([
  'menu', 'menú', 'inicio', 'hola', 'buenas', 'buenos días',
  'buenos dias', 'buenas tardes', 'buenas noches', 'hi', 'hey',
])
  .addAction(async (ctx: Ctx, { provider }) => {
    await enviarMenu(ctx, provider);
  });

// ── Opciones numeradas ─────────────────────────────────────────────────────────
// Se usan palabras completas como keywords; la lógica interna compara ctx.body exacto
// para que los números no interfieran con CIs/celulares mid-flow.
export const opcionFlow = addKeyword<Provider>([
  'reservar', 'alquilar', 'quiero reservar', 'necesito trajes',
  'contrato', 'mi contrato', 'ver contrato', 'ver mi contrato',
  'consultar', 'mi reserva', 'ver reserva',
  'asesor', 'hablar con asesor', 'hablar con una persona', 'persona',
  'admin', '/admin',
])
  .addAction(async (ctx: Ctx, { gotoFlow, provider }) => {
    const o = ctx.body.trim().toLowerCase();

    // Opción 1 — Reservar
    if (o === '1' || o.includes('reservar') || o.includes('alquilar') || o.includes('necesito traje'))
      return gotoFlow(reservaFlow);

    // Opción 2 — Ver contrato
    if (o === '2' || o.includes('contrato') || o.includes('consultar') || o.includes('mi reserva') || o.includes('ver reserva'))
      return gotoFlow(consultaFlow);

    // Opción 3 — Asesor
    if (o === '3' || o.includes('asesor') || o.includes('hablar') || o.includes('persona'))
      return gotoFlow(contactoFlow);

    if (o === 'admin' || o === '/admin')
      return gotoFlow(adminFlow);

    await enviarMenu(ctx, provider);
  });

// Capturar dígitos sueltos solo si el usuario está en el menú (no mid-flow)
export const digitoFlow = addKeyword<Provider>(['1', '2', '3'])
  .addAction(async (ctx: Ctx, { gotoFlow }) => {
    const d = ctx.body.trim();
    if (d === '1') return gotoFlow(reservaFlow);
    if (d === '2') return gotoFlow(consultaFlow);
    if (d === '3') return gotoFlow(contactoFlow);
  });

// ── Cierre por inactividad ─────────────────────────────────────────────────────
export const endFlow = addKeyword<Provider>(utils.setEvent('END_FLOW'))
  .addAction(async (ctx, { endFlow: end, provider }) => {
    provider.forceClearUser(ctx.from);
    end('⏰ Sesión cerrada por inactividad. Escribe *hola* cuando quieras. 👋');
  });
