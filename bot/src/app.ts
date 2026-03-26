import { config } from 'dotenv';
config();

import { createBot, createProvider, createFlow, MemoryDB } from '@builderbot/bot';
import { BaileysProvider } from '@builderbot/provider-baileys';
import { menuFlow, volverFlow } from './flows/menu.flow.js';
import { stockFlow } from './flows/stock.flow.js';
import { reservaFlow } from './flows/reserva.flow.js';
import { contactoFlow } from './flows/contacto.flow.js';

const PORT = parseInt(process.env.BOT_PORT ?? '3002');

async function main() {
  const adapterDB       = new MemoryDB();
  const adapterProvider = createProvider(BaileysProvider);
  const adapterFlow     = createFlow([
    menuFlow,
    volverFlow,
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
  console.log(`📱 Escanea el QR de la consola con WhatsApp para conectar`);
}

main();
