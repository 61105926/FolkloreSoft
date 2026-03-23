import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { CatalogoService } from './catalogo.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('catalogo')
export class CatalogoController {
  constructor(private readonly svc: CatalogoService) { }

  @Get('conjuntos') findAllConjuntos() { return this.svc.findAllConjuntos(); }
  @Get('conjuntos/:id') findConjunto(@Param('id', ParseIntPipe) id: number) { return this.svc.findConjunto(id); }
  @Post('conjuntos') createConjunto(@Body() body: any) { return this.svc.createConjunto(body); }
  @Patch('conjuntos/:id') updateConjunto(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateConjunto(id, body); }
  @Patch('conjuntos/:id/componentes') updateComponentes(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateComponentes(id, body.componentes ?? []); }
  @Delete('conjuntos/:id') removeConjunto(@Param('id', ParseIntPipe) id: number) { return this.svc.removeConjunto(id); }

  @Post('conjuntos/:id/variaciones') createVariacion(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.createVariacion(id, body); }
  @Patch('variaciones/:id') updateVariacion(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateVariacion(id, body); }
  @Delete('variaciones/:id') removeVariacion(@Param('id', ParseIntPipe) id: number) { return this.svc.removeVariacion(id); }

  @Get('componentes') findAllComponentes() { return this.svc.findAllComponentes(); }
  @Get('componentes/:id') findComponente(@Param('id', ParseIntPipe) id: number) { return this.svc.findComponente(id); }
  @Post('componentes') createComponente(@Body() body: any) { return this.svc.createComponente(body); }
  @Patch('componentes/:id') updateComponente(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.updateComponente(id, body); }
  @Delete('componentes/:id') removeComponente(@Param('id', ParseIntPipe) id: number) { return this.svc.removeComponente(id); }
}
