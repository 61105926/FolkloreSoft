import { config } from 'dotenv';
config();

import { createServer } from 'http';
import { createBot, createFlow, MemoryDB } from '@builderbot/bot';
import { createSendWaveProvider } from '@gamastudio/sendwave-provider';

import { menuFlow, volverFlow, opcionFlow, endFlow } from './flows/menu.flow.js';
import { stockFlow }      from './flows/stock.flow.js';
import { reservaFlow }    from './flows/reserva.flow.js';
import { contactoFlow }   from './flows/contacto.flow.js';
import { consultaFlow }   from './flows/consulta.flow.js';
import { cotizacionFlow } from './flows/cotizacion.flow.js';
import { cancelarFlow }   from './flows/cancelar.flow.js';
import { adminFlow }      from './flows/admin.flow.js';

import { handleNotify } from './notify.js';
import { setupCrons }   from './cron.js';

const PORT        = parseInt(process.env.BOT_PORT    ?? '3002');
const NOTIFY_PORT = parseInt(process.env.NOTIFY_PORT ?? '3003');

// El provider SendWave registra su propio console.error para unhandledRejection.
// Filtramos el mensaje cosmético de BuilderBot para no ensuciar los logs.
const _ce = console.error.bind(console);
console.error = (...args: unknown[]) => {
  if (
    args[0] === '[Global] Unhandled rejection:' &&
    args[1] instanceof Error &&
    args[1].message?.includes('Queue item timeout')
  ) return;
  _ce(...args);
};

// Envuelve los métodos sendText/sendImage del provider con un timeout de 20 s
// para que nunca bloqueen el queue indefinidamente
function patchProviderTimeout(provider: Record<string, unknown>, ms = 20_000) {
  for (const method of ['sendText', 'sendImage'] as const) {
    if (typeof provider[method] !== 'function') continue;
    const original = (provider[method] as (...a: unknown[]) => Promise<unknown>).bind(provider);
    provider[method] = async (...args: unknown[]) => {
      const timer = new Promise<void>((_, reject) =>
        setTimeout(() => reject(new Error(`${method} timeout ${ms}ms`)), ms),
      );
      try {
        return await Promise.race([original(...args), timer]);
      } catch (e) {
        console.warn(`[Bot] ${method} falló:`, (e as Error).message);
      }
    };
  }
}

async function main() {
  const adapterDB = new MemoryDB();

  const adapterProvider = createSendWaveProvider({
    name: 'dev',
    apiKey: process.env.SENDWAVE_API_KEY ?? '4DA4CC84-96D0-4A6E-95AD-BE76F0961CFA',
    port: PORT,
    queueFlow: {
      enabled: true,
      warningTimeout: 20 * 60 * 1000,  // 20 min sin actividad → aviso
      endTimeout:      2 * 60 * 1000,   // 2 min más → cierre
      warningMessage: '⏳ ¿Sigues ahí? Escribe cualquier cosa o *menú* para continuar.',
    },
  });

  const adapterFlow = createFlow([
    // Menú principal y bienvenida
    menuFlow,
    volverFlow,
    opcionFlow,
    endFlow,
    // Flujos de usuario
    stockFlow,
    cotizacionFlow,
    reservaFlow,
    consultaFlow,
    cancelarFlow,
    contactoFlow,
    // Admin
    adminFlow,
  ]);

  patchProviderTimeout(adapterProvider as unknown as Record<string, unknown>);

  const { httpServer } = await createBot(
    { flow: adapterFlow, provider: adapterProvider, database: adapterDB },
    { queue: { timeout: 300_000, concurrencyLimit: 15 } }, // 5 min por paso
  );

  httpServer(PORT);

  // ── Cron jobs (recordatorios y reporte diario) ────────────────────────────
  setupCrons(adapterProvider);

  // ── Servidor interno para notificaciones push desde NestJS ────────────────
  const notifyServer = createServer((req, res) => {
    if (req.method === 'POST' && req.url === '/notify') {
      let body = '';
      req.on('data', (chunk) => { body += chunk; });
      req.on('end', async () => {
        try {
          const payload = JSON.parse(body);
          await handleNotify(payload, adapterProvider);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true }));
        } catch (e) {
          res.writeHead(500);
          res.end(JSON.stringify({ error: (e as Error).message }));
        }
      });
    } else {
      res.writeHead(404);
      res.end();
    }
  });

  notifyServer.listen(NOTIFY_PORT, () => {
    console.log(`🤖 FolkloreSoft Bot → WhatsApp en puerto ${PORT}`);
    console.log(`📨 Notificaciones internas en puerto ${NOTIFY_PORT}`);
    console.log(`🔑 Admin phone: ${process.env.ADMIN_PHONE ?? '(no configurado)'}`);
    console.log(`🤖 IA Claude: ${process.env.ANTHROPIC_API_KEY ? 'activa' : 'inactiva (sin ANTHROPIC_API_KEY)'}`);
  });
}

main();
