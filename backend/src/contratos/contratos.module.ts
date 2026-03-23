import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service.js';
import { ContratosController } from './contratos.controller.js';

@Module({
  providers: [ContratosService],
  controllers: [ContratosController],
})
export class ContratosModule {}
