import cron from 'node-cron';
import type { SendWaveProvider } from '@gamastudio/sendwave-provider';
import { porVencer, statsHoy } from './api.js';

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
  } catch {
    return String(d);
  }
}

function delay(ms: number) {
  return new Promise((r) => setTimeout(r, ms));
}

export function setupCrons(provider: SendWaveProvider) {
  const rawAdmin = process.env.ADMIN_PHONE;
  const adminPhone = rawAdmin ? normalizePhone(rawAdmin) : null;

  // ── Reporte diario al admin — todos los días a las 8:00 ──────────────────
  cron.schedule(
    '0 8 * * *',
    async () => {
      if (!adminPhone) return;
      try {
        const s = await statsHoy();
        await provider.sendText({
          from: adminPhone,
          text:
            `📊 *Reporte diario — FolkloreSoft Bolivia*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `📦 Entregas programadas hoy: *${s.entregas}*\n` +
            `🔄 Devoluciones programadas hoy: *${s.devoluciones}*\n` +
            `📋 Nuevas reservas creadas hoy: *${s.nuevasReservas}*\n` +
            `━━━━━━━━━━━━━━━━━━━━━━━━\n` +
            `💰 Deuda total pendiente: *Bs. ${s.totalDeuda.toFixed(2)}* (${s.deudas} contratos)\n` +
            `⚠️ Contratos vencidos sin devolver: *${s.vencidos}*`,
        });
      } catch {
        // cron silently fails
      }
    },
    { timezone: 'America/La_Paz' },
  );

  // ── Recordatorios de devolución — 10:00 y 16:00 ─────────────────────────
  // Busca contratos que vencen en las próximas 48 h y notifica al cliente
  cron.schedule(
    '0 10,16 * * *',
    async () => {
      try {
        const contratos = await porVencer(48);
        for (const c of contratos) {
          if (!c.cliente.celular) continue;
          const pendientes = c.participantes.map((p) => p.nombre);
          if (!pendientes.length) continue;

          const to = normalizePhone(c.cliente.celular);
          await provider.sendText({
            from: to,
            text:
              `⏰ *Recordatorio de devolución — FolkloreSoft Bolivia*\n\n` +
              `Hola *${c.cliente.nombre}* 👋\n\n` +
              `Tu contrato *${c.codigo}* vence el *${fmtDate(c.fecha_devolucion)}*.\n\n` +
              `Prendas pendientes de devolver:\n` +
              `${pendientes.map((n) => `  • ${n}`).join('\n')}\n\n` +
              `Por favor acércate a nuestra sede a tiempo.\n` +
              `📞 Consultas: escribe *menú* a este número.`,
          });

          // Pausa entre mensajes para no saturar la API
          await delay(1500);
        }
      } catch {
        // cron silently fails
      }
    },
    { timezone: 'America/La_Paz' },
  );

  console.log('⏰ Crons configurados (reporte 8am · recordatorios 10am/4pm) — La Paz timezone');
}
