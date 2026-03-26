import { addKeyword } from '@builderbot/bot';
import { SendWaveProvider as Provider } from '@gamastudio/sendwave-provider';
import { statsHoy, porVencer } from '../api.js';

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.startsWith('591')) return digits;
  if (digits.startsWith('7') || digits.startsWith('6')) return `591${digits}`;
  return digits;
}

function fmtDate(d: string | Date): string {
  try {
    return new Date(d).toLocaleDateString('es-BO', { day: '2-digit', month: '2-digit', year: 'numeric' });
  } catch { return String(d); }
}

function isAdmin(from: string): boolean {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) return false;
  return normalizePhone(from) === normalizePhone(adminPhone);
}

export const adminFlow = addKeyword<Provider>(['admin', '/admin', '/stats'])
  .addAction(async (ctx, { provider, endFlow }) => {
    if (!isAdmin(ctx.from)) {
      await provider.sendText({
        from: ctx.from,
        text: '🚫 Acceso restringido. Escribe *menú* para ver las opciones disponibles.',
      });
      return endFlow();
    }

    await provider.sendText({
      from: ctx.from,
      text:
        '🔑 *Panel Admin — FolkloreSoft*\n\n' +
        '1. Reporte del día\n' +
        '2. Contratos por vencer (48h)\n\n' +
        'Responde con el número:',
    });
  })
  .addAction({ capture: true }, async (ctx, { provider, endFlow }) => {
    if (!isAdmin(ctx.from)) return endFlow();

    const opt = ctx.body.trim();

    if (opt === '1' || opt.toLowerCase().includes('reporte')) {
      const s = await statsHoy();
      await provider.sendText({
        from: ctx.from,
        text:
          `📊 *Reporte del día*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 Entregas hoy: *${s.entregas}*\n` +
          `🔄 Devoluciones hoy: *${s.devoluciones}*\n` +
          `📋 Nuevas reservas: *${s.nuevasReservas}*\n` +
          `💰 Deuda total: *Bs. ${s.totalDeuda.toFixed(2)}* (${s.deudas} contratos)\n` +
          `⚠️ Contratos vencidos: *${s.vencidos}*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Escribe *admin* para volver al panel.`,
      });
      return endFlow();
    }

    if (opt === '2' || opt.toLowerCase().includes('vencer')) {
      const contratos = await porVencer(48);
      if (!contratos.length) {
        await provider.sendText({
          from: ctx.from,
          text: '✅ No hay contratos por vencer en las próximas 48 horas.\n\nEscribe *admin* para volver.',
        });
        return endFlow();
      }

      const lista = contratos
        .map((c) =>
          `📋 *${c.codigo}* — ${c.cliente.nombre}\n` +
          `   Vence: ${fmtDate(c.fecha_devolucion)}\n` +
          `   📱 ${c.cliente.celular ?? 'Sin celular'}\n` +
          `   Pendientes: ${c.participantes.map((p) => p.nombre).join(', ') || '—'}`,
        )
        .join('\n\n');

      await provider.sendText({
        from: ctx.from,
        text:
          `⚠️ *Por vencer en 48h — ${contratos.length} contratos*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          lista +
          `\n━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Escribe *admin* para volver al panel.`,
      });
      return endFlow();
    }

    await provider.sendText({
      from: ctx.from,
      text: 'Escribe *1* para reporte del día o *2* para contratos por vencer.',
    });
    endFlow();
  });
