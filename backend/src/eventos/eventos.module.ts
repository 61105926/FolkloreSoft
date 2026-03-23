import { Module } from '@nestjs/common';
import { EventosService } from './eventos.service.js';
import { EventosController } from './eventos.controller.js';

@Module({
  providers: [EventosService],
  controllers: [EventosController],
})
export class EventosModule {}
