import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';

const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export const cotizacionFlow = addKeyword<Provider>([
  'cotizar', 'cotizacion', 'cotización', 'precio', 'precios',
  'cuánto cuesta', 'cuanto cuesta',
])
  .addAction(async (ctx, { provider, endFlow }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        `💰 *Cotización de trajes*\n\n` +
        `Calcula el precio de tu alquiler en nuestro catálogo en línea:\n\n` +
        `👉 *${FRONTEND}/catalogo*\n\n` +
        `Solo selecciona el traje, la cantidad y los días, y el precio se calcula al instante.\n\n` +
        `También puedes enviar tu solicitud de reserva desde ahí. 👆\n\n` +
        `¿Prefieres hablar con un asesor? Escribe *asesor*.`,
    });
    endFlow();
  });
