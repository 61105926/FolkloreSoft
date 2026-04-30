import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service.js';
import { VentasController } from './ventas.controller.js';

@Module({
  providers: [VentasService],
  controllers: [VentasController],
})
export class VentasModule {}
