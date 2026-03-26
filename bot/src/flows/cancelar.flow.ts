import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { cancelarReserva } from '../api.js';

export const cancelarFlow = addKeyword<Provider>([
  'cancelar reserva', 'anular', 'anular reserva',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '❌ *Cancelar reserva*\n\n' +
        'Para cancelar necesito verificar tu identidad.\n\n' +
        '¿Cuál es el *código de tu contrato*? (ejemplo: CNT-2026-001)\n\n' +
        '_(Escribe *salir* para cancelar la operación)_',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'salir')
      return endFlow('Operación cancelada. Escribe *menú* cuando quieras. 👋');
    await state.update({ codigo: ctx.body.trim().toUpperCase() });
    await provider.sendText({
      from: ctx.from,
      text: '🪪 Ahora ingresa tu *número de CI* para confirmar tu identidad:',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    if (ctx.body.trim().toLowerCase() === 'salir')
      return endFlow('Operación cancelada. Escribe *menú* cuando quieras. 👋');

    const s = state.getMyState() as Record<string, string>;
    const resultado = await cancelarReserva(s.codigo, ctx.body.trim());

    if (!resultado) {
      await provider.sendText({
        from: ctx.from,
        text:
          `❌ No se pudo cancelar *${s.codigo}*.\n\n` +
          `Verifica que:\n` +
          `  • El código sea correcto\n` +
          `  • El CI coincida con el registrado\n` +
          `  • La reserva esté en estado Reservado o Confirmado\n\n` +
          `Escribe *asesor* para hablar con una persona o *menú* para volver.`,
      });
      return endFlow();
    }

    await provider.sendText({
      from: ctx.from,
      text:
        `✅ *Reserva cancelada exitosamente*\n\n` +
        `Hola *${resultado.cliente.nombre}* 👋\n\n` +
        `La reserva *${resultado.codigo}* ha sido cancelada.\n\n` +
        `Si fue un error o deseas volver a reservar, escribe *reservar*.\n` +
        `Escribe *menú* para volver al inicio.`,
    });

    endFlow();
  });
