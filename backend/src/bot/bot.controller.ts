import { Controller, Get, Post, Query, Body, UnauthorizedException } from '@nestjs/common';
import { BotService } from './bot.service.js';

// Simple API-key guard (no JWT needed — bot calls this internally)
function verifyKey(key: string | undefined) {
  const expected = process.env.BOT_API_KEY ?? 'folklosoft-bot-key';
  if (key !== expected) throw new UnauthorizedException('Invalid bot API key');
}

@Controller('bot')
export class BotController {
  constructor(private readonly svc: BotService) {}

  @Get('consulta-reserva')
  consulta(@Query('q') q: string, @Query('key') key: string) {
    verifyKey(key);
    return this.svc.consultarReserva(q);
  }

  @Get('cotizacion')
  cotizacion(
    @Query('conjuntoId') conjuntoId: string,
    @Query('cantidad') cantidad: string,
    @Query('dias') dias: string,
    @Query('key') key: string,
  ) {
    verifyKey(key);
    return this.svc.cotizar(parseInt(conjuntoId), parseInt(cantidad) || 1, parseInt(dias) || 1);
  }

  @Get('stats-hoy')
  statsHoy(@Query('key') key: string) {
    verifyKey(key);
    return this.svc.statsHoy();
  }

  @Get('por-vencer')
  porVencer(@Query('horas') horas: string, @Query('key') key: string) {
    verifyKey(key);
    return this.svc.porVencer(parseInt(horas) || 48);
  }

  @Post('cancelar-reserva')
  cancelar(@Body() body: { codigo: string; ci: string; key: string }) {
    verifyKey(body.key);
    return this.svc.cancelarReserva(body.codigo, body.ci);
  }

  @Get('catalogo')
  catalogo(@Query('key') key: string) {
    verifyKey(key);
    return this.svc.getCatalogo();
  }
}
