import { Module } from '@nestjs/common';
import { ContratosService } from './contratos.service.js';
import { ContratosController } from './contratos.controller.js';
import { BotNotifyService } from './bot-notify.service.js';

@Module({
  providers: [ContratosService, BotNotifyService],
  controllers: [ContratosController],
})
export class ContratosModule {}
