import { Module } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service.js';
import { TransferenciasController } from './transferencias.controller.js';

@Module({
  providers: [TransferenciasService],
  controllers: [TransferenciasController],
  exports: [TransferenciasService],
})
export class TransferenciasModule {}
