import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard.js';
import { QzService } from './qz.service.js';

@UseGuards(JwtAuthGuard)
@Controller('qz')
export class QzController {
  constructor(private readonly svc: QzService) {}

  /** Estado de la configuración, para que la pantalla de ajustes sepa qué mostrar. */
  @Get('estado')
  estado() {
    return {
      configurado: this.svc.configurado,
      // Separados porque el override.crt se puede bajar apenas esté el
      // certificado, sin esperar a que también esté la clave privada
      certificado: this.svc.certificado !== null,
      clave: this.svc.tieneClave,
    };
  }

  /**
   * Certificado público. Cadena vacía cuando no está configurado: el frontend
   * resuelve la promesa vacía y QZ sigue funcionando en modo anónimo.
   */
  @Get('certificate')
  certificado() {
    return { certificado: this.svc.certificado ?? '' };
  }

  @Post('sign')
  firmar(@Body() body: { data?: string }) {
    return { firma: this.svc.firmar(body?.data ?? '') ?? '' };
  }
}
