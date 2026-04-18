import { Controller, UseGuards } from '@nestjs/common';
import { TransferenciasService } from './transferencias.service.js';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';

@UseGuards(JwtAuthGuard)
@Controller('transferencias')
export class TransferenciasController {
  constructor(private readonly svc: TransferenciasService) {}
}
