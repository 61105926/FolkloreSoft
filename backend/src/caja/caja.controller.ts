import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CajaService } from './caja.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly svc: CajaService) {}

  @Get()
  findAll(
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('tipo') tipo?: TipoMovimiento,
    @Query('concepto') concepto?: ConceptoCaja,
    @Query('formaPago') formaPago?: FormaPago,
    @Query('contratoId') contratoId?: string,
  ) {
    return this.svc.findAll({
      fechaDesde,
      fechaHasta,
      tipo,
      concepto,
      formaPago,
      contratoId: contratoId ? parseInt(contratoId) : undefined,
    });
  }

  @Get('stats')
  stats() {
    return this.svc.stats();
  }

  @Get('cuentas-por-cobrar')
  cuentasPorCobrar() {
    return this.svc.cuentasPorCobrar();
  }

  @Post()
  create(@Body() body: {
    tipo: TipoMovimiento;
    concepto: ConceptoCaja;
    monto: number;
    descripcion?: string;
    forma_pago?: FormaPago;
    referencia?: string;
    contratoId?: number;
  }) {
    return this.svc.create(body);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
