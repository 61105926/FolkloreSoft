import { Anthropic } from '@anthropic-ai/sdk';

export type Intent =
  | 'STOCK'
  | 'RESERVA'
  | 'CONSULTA'
  | 'CANCELAR'
  | 'COTIZACION'
  | 'ASESOR'
  | 'MENU';

const SYSTEM_INTENT = `Eres el asistente de FolkloreSoft Bolivia, empresa de alquiler de trajes folklóricos.
Analiza el mensaje del cliente y responde SOLO con una de estas palabras exactas (sin texto adicional):
STOCK, RESERVA, CONSULTA, CANCELAR, COTIZACION, ASESOR, MENU
- STOCK: disponibilidad, trajes, catálogo, danzas
- RESERVA: quiero reservar, alquilar, necesito trajes
- CONSULTA: ver mi reserva, estado de contrato, buscar reserva
- CANCELAR: cancelar reserva, anular
- COTIZACION: cuánto cuesta, precio, tarifa
- ASESOR: hablar con persona, agente humano
- MENU: cualquier otra cosa`;

const SYSTEM_LIBRE = `Eres el asistente virtual de FolkloreSoft Bolivia, empresa de alquiler de trajes folklóricos.
Responde breve y amigable en español. Puedes informar:
- Alquilamos trajes de: Tinku, Caporales, Morenada, Diablada, Saya, Kullawada y más
- Para disponibilidad escribe: disponibilidad
- Para precios escribe: cotizar
- Para reservar escribe: reservar
- Para consultar tu reserva escribe: consultar
- Horario: Lun–Sáb 8:00–20:00
Si no puedes responder con certeza, invita a escribir *menú*.`;

// Lazy — solo se crea si hay API key
let _client: Anthropic | null = null;

function getClient(): Anthropic | null {
  const key = process.env.ANTHROPIC_API_KEY;
  if (!key) return null;
  if (!_client) {
    _client = new Anthropic({ apiKey: key, timeout: 10_000, maxRetries: 0 });
  }
  return _client;
}

export async function detectIntent(message: string): Promise<Intent | null> {
  const client = getClient();
  if (!client) return null;

  try {
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 20,
      system: SYSTEM_INTENT,
      messages: [{ role: 'user', content: message }],
    });
    const text = ((res.content[0] as { text: string }).text ?? '').trim().toUpperCase() as Intent;
    const valid: Intent[] = ['STOCK', 'RESERVA', 'CONSULTA', 'CANCELAR', 'COTIZACION', 'ASESOR', 'MENU'];
    return valid.includes(text) ? text : 'MENU';
  } catch {
    return null;
  }
}

export async function responderLibre(message: string): Promise<string> {
  const client = getClient();
  if (!client) return 'No entendí tu consulta. Escribe *menú* para ver las opciones disponibles.';

  try {
    const res = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 300,
      system: SYSTEM_LIBRE,
      messages: [{ role: 'user', content: message }],
    });
    return (res.content[0] as { text: string }).text ?? 'Escribe *menú* para ver las opciones.';
  } catch {
    return 'Escribe *menú* para ver las opciones disponibles.';
  }
}
