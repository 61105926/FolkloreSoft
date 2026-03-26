import { addKeyword } from '@builderbot/bot';

export const contactoFlow = addKeyword(['4', 'asesor', 'humano', 'persona', 'ayuda'])
  .addAnswer(
    '📞 Te ponemos en contacto con un asesor de *FolkloreSoft Bolivia*.\n\n' +
    '🕐 Horario: Lunes a Sábado de 8:00 a 20:00\n' +
    '📍 Sede Central: Av. 16 de Julio #1234, La Paz\n' +
    '📍 Sucursal Cbba: Av. Heroínas #567, Cochabamba\n\n' +
    'Un asesor responderá tu mensaje en breve.\n\n' +
    'Escribe *menú* para volver al inicio.'
  );
