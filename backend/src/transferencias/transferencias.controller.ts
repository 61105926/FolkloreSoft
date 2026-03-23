import { Controller, Get, Post, Patch, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly svc: TransferenciasService) {}

  @Get()
  findAll() {
    return this.svc.findAll();
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.svc.findOne(id);
  }

  @Post()
  create(
    @Body() body: {
      instanciaConjuntoId: number;
      sucursalOrigenId: number;
      sucursalDestinoId: number;
      notas?: string;
    },
  ) {
    return this.svc.create(body);
  }

  @Patch(':id/en-transito')
  marcarEnTransito(@Param('id', ParseIntPipe) id: number) {
    return this.svc.marcarEnTransito(id);
  }

  @Patch(':id/recibir')
  recibir(@Param('id', ParseIntPipe) id: number) {
    return this.svc.recibir(id);
  }
}
