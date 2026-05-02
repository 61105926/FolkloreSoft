import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards, Req } from '@nestjs/common';
import { VentasService } from './ventas.service.js';
import { ClientesService } from '../clientes/clientes.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('ventas')
export class VentasController {
  constructor(
    private readonly svc: VentasService,
    private readonly clientes: ClientesService,
  ) {}

  @Post('clientes') crearCliente(@Body() body: any) { return this.clientes.create(body); }

  @Get()     findAll(@Req() req: any) { return this.svc.findAll({ isAdmin: ['ADMIN','SUPERADMIN'].includes(req.user.rol), sucursalId: req.user.sucursalId ?? undefined }); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()    create(@Body() body: any, @Req() req: any) { return this.svc.create(body, req.user); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }

  @Patch(':id/pagar')    pagar(@Param('id', ParseIntPipe) id: number, @Body() body: any, @Req() req: any) { return this.svc.registrarPago(id, body, req.user); }
  @Patch(':id/entregar') entregar(@Param('id', ParseIntPipe) id: number) { return this.svc.entregar(id); }
  @Patch(':id/cancelar') cancelar(@Param('id', ParseIntPipe) id: number) { return this.svc.cancelar(id); }
}
