import { Module } from '@nestjs/common';
import { CatalogoService } from './catalogo.service.js';
import { CatalogoController } from './catalogo.controller.js';
import { ImagenAutoService } from './imagen-auto.service.js';

@Module({
  providers: [CatalogoService, ImagenAutoService],
  controllers: [CatalogoController],
  exports: [CatalogoService],
})
export class CatalogoModule {}
