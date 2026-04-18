import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';

const FRONTEND = process.env.FRONTEND_URL ?? 'http://localhost:3000';

export const reservaFlow = addKeyword<Provider>([
  'reservar', 'quiero reservar', 'alquilar', 'necesito trajes',
])
  .addAction(async (ctx, { provider, endFlow }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        `🎭 *Reserva de trajes folklóricos*\n\n` +
        `Visita nuestro catálogo en línea para ver todos los trajes disponibles, calcular precios y enviar tu solicitud:\n\n` +
        `👉 *${FRONTEND}/catalogo*\n\n` +
        `Allí puedes:\n` +
        `  • Ver todos los trajes y tallas disponibles\n` +
        `  • Agregar varios trajes a la vez\n` +
        `  • Calcular el costo total y anticipo\n` +
        `  • Enviar tu solicitud en segundos\n\n` +
        `¿Necesitas ayuda personal? Escribe *asesor* 😊`,
    });
    endFlow();
  });
