/**
 * Generación de tickets en ESC/POS.
 *
 * Rasterizar HTML deja el ticket a merced del driver y no permite cortar el
 * papel a mitad del trabajo. ESC/POS es texto plano con secuencias de escape
 * que la impresora interpreta como comandos: negrita, tamaño, avance y corte.
 * Por eso el comprobante y la comanda pueden salir separados sin que nadie
 * corte a mano.
 */

const ESC = "\x1B";
const GS = "\x1D";

export const CMD = {
  init: `${ESC}@`,
  negritaOn: `${ESC}E1`,
  negritaOff: `${ESC}E0`,
  centro: `${ESC}a1`,
  izquierda: `${ESC}a0`,
  derecha: `${ESC}a2`,
  /** Alto y ancho doble. */
  grande: `${GS}!\x11`,
  /** Sólo alto doble: entra el doble de texto que con `grande`. */
  alto: `${GS}!\x01`,
  normal: `${GS}!\x00`,
  /** Avanza n líneas. Sin esto el corte cae encima del texto. */
  avanzar: (n: number) => `${ESC}d${String.fromCharCode(Math.max(0, Math.min(255, n)))}`,
  /** Corte parcial: deja una uñita para que el ticket no se caiga al piso. */
  cortar: `${GS}V\x42\x00`,
  abrirCajon: `${ESC}p\x00\x19\xFA`,
};

/** Columnas por ancho de papel en fuente A. */
export function columnas(anchoMm: number): number {
  return anchoMm >= 80 ? 48 : 32;
}

/**
 * Transliteración a ASCII.
 *
 * Estas impresoras usan CP437 o CP850 según el modelo, no UTF-8: los acentos y
 * las comillas tipográficas salen como símbolos sueltos en medio de una palabra.
 * Sale más barato mandar «Cafe» que pelear con la tabla de códigos de cada
 * modelo.
 */
export function aAscii(texto: string): string {
  const mapa: Record<string, string> = {
    á: "a", é: "e", í: "i", ó: "o", ú: "u", ü: "u", ñ: "n",
    Á: "A", É: "E", Í: "I", Ó: "O", Ú: "U", Ü: "U", Ñ: "N",
    à: "a", è: "e", ì: "i", ò: "o", ù: "u", ç: "c", Ç: "C",
    "°": "o", "º": "o", "ª": "a", "€": "EUR",
    "‘": "'", "’": "'", "“": '"', "”": '"',
    "–": "-", "—": "-", "…": "...",
    "«": '"', "»": '"', "¿": "?", "¡": "!",
    " ": " ", "✓": "OK", "−": "-", "·": "-",
  };
  return texto
    .replace(/[^\x20-\x7E\n]/g, (c) => mapa[c] ?? "?")
    .replace(/\?+/g, (m) => (m.length > 3 ? "" : m));
}

/** Corta o rellena a un ancho exacto. */
function ajustar(texto: string, ancho: number): string {
  return texto.length > ancho ? texto.slice(0, ancho) : texto.padEnd(ancho);
}

/**
 * Envuelve por palabras. El nombre de un producto que ocupa 30 de 48 columnas
 * deja 18 para el precio; sin envolver, lo que sobra se corta en seco.
 */
export function envolver(texto: string, ancho: number): string[] {
  const palabras = texto.split(/\s+/).filter(Boolean);
  if (palabras.length === 0) return [""];
  const lineas: string[] = [];
  let actual = "";
  for (const palabra of palabras) {
    if (palabra.length > ancho) {
      if (actual) { lineas.push(actual); actual = ""; }
      for (let i = 0; i < palabra.length; i += ancho) lineas.push(palabra.slice(i, i + ancho));
      continue;
    }
    if (!actual) actual = palabra;
    else if (actual.length + 1 + palabra.length <= ancho) actual += ` ${palabra}`;
    else { lineas.push(actual); actual = palabra; }
  }
  if (actual) lineas.push(actual);
  return lineas;
}

/** Constructor de ticket: acumula líneas ya transliteradas. */
export class TicketEscPos {
  private partes: string[] = [];

  constructor(private readonly ancho: number) {}

  get columnas(): number {
    return this.ancho;
  }

  crudo(comando: string): this {
    this.partes.push(comando);
    return this;
  }

