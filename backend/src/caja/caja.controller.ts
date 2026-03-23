import { Controller, Get, Post, Delete, Param, Body, Query, ParseIntPipe, UseGuards, Req, ForbiddenException } from '@nestjs/common';
import { Request } from 'express';
import { CajaService } from './caja.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { TipoMovimiento, ConceptoCaja, FormaPago } from '@prisma/client';

interface AuthUser {
  id: number;
  email: string;
  nombre: string;
  rol: string;
  sucursalId: number | null;
}

@UseGuards(JwtAuthGuard)
@Controller('caja')
export class CajaController {
  constructor(private readonly svc: CajaService) {}

  @Get()
  findAll(
    @Req() req: Request & { user: AuthUser },
    @Query('fechaDesde') fechaDesde?: string,
    @Query('fechaHasta') fechaHasta?: string,
    @Query('tipo') tipo?: TipoMovimiento,
    @Query('concepto') concepto?: ConceptoCaja,
    @Query('formaPago') formaPago?: FormaPago,
    @Query('contratoId') contratoId?: string,
  ) {
    const { id, rol, sucursalId } = req.user;
    const isAdmin = rol === 'ADMIN';
    return this.svc.findAll({
      fechaDesde,
      fechaHasta,
      tipo,
      concepto,
      formaPago,
      contratoId: contratoId ? parseInt(contratoId) : undefined,
      isAdmin,
      userId: isAdmin ? undefined : id,
      sucursalId: isAdmin ? undefined : (sucursalId ?? undefined),
    });
  }

  @Get('stats')
  stats(@Req() req: Request & { user: AuthUser }) {
    const { id, rol, sucursalId } = req.user;
    const isAdmin = rol === 'ADMIN';
    return this.svc.stats({
      isAdmin,
      userId: isAdmin ? undefined : id,
      sucursalId: isAdmin ? undefined : (sucursalId ?? undefined),
    });
  }

  @Get('cuentas-por-cobrar')
  cuentasPorCobrar() {
    return this.svc.cuentasPorCobrar();
  }

  @Post('recalcular-pagados')
  recalcularPagados(@Req() req: Request & { user: AuthUser }) {
    if (req.user.rol !== 'ADMIN') throw new ForbiddenException('Solo administradores');
    return this.svc.recalcularTodosPagados();
  }

  @Post()
  create(
    @Req() req: Request & { user: AuthUser },
    @Body() body: {
      tipo: TipoMovimiento;
      concepto: ConceptoCaja;
      monto: number;
      descripcion?: string;
      forma_pago?: FormaPago;
      referencia?: string;
      contratoId?: number;
    },
  ) {
    return this.svc.create({
      ...body,
      userId: req.user.id,
      sucursalId: req.user.sucursalId ?? undefined,
    });
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.svc.remove(id);
  }
}
