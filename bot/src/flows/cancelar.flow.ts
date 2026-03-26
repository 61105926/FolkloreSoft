import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { cancelarReserva } from '../api.js';

export const cancelarFlow = addKeyword<Provider>([
  '5', 'cancelar', 'cancelar reserva', 'anular', 'anular reserva',
  '❌ cancelar reserva',
])
  .addAction(async (ctx, { provider }) => {
    await provider.sendText({
      from: ctx.from,
      text:
        '❌ *Cancelar reserva*\n\n' +
        'Para cancelar una reserva necesito verificar tu identidad.\n\n' +
        '¿Cuál es el *código de tu contrato*? (ejemplo: CNT-2026-001)\n\n' +
        '_(Escribe *salir* para cancelar la operación)_',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    const input = ctx.body.trim();
    if (input.toLowerCase() === 'salir') {
      return endFlow('Operación cancelada. Escribe *menú* cuando quieras. 👋');
    }
    await state.update({ codigo: input.toUpperCase() });
    await provider.sendText({
      from: ctx.from,
      text: '🪪 Ahora ingresa tu *número de CI* para confirmar tu identidad:',
    });
  })
  .addAction({ capture: true }, async (ctx, { state, provider, endFlow }) => {
    const ci = ctx.body.trim();
    if (ci.toLowerCase() === 'salir') {
      return endFlow('Operación cancelada. Escribe *menú* cuando quieras. 👋');
    }

    const s = state.getMyState() as Record<string, string>;
    const resultado = await cancelarReserva(s.codigo, ci);

    if (!resultado) {
      await provider.sendText({
        from: ctx.from,
        text:
          `❌ No se pudo cancelar la reserva *${s.codigo}*.\n\n` +
          `Verifica que:\n` +
          `  • El código de contrato sea correcto\n` +
          `  • El CI coincida con el registrado\n` +
          `  • La reserva esté en estado *Reservado* o *Confirmado*\n\n` +
          `Si necesitas más ayuda, escribe *asesor* para hablar con una persona.\n` +
          `Escribe *menú* para volver.`,
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
