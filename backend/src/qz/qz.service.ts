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

  get tieneClave(): boolean {
    return this.clavePrivada !== null;
  }

  /**
   * Qué llegó en cada variable, sin exponer el contenido.
   *
   * La etiqueta del PEM es suficiente para detectar el error más común: pegar
   * el certificado en las dos variables. Ahí QZ_PRIVATE_KEY dice CERTIFICATE
   * en vez de PRIVATE KEY y no hay forma de darse cuenta mirando la pantalla.
   */
  private inspeccionar(crudo: string | undefined): {
    presente: boolean;
    etiqueta: string | null;
    caracteres: number;
    problema: string | null;
  } {
    if (!crudo?.trim()) {
      return { presente: false, etiqueta: null, caracteres: 0, problema: 'La variable está vacía o no existe' };
    }
    const texto = crudo.replace(/\\n/g, '\n');
    const marcas = texto.match(/-----BEGIN ([^-]+)-----([\s\S]*?)-----END \1-----/);
    if (!marcas) {
      const abre = /-----BEGIN ([^-]+)-----/.exec(texto);
      return {
        presente: true,
        etiqueta: abre?.[1]?.trim() ?? null,
        caracteres: crudo.length,
        problema: abre
          ? 'Falta la línea END: el valor llegó cortado'
          : 'No tiene las marcas BEGIN/END de un PEM',
      };
    }
    return {
      presente: true,
      etiqueta: marcas[1].trim(),
      caracteres: crudo.length,
      problema: null,
    };
  }

  diagnostico() {
    const clave = this.inspeccionar(process.env.QZ_PRIVATE_KEY);
    const cert = this.inspeccionar(process.env.QZ_CERTIFICATE);

    if (!clave.problema && clave.etiqueta && !/PRIVATE KEY/.test(clave.etiqueta)) {
      clave.problema = `Se esperaba una clave privada y llegó un "${clave.etiqueta}"`;
    } else if (!clave.problema && !this.tieneClave) {
      clave.problema = 'El PEM está bien formado pero no se pudo leer como clave RSA';
    }
    if (!cert.problema && cert.etiqueta && !/CERTIFICATE/.test(cert.etiqueta)) {
      cert.problema = `Se esperaba un certificado y llegó un "${cert.etiqueta}"`;
    }

    return { clave, certificado: cert };
  }

  get configurado(): boolean {
    return this.certificado !== null && this.tieneClave;
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
