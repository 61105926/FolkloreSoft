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
    return new Date(d).toLocaleDateString('es-BO', {
      day: '2-digit', month: '2-digit', year: 'numeric',
    });
  } catch { return String(d); }
}

function isAdmin(from: string): boolean {
  const adminPhone = process.env.ADMIN_PHONE;
  if (!adminPhone) return false;
  return normalizePhone(from) === normalizePhone(adminPhone);
}

export const adminFlow = addKeyword<Provider>([
  'admin', '/admin', 'panel', '/stats', 'estadísticas admin',
])
  .addAction(async (ctx, { provider, endFlow }) => {
    if (!isAdmin(ctx.from)) {
      await provider.sendText({
        from: ctx.from,
        text: '🚫 Acceso restringido. Escribe *menú* para ver las opciones disponibles.',
      });
      return endFlow();
    }

    await provider.sendList({
      from: ctx.from,
      list: {
        title: '🔑 Panel Admin — FolkloreSoft',
        description: '¿Qué información necesitas?',
        button: 'Ver opciones',
        content: [
          '📊 Reporte del día',
          '⚠️ Contratos por vencer (48h)',
          '⚠️ Contratos vencidos (ya pasados)',
        ],
      },
    });
  })
  .addAction({ capture: true }, async (ctx, { provider, endFlow }) => {
    if (!isAdmin(ctx.from)) return endFlow();

    const opt = ctx.body.trim().toLowerCase();

    if (opt.includes('reporte') || opt.includes('día') || opt === '1') {
      const s = await statsHoy();
      await provider.sendText({
        from: ctx.from,
        text:
          `📊 *Reporte del día — FolkloreSoft Bolivia*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `📦 Entregas hoy: *${s.entregas}*\n` +
          `🔄 Devoluciones hoy: *${s.devoluciones}*\n` +
          `📋 Nuevas reservas: *${s.nuevasReservas}*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `💰 Deuda total: *Bs. ${s.totalDeuda.toFixed(2)}* (${s.deudas} contratos)\n` +
          `⚠️ Contratos vencidos sin devolver: *${s.vencidos}*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Escribe *admin* para volver al panel.`,
      });
      return endFlow();
    }

    if (opt.includes('vencer') || opt.includes('48') || opt === '2') {
      const contratos = await porVencer(48);
      if (!contratos.length) {
        await provider.sendText({
          from: ctx.from,
          text: '✅ No hay contratos por vencer en las próximas 48 horas.\n\nEscribe *admin* para volver.',
        });
        return endFlow();
      }

      const lista = contratos
        .map(
          (c) =>
            `📋 *${c.codigo}* — ${c.cliente.nombre}\n` +
            `   Vence: ${fmtDate(c.fecha_devolucion)}\n` +
            `   Pendientes: ${c.participantes.map((p) => p.nombre).join(', ') || '—'}`,
        )
        .join('\n\n');

      await provider.sendText({
        from: ctx.from,
        text:
          `⚠️ *Contratos por vencer (48h) — ${contratos.length} total*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${lista}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Escribe *admin* para volver al panel.`,
      });
      return endFlow();
    }

    if (opt.includes('vencido') || opt === '3') {
      // Contratos que ya vencieron (pasados, aún no devueltos)
      const contratos = await porVencer(-1); // horas negativas = buscar pasados
      if (!contratos.length) {
        await provider.sendText({
          from: ctx.from,
          text: '✅ No hay contratos vencidos pendientes de devolución.\n\nEscribe *admin* para volver.',
        });
        return endFlow();
      }

      const lista = contratos
        .map(
          (c) =>
            `📋 *${c.codigo}* — ${c.cliente.nombre}\n` +
            `   Venció: ${fmtDate(c.fecha_devolucion)}\n` +
            `   📱 ${c.cliente.celular ?? 'Sin celular'}`,
        )
        .join('\n\n');

      await provider.sendText({
        from: ctx.from,
        text:
          `🚨 *Contratos vencidos sin devolver*\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `${lista}\n` +
          `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
          `Escribe *admin* para volver al panel.`,
      });
      return endFlow();
    }

    await provider.sendText({
      from: ctx.from,
      text: 'No reconocí esa opción. Escribe *admin* para ver el panel nuevamente.',
    });
    endFlow();
  });
