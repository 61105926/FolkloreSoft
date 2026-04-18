import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class BotNotifyService {
  private readonly logger = new Logger(BotNotifyService.name);
  private readonly botUrl  = process.env.BOT_URL ?? 'http://localhost:3002';

  private async send(payload: unknown) {
    try {
      const res = await fetch(`${this.botUrl}/notify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (!res.ok) this.logger.warn(`Bot notify failed: ${res.status}`);
    } catch (e) {
      // Bot can be offline — never crash the main flow
      this.logger.warn(`Bot offline, skipping notify: ${(e as Error).message}`);
    }
  }

  // ── Comprobante completo al entregar el contrato ───────────────────────────
  async notificarEntrega(contrato: {
    codigo: string;
    cliente: { nombre: string; celular?: string | null };
    evento?: { nombre: string } | null;
    nombre_evento_ext?: string | null;
    fecha_entrega: Date | string;
    fecha_devolucion: Date | string;
    total: number | string;
    total_pagado: number | string;
    anticipo: number | string;
    prendas: {
      modelo: string;
      total: number;
      costo_unitario: number | string;
      subtotal: number | string;
      variacion?: { nombre_variacion: string; talla?: string | null } | null;
    }[];
    garantias: {
      tipo: string;
      descripcion?: string | null;
      valor?: number | string | null;
    }[];
    participantes: {
      nombre: string;
      ci?: string | null;
      tipo?: string | null;
      instanciaConjunto?: { codigo: string } | null;
    }[];
  }) {
    const to = contrato.cliente.celular;
    if (!to) return;

    await this.send({ type: 'COMPROBANTE_ENTREGA', to, contrato });
  }

  // ── Notificar a un participante que su prenda está lista ───────────────────
  async notificarPrendaLista(data: {
    clienteCelular?: string | null;
    clienteNombre: string;
    contratoCode: string;
    participanteNombre: string;
    instanciaCodigo: string;
    prendaModelo: string;
  }) {
    if (!data.clienteCelular) return;
    await this.send({ type: 'PRENDA_LISTA', to: data.clienteCelular, data });
  }

  // ── Confirmación de devolución de participante ─────────────────────────────
  async notificarDevolucion(data: {
    clienteCelular?: string | null;
    clienteNombre: string;
    contratoCode: string;
    participanteNombre: string;
  }) {
    if (!data.clienteCelular) return;
    await this.send({ type: 'DEVOLUCION_PARTICIPANTE', to: data.clienteCelular, data });
  }

  // ── Confirmación de reserva ───────────────────────────────────────────────
  async notificarConfirmacion(data: {
    clienteCelular?: string | null;
    clienteNombre: string;
    contratoCode: string;
    eventoNombre: string;
    fechaEntrega: string;
    fechaDevolucion: string;
    totalPrendas: number;
  }) {
    if (!data.clienteCelular) return;
    await this.send({ type: 'CONFIRMACION_RESERVA', to: data.clienteCelular, data });
  }

  // ── Recordatorio de devolución (puede llamarse desde un cron) ─────────────
  async notificarRecordatorio(data: {
    clienteCelular?: string | null;
    clienteNombre: string;
    contratoCode: string;
    fechaDevolucion: string;
    pendientes: string[]; // nombres de participantes que no devolvieron
  }) {
    if (!data.clienteCelular) return;
    await this.send({ type: 'RECORDATORIO_DEVOLUCION', to: data.clienteCelular, data });
  }
}
