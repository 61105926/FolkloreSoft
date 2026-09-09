import { Injectable, Logger } from '@nestjs/common';
import { createSign, createPrivateKey, type KeyObject } from 'node:crypto';

/**
 * Firma de peticiones para QZ Tray.
 *
 * Sin firma, QZ muestra «An anonymous request · Untrusted website» en cada
 * impresión y en 2.2 ya no ofrece recordar la decisión: el cajero termina
 * aceptando un diálogo por ticket.
 *
 * La clave privada vive acá y nunca sale del servidor: si estuviera en el
 * frontend, cualquiera la saca del bundle e imprime en nombre del negocio.
 *
 * Variables de entorno:
 *   QZ_PRIVATE_KEY  clave privada PEM (RSA)
 *   QZ_CERTIFICATE  certificado público PEM
 */
@Injectable()
export class QzService {
  private readonly log = new Logger(QzService.name);

  /**
   * Rearma un PEM que pasó por variables de entorno.
   *
   * Coolify aplasta el PEM a una línea reemplazando los saltos por espacios;
   * docker los deja como "\n" literales; pegarlo a mano mete tabs. OpenSSL
   * rechaza las tres sin decir cuál es el problema. En vez de contemplar cada
   * variante, se toman las marcas BEGIN/END, se limpia el cuerpo de todo lo
   * que no sea base64 y se rearma en líneas de 64.
   */
  private normalizarPem(crudo: string | undefined): string | null {
    if (!crudo?.trim()) return null;

    const texto = crudo.replace(/\\n/g, '\n');
    const marcas = texto.match(/-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/);
    if (!marcas) {
      this.log.warn('El PEM no tiene marcas BEGIN/END reconocibles');
      return null;
    }

    const etiqueta = marcas[1].trim();
    const cuerpo = marcas[2].replace(/[^A-Za-z0-9+/=]/g, '');
    if (!cuerpo) {
      this.log.warn(`El PEM ${etiqueta} quedó sin contenido tras limpiarlo`);
      return null;
    }

    const lineas = cuerpo.match(/.{1,64}/g) ?? [];
    return `-----BEGIN ${etiqueta}-----\n${lineas.join('\n')}\n-----END ${etiqueta}-----\n`;
  }

  /** Certificado público que se le entrega a QZ. `null` si no está configurado. */
  get certificado(): string | null {
    return this.normalizarPem(process.env.QZ_CERTIFICATE);
  }

  private get clavePrivada(): KeyObject | null {
    const pem = this.normalizarPem(process.env.QZ_PRIVATE_KEY);
    if (!pem) return null;
    try {
      return createPrivateKey(pem);
    } catch (e) {
      this.log.error(`No se pudo leer QZ_PRIVATE_KEY: ${e instanceof Error ? e.message : e}`);
      return null;
    }
  }

  get configurado(): boolean {
    return this.certificado !== null && this.clavePrivada !== null;
  }

  /**
   * Firma el payload que manda QZ. Devuelve `null` si no hay clave: el frontend
   * resuelve la promesa vacía y QZ sigue en modo anónimo (con su diálogo) en vez
   * de abortar la impresión.
   */
  firmar(datos: string): string | null {
    const clave = this.clavePrivada;
    if (!clave) return null;
    try {
      return createSign('SHA512').update(datos).sign(clave, 'base64');
    } catch (e) {
      this.log.error(`Falló la firma para QZ: ${e instanceof Error ? e.message : e}`);
      return null;
    }
  }
}