  /** Una línea de texto libre, envuelta al ancho del papel. */
  linea(texto = ""): this {
    if (!texto) { this.partes.push("\n"); return this; }
    for (const l of envolver(aAscii(texto), this.ancho)) this.partes.push(`${l}\n`);
    return this;
  }

  /** Sub-línea indentada. `linea()` no sirve: envolver() come los espacios. */
  detalle(texto: string, sangria = 4): this {
    const margen = " ".repeat(sangria);
    for (const l of envolver(aAscii(texto), this.ancho - sangria)) {
      this.partes.push(`${margen}${l}\n`);
    }
    return this;
  }

  /**
   * Como `par`, pero envolviendo la etiqueta en vez de cortarla. El nombre de
   * un producto que ocupa 30 de 48 columnas deja 18 para el precio; cortarlo
   * en seco pierde información que bodega necesita.
   */
  parEnvuelto(etiqueta: string, valor: string, negrita = false): this {
    const der = aAscii(valor);
    const primeraAncho = Math.max(8, this.ancho - der.length - 1);
    const lineas = envolver(aAscii(etiqueta), primeraAncho);
    if (negrita) this.partes.push(CMD.negritaOn);
    this.partes.push(`${ajustar(lineas[0], primeraAncho)} ${der}\n`);
    for (const resto of lineas.slice(1)) this.partes.push(`    ${resto}\n`);
    if (negrita) this.partes.push(CMD.negritaOff);
    return this;
  }

  centrada(texto: string, estilo?: { grande?: boolean; negrita?: boolean }): this {
    this.partes.push(CMD.centro);
    if (estilo?.grande) this.partes.push(CMD.grande);
    if (estilo?.negrita) this.partes.push(CMD.negritaOn);
    // Con ancho doble entra la mitad de texto
    const ancho = estilo?.grande ? Math.floor(this.ancho / 2) : this.ancho;
    for (const l of envolver(aAscii(texto), ancho)) this.partes.push(`${l}\n`);
    if (estilo?.negrita) this.partes.push(CMD.negritaOff);
    if (estilo?.grande) this.partes.push(CMD.normal);
    this.partes.push(CMD.izquierda);
    return this;
  }

  /** Etiqueta a la izquierda, valor pegado a la derecha. */
  par(etiqueta: string, valor: string, negrita = false): this {
    const izq = aAscii(etiqueta);
    const der = aAscii(valor);
    const espacio = this.ancho - der.length;
    const linea = espacio <= 0
      ? der.slice(0, this.ancho)
      : `${ajustar(izq, espacio - 1)} ${der}`;
    if (negrita) this.partes.push(CMD.negritaOn);
    this.partes.push(`${linea}\n`);
    if (negrita) this.partes.push(CMD.negritaOff);
    return this;
  }

  /** Fila de ítem: descripción envuelta arriba, cantidad y montos abajo. */
  item(descripcion: string, detalle: string, derecha: string): this {
    this.partes.push(CMD.negritaOn);
    for (const l of envolver(aAscii(descripcion), this.ancho)) this.partes.push(`${l}\n`);
    this.partes.push(CMD.negritaOff);
    if (detalle) for (const l of envolver(aAscii(detalle), this.ancho - 2)) this.partes.push(`  ${l}\n`);
    if (derecha) this.partes.push(`${aAscii(derecha).padStart(this.ancho)}\n`);
    return this;
  }

  separador(caracter = "-"): this {
    this.partes.push(`${caracter.repeat(this.ancho)}\n`);
    return this;
  }

  titulo(texto: string): this {
    this.partes.push(CMD.negritaOn);
    this.partes.push(`${aAscii(texto).toUpperCase()}\n`);
    this.partes.push(CMD.negritaOff);
    this.separador();
    return this;
  }

  /** Línea punteada para firmar. */
  firma(texto: string): this {
    this.linea();
    this.partes.push(CMD.centro);
    this.partes.push(`${"_".repeat(Math.min(this.ancho - 4, 30))}\n`);
    for (const l of envolver(aAscii(texto), this.ancho)) this.partes.push(`${l}\n`);
    this.partes.push(CMD.izquierda);
    return this;
  }

  /** Cierra el ticket: avanza papel y corta. */
  finalizar(): string {
    return CMD.init + this.partes.join("") + CMD.avanzar(4) + CMD.cortar;
  }
}
