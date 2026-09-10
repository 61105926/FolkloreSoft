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
  private bloquesPem(crudo: string | undefined): { etiqueta: string; cuerpo: string }[] {
    if (!crudo?.trim()) return [];
    const texto = crudo.replace(/\\n/g, '\n');
    const bloques: { etiqueta: string; cuerpo: string }[] = [];
    const re = /-----BEGIN ([^-]+?)-----([\s\S]*?)-----END \1-----/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(texto)) !== null) {
      bloques.push({ etiqueta: m[1].trim(), cuerpo: m[2] });
    }
    return bloques;
  }

  /**
   * Rearma un PEM que pasó por variables de entorno.
   *
   * Busca el bloque cuya etiqueta coincida con `esperada`, no el primero: es
   * común terminar con el certificado y la clave pegados en la misma variable,
   * y quedarse con el primero hacía que la clave nunca cargara.
   */
  private normalizarPem(crudo: string | undefined, esperada: 'PRIVATE KEY' | 'CERTIFICATE'): string | null {
    const bloques = this.bloquesPem(crudo);
    if (bloques.length === 0) {
      if (crudo?.trim()) this.log.warn('El PEM no tiene marcas BEGIN/END reconocibles');
      return null;
    }

    const elegido = bloques.find((b) => b.etiqueta.includes(esperada));
    if (!elegido) {
      this.log.warn(
        `Se esperaba un "${esperada}" y llegaron: ${bloques.map((b) => b.etiqueta).join(', ')}`,
      );
      return null;
    }
    if (bloques.length > 1) {
      this.log.warn(
        `La variable trae ${bloques.length} bloques PEM; se usa el "${elegido.etiqueta}"`,
      );
    }

    const cuerpo = elegido.cuerpo.replace(/[^A-Za-z0-9+/=]/g, '');
    if (!cuerpo) {
      this.log.warn(`El PEM ${elegido.etiqueta} quedó sin contenido tras limpiarlo`);
      return null;
    }

    const lineas = cuerpo.match(/.{1,64}/g) ?? [];
    return `-----BEGIN ${elegido.etiqueta}-----\n${lineas.join('\n')}\n-----END ${elegido.etiqueta}-----\n`;
  }

  /** Certificado público que se le entrega a QZ. `null` si no está configurado. */
  get certificado(): string | null {
    return this.normalizarPem(process.env.QZ_CERTIFICATE, 'CERTIFICATE');
  }

  private get clavePrivada(): KeyObject | null {
    const pem = this.normalizarPem(process.env.QZ_PRIVATE_KEY, 'PRIVATE KEY');
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
  private inspeccionar(crudo: string | undefined, esperada: 'PRIVATE KEY' | 'CERTIFICATE'): {
    presente: boolean;
    etiqueta: string | null;
    caracteres: number;
    problema: string | null;
  } {
    if (!crudo?.trim()) {
      return { presente: false, etiqueta: null, caracteres: 0, problema: 'La variable está vacía o no existe' };
    }
    const bloques = this.bloquesPem(crudo);
    if (bloques.length === 0) {
      const abre = /-----BEGIN ([^-]+?)-----/.exec(crudo.replace(/\\n/g, '\n'));
      return {
        presente: true,
        etiqueta: abre?.[1]?.trim() ?? null,
        caracteres: crudo.length,
        problema: abre
          ? 'Falta la línea END: el valor llegó cortado'
          : 'No tiene las marcas BEGIN/END de un PEM',
      };
    }
    const elegido = bloques.find((b) => b.etiqueta.includes(esperada));
    return {
      presente: true,
      etiqueta: (elegido ?? bloques[0]).etiqueta,
      caracteres: crudo.length,
      problema: elegido
        ? (bloques.length > 1
            ? `La variable trae ${bloques.length} bloques PEM; se usa el "${elegido.etiqueta}"`
            : null)
        : `Se esperaba un "${esperada}" y llegó un "${bloques[0].etiqueta}"`,
    };
  }

  diagnostico() {
    const clave = this.inspeccionar(process.env.QZ_PRIVATE_KEY, 'PRIVATE KEY');
    const cert = this.inspeccionar(process.env.QZ_CERTIFICATE, 'CERTIFICATE');

    if (!clave.problema && !this.tieneClave) {
      clave.problema = 'El PEM está bien formado pero no se pudo leer como clave RSA';
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
