import {
  Controller, Get, Post, Patch, Param, Body,
  Query, ParseIntPipe, UseGuards, Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { InventarioService } from './inventario.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TipoMovimientoStock, EstadoInstanciaComponente } from '@prisma/client';

interface JwtUser { id: number; rol: string; sucursalId: number | null }

@UseGuards(JwtAuthGuard)
@Controller('inventario')
export class InventarioController {
  constructor(private readonly svc: InventarioService) {}

  // ── Resumen de stock ──────────────────────────────────────────────────────

  @Get('stats-sucursales')
  statsDashboard() {
    return this.svc.statsDashboard();
  }

  @Get('stock')
  resumenStock() {
    return this.svc.resumenStock();
  }

  @Get('stock/:variacionId')
  stockVariacion(@Param('variacionId', ParseIntPipe) variacionId: number) {
    return this.svc.stockVariacion(variacionId).then((stock) => ({ variacionId, stock }));
  }

  @Get('stock/conjunto/:conjuntoId')
  stockConjunto(@Param('conjuntoId', ParseIntPipe) conjuntoId: number) {
    return this.svc.stockConjunto(conjuntoId);
  }

  // ── Movimientos de stock ──────────────────────────────────────────────────

  @Get('movimientos')
  getMovimientos(@Query('variacionId') variacionId?: string) {
    return this.svc.getMovimientos(variacionId ? +variacionId : undefined);
  }

  @Post('movimientos')
  registrarMovimiento(
    @Body() body: {
      variacionId: number;
      tipo: TipoMovimientoStock;
      cantidad: number;
      motivo?: string;
    },
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.svc.registrarMovimiento({ ...body, userId: req.user.id });
  }

  @Post('movimientos/masivo')
  registrarMasivo(
    @Body() body: {
      items: { variacionId: number; tipo: TipoMovimientoStock; cantidad: number; motivo?: string }[];
    },
    @Req() req: Request & { user: JwtUser },
  ) {
    return this.svc.registrarMovimientoMasivo(body.items, req.user.id);
  }

  // ── Instancias de componentes ─────────────────────────────────────────────

  @Get('instancias-componente')
  findAllComponentes(@Query('sucursalId') sucursalId?: string) {
    return this.svc.findAllInstanciasComponente(sucursalId ? +sucursalId : undefined);
  }

  @Post('instancias-componente')
  createComponente(
    @Body() body: {
      serial: string;
      talla?: string;
      componenteId: number;
      sucursalId: number;
      notas?: string;
    },
  ) {
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
