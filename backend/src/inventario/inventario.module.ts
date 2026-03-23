import { Module } from '@nestjs/common';
import { InventarioService } from './inventario.service.js';
import { InventarioController } from './inventario.controller.js';

@Module({
  providers: [InventarioService],
  controllers: [InventarioController],
  exports: [InventarioService],
})
export class InventarioModule {}
