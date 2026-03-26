import { config } from 'dotenv';
config();

import { createBot, createFlow, MemoryDB } from '@builderbot/bot';
import { createSendWaveProvider } from '@gamastudio/sendwave-provider';
import { menuFlow, volverFlow, endFlow } from './flows/menu.flow.js';
import { stockFlow } from './flows/stock.flow.js';
import { reservaFlow } from './flows/reserva.flow.js';
import { contactoFlow } from './flows/contacto.flow.js';

const PORT = parseInt(process.env.BOT_PORT ?? '3002');

async function main() {
  const adapterDB = new MemoryDB();

  const adapterProvider = createSendWaveProvider({
    name: 'dev',
    apiKey: process.env.SENDWAVE_API_KEY ?? '4DA4CC84-96D0-4A6E-95AD-BE76F0961CFA',
    port: PORT,
    queueFlow: {
      enabled: true,
      warningTimeout: 20 * 60 * 1000, // 20 min sin actividad → aviso
      endTimeout:      2 * 60 * 1000, // 2 min más → cierra sesión
      warningMessage: '⏳ ¿Sigues ahí? Escribe cualquier cosa o escribe *menú* para continuar.',
    },
  });

  const adapterFlow = createFlow([
    menuFlow,
    volverFlow,
    endFlow,
    stockFlow,
    reservaFlow,
    contactoFlow,
  ]);

  const { httpServer } = await createBot({
    flow:     adapterFlow,
    provider: adapterProvider,
    database: adapterDB,
  });

  httpServer(PORT);
  console.log(`🤖 FolkloreSoft Bot corriendo en puerto ${PORT}`);
}

main();
