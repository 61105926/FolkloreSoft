import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ContratosService } from './contratos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('contratos')
export class ContratosController {
  constructor(private readonly svc: ContratosService) {}

  // ── Contratos ──────────────────────────────────────────────────────────────
  @Get()              findAll() { return this.svc.findAll(); }
  @Get('garantias')   findAllGarantias() { return this.svc.findAllGarantias(); }
  @Get(':id')         findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()     create(@Body() body: any) { return this.svc.create(body); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  // ── Lifecycle ──────────────────────────────────────────────────────────────
  @Patch(':id/confirmar') confirmar(@Param('id', ParseIntPipe) id: number) { return this.svc.confirmar(id); }
  @Patch(':id/entregar') entregar(@Param('id', ParseIntPipe) id: number) { return this.svc.entregar(id); }
  @Patch(':id/iniciar')  iniciarUso(@Param('id', ParseIntPipe) id: number) { return this.svc.iniciarUso(id); }
  @Patch(':id/devolver') devolver(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.devolver(id, body); }
  @Patch(':id/cerrar')   cerrar(@Param('id', ParseIntPipe) id: number) { return this.svc.cerrar(id); }
  @Patch(':id/cancelar') cancelar(@Param('id', ParseIntPipe) id: number) { return this.svc.cancelar(id); }
  @Patch(':id/retener')  retenerGarantia(@Param('id', ParseIntPipe) id: number, @Body() body: { motivo: string }) {
    return this.svc.retenerGarantia(id, body.motivo ?? '');
  }
  @Post(':id/registrar-pago')   registrarPago(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.registrarPago(id, body); }
  @Post(':id/registrar-egreso') registrarEgreso(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.registrarEgreso(id, body); }

  // ── Prendas ────────────────────────────────────────────────────────────────
  @Post(':id/prendas')                          addPrenda(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.addPrenda(id, body); }
  @Patch('prendas/:id')                         updatePrenda(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updatePrenda(id, body); }
  @Delete('prendas/:id')                        removePrenda(@Param('id', ParseIntPipe) id: number) { return this.svc.removePrenda(id); }
  @Get('prendas/:id/instancias-disponibles')    getInstanciasDisponibles(@Param('id', ParseIntPipe) id: number) { return this.svc.getInstanciasDisponibles(id); }
  @Get('variacion/:id/stock')                   getStockForVariacion(@Param('id', ParseIntPipe) id: number) { return this.svc.getStockForVariacion(id); }

  // ── Garantías ──────────────────────────────────────────────────────────────
  @Post(':id/garantias')     addGarantia(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.addGarantia(id, body); }
  @Patch('garantias/:id')    updateGarantia(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateGarantia(id, body); }
  @Delete('garantias/:id')   removeGarantia(@Param('id', ParseIntPipe) id: number) { return this.svc.removeGarantia(id); }

  // ── Participantes ──────────────────────────────────────────────────────────
  @Post(':id/participantes')              addParticipante(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.addParticipante(id, body); }
  @Patch('participantes/:id')             updateParticipante(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateParticipante(id, body); }
  @Delete('participantes/:id')            removeParticipante(@Param('id', ParseIntPipe) id: number) { return this.svc.removeParticipante(id); }
  @Patch('participantes/:id/devolver')    marcarDevuelto(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.marcarDevuelto(id, body); }
}
