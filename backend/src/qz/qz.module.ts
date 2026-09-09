import { Module } from '@nestjs/common';
import { QzController } from './qz.controller.js';
import { QzService } from './qz.service.js';

@Module({
  controllers: [QzController],
  providers: [QzService],
})
export class QzModule {}
