import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';

export const contactoFlow = addKeyword<Provider>(['asesor', 'humano', 'persona', 'hablar con asesor'])
  .addAction(async (ctx, { provider, blacklist, endFlow }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '📞 *Contacto con asesor*\n\n' +
        'Un asesor de FolkloreSoft responderá tu mensaje en breve.\n\n' +
        '📍 *Sede Central La Paz*\nAv. 16 de Julio #1234\n\n' +
        '📍 *Sucursal Cochabamba*\nAv. Heroínas #567\n\n' +
        '⏰ Lun–Sáb 8:00–20:00',
    });

    // Añadir a blacklist para que el bot no responda mientras atiende un humano
    blacklist.add(ctx.from);
    endFlow();
  });
