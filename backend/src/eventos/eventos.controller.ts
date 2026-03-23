import { Controller, Get, Post, Patch, Delete, Param, Body, ParseIntPipe, UseGuards } from '@nestjs/common';
import { EventosService } from './eventos.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('eventos')
export class EventosController {
  constructor(private readonly svc: EventosService) {}

  @Get()      findAll() { return this.svc.findAll(); }
  @Get(':id') findOne(@Param('id', ParseIntPipe) id: number) { return this.svc.findOne(id); }
  @Post()     create(@Body() body: any) { return this.svc.create(body); }
  @Patch(':id') update(@Param('id', ParseIntPipe) id: number, @Body() body: any) { return this.svc.update(id, body); }
  @Delete(':id') remove(@Param('id', ParseIntPipe) id: number) { return this.svc.remove(id); }
}
