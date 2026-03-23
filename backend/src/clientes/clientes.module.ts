import { Module } from '@nestjs/common';
import { ClientesService } from './clientes.service.js';
import { ClientesController } from './clientes.controller.js';

@Module({
  providers: [ClientesService],
  controllers: [ClientesController],
  exports: [ClientesService],
})
export class ClientesModule {}
