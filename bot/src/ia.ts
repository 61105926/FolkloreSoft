import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY ?? '' });

export type Intent =
  | 'STOCK'
  | 'RESERVA'
  | 'CONSULTA'
  | 'CANCELAR'
  | 'COTIZACION'
  | 'ASESOR'
  | 'MENU';

const SYSTEM_PROMPT = `Eres el asistente virtual de FolkloreSoft Bolivia, empresa de alquiler de trajes de danzas folklóricas bolivianas.
Analiza el mensaje del cliente y responde SOLO con una de estas palabras (sin ningún texto adicional):
- STOCK: disponibilidad, trajes disponibles, qué tienen, catálogo, ver danzas, ver trajes
- RESERVA: quiero reservar, hacer reserva, alquilar trajes, necesito trajes
- CONSULTA: ver mi reserva, estado de contrato, buscar mi pedido, mi reserva, seguimiento
- CANCELAR: cancelar reserva, anular pedido, ya no quiero
- COTIZACION: cuánto cuesta, precio, cotizar, cuánto cobran, tarifa
- ASESOR: hablar con persona, agente, ayuda humana, necesito ayuda, asesor
- MENU: saludos generales, cualquier otra cosa no clasificable`;

/**
 * Detecta la intención del mensaje usando Claude Haiku.
 * Retorna null si la API Key no está configurada o falla la llamada.
 */
export async function detectIntent(message: string): Promise<Intent | null> {
  if (!process.env.ANTHROPIC_API_KEY) return null;

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: message }],
    });

    const text = ((res.content[0] as { text: string }).text ?? '').trim().toUpperCase() as Intent;
    const valid: Intent[] = ['STOCK', 'RESERVA', 'CONSULTA', 'CANCELAR', 'COTIZACION', 'ASESOR', 'MENU'];
    return valid.includes(text) ? text : 'MENU';
  } catch {
    return null;
  }
}

/**
 * Genera una respuesta libre de Claude cuando el usuario hace preguntas
 * que no encajan en ningún flujo específico.
 */
export async function responderLibre(message: string): Promise<string> {
  if (!process.env.ANTHROPIC_API_KEY) {
    return 'No entendí tu consulta. Escribe *menú* para ver las opciones disponibles.';
  }

  try {
    const res = await anthropic.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system:
        `Eres el asistente de FolkloreSoft Bolivia, empresa de alquiler de trajes de folklore boliviano.
Responde de forma breve, amigable y en español. Usa emojis con moderación.
Puedes informar que:
- Alquilamos trajes de danzas: Tinku, Caporales, Morenada, Diablada, Saya, Kullawada y más
- El proceso: reserva → confirmación → entrega → devolución
- Para reservar: escribe "reserva" o "hacer reserva"
- Para ver disponibilidad: escribe "disponibilidad" o "trajes"
- Para precios: escribe "cotizacion"
- Para consultar una reserva existente: escribe "consultar"
- Horario de atención: Lun–Sáb 8:00–20:00
Si no puedes responder con certeza, invita al usuario a escribir *menú*.`,
      messages: [{ role: 'user', content: message }],
    });
    return (res.content[0] as { text: string }).text ?? 'Escribe *menú* para ver las opciones.';
  } catch {
    return 'Escribe *menú* para ver las opciones disponibles.';
  }
}
