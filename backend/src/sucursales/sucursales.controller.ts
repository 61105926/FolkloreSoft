import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { SucursalesService } from './sucursales.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { RolesGuard } from '../auth/roles.guard.js';
import { Roles } from '../auth/roles.decorator.js';

@UseGuards(JwtAuthGuard)
@Controller('sucursales')
export class SucursalesController {
  constructor(private readonly svc: SucursalesService) {}

  @Get()      findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }

  @UseGuards(RolesGuard) @Roles('SUPERADMIN')
  @Post()
  create(@Body() body: { nombre: string; ciudad: string; direccion?: string }) { return this.svc.create(body); }

  @UseGuards(RolesGuard) @Roles('SUPERADMIN')
  @Patch(':id')
  update(@Param('id', ParseIntPipe) id: number, @Body() body: { nombre?: string; ciudad?: string; direccion?: string }) { return this.svc.update(id, body); }

  @UseGuards(RolesGuard) @Roles('SUPERADMIN')
  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
