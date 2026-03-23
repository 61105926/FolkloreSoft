import { Module } from '@nestjs/common';
import { CatalogoService } from './catalogo.service.js';
import { CatalogoController } from './catalogo.controller.js';

@Module({
  providers: [CatalogoService],
  controllers: [CatalogoController],
  exports: [CatalogoService],
})
export class CatalogoModule {}
