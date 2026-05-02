import { Module } from '@nestjs/common';
import { VentasService } from './ventas.service.js';
import { VentasController } from './ventas.controller.js';
import { ClientesModule } from '../clientes/clientes.module.js';

@Module({
  imports: [ClientesModule],
  providers: [VentasService],
  controllers: [VentasController],
})
export class VentasModule {}
