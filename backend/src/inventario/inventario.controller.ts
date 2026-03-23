import { Controller, Get, Post, Patch, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { InventarioService } from './inventario.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { EstadoInstanciaComponente } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly svc: InventarioService) {}

  @Get('stats-sucursales')
  statsPorSucursal() {
    return this.svc.statsPorSucursal();
  }

  @Get('instancias-conjunto')
  findAllConjuntos(@Query('sucursalId') sucursalId?: string) {
    return this.svc.findAllInstanciasConjunto(sucursalId ? +sucursalId : undefined);
  }

  @Get('instancias-conjunto/:id')
  findConjunto(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findInstanciaConjunto(id);
  }

  @Get('instancias-conjunto/:id/historial')
  getHistorial(@Param('id', ParseIntPipe) id: number) {
    return this.svc.getHistorial(id);
  }

  @Post('instancias-conjunto')
  createConjunto(@Body() body: { codigo: string; variacionId: number; sucursalId: number }) {
    return this.svc.createInstanciaConjunto(body);
  }

  @Post('instancias-conjunto/:id/ensamblar')
  ensamblar(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { componenteIds: number[] },
  ) {
    return this.svc.ensamblar(id, body.componenteIds);
  }

  @Post('instancias-conjunto/:id/desensamblar')
  desensamblar(@Param('id', ParseIntPipe) id: number) {
    return this.svc.desensamblar(id);
  }

  @Patch('instancias-conjunto/dar-de-baja')
  darDeBaja(@Body() body: { ids: number[]; motivo?: string }) {
    return this.svc.darDeBaja(body.ids, body.motivo);
  }

  @Patch('instancias-conjunto/:id/notas')
  updateNotas(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { notas: string },
  ) {
    return this.svc.updateNotas(id, body.notas);
  }

  @Get('pool')
  findPool(@Query('sucursalId', ParseIntPipe) sucursalId: number) {
    return this.svc.findPool(sucursalId);
  }

  @Get('instancias-componente')
  findAllComponentes(@Query('sucursalId') sucursalId?: string) {
    return this.svc.findAllInstanciasComponente(sucursalId ? +sucursalId : undefined);
  }

  @Post('instancias-componente')
  createComponente(@Body() body: { serial: string; talla?: string; componenteId: number; sucursalId: number; notas?: string }) {
    return this.svc.createInstanciaComponente(body);
  }

  @Patch('instancias-componente/:id/estado')
  updateEstado(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { estado: EstadoInstanciaComponente; notas?: string },
  ) {
    return this.svc.updateEstadoComponente(id, body.estado, body.notas);
  }
}
