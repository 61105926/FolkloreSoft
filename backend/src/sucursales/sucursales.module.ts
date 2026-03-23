import { Module } from '@nestjs/common';
import { SucursalesService } from './sucursales.service.js';
import { SucursalesController } from './sucursales.controller.js';

@Module({
  providers: [SucursalesService],
  controllers: [SucursalesController],
  exports: [SucursalesService],
})
export class SucursalesModule {}
