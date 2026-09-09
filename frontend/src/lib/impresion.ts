/**
 * Impresión de tickets térmicos.
 *
 * Dos modos:
 *  - "navegador": abre una ventana y dispara el diálogo de impresión (comportamiento histórico).
 *  - "qz": manda el ticket directo a la impresora vía QZ Tray, sin diálogo. Permite además
 *    sacar el comprobante y la comanda por impresoras distintas (caja / bodega).
 *
 * La configuración vive en localStorage porque las impresoras son de cada máquina,
 * no del usuario ni de la sucursal.
 */

export type TipoTicket = "comprobante" | "comanda";

export interface Ticket {
  tipo: TipoTicket;
  /** HTML del cuerpo del ticket, sin <html> ni <style>: los agrega el envoltorio. */
  cuerpo: string;
  /**
   * Mismo ticket en ESC/POS. Se usa cuando se imprime por QZ en modo raw, que
   * es lo único que puede cortar el papel entre el comprobante y la comanda.
   */
  escpos?: string;
}

export type ModoImpresion = "navegador" | "qz";

export interface ConfigImpresion {
  modo: ModoImpresion;
  impresoraComprobante: string | null;
  impresoraComanda: string | null;
  /** Ancho del papel en mm (80 o 58 en las térmicas habituales). */
  anchoMm: number;
  copiasComprobante: number;
  copiasComanda: number;
  /** Imprimir la comanda de bodega junto al comprobante. */
  comandaActiva: boolean;
  /**
   * Densidad de la impresora en DPI. Sólo aplica en modo QZ: es la resolución
   * con la que se rasteriza el HTML. Si no se manda, muchos drivers reportan
   * "Normal" y QZ cae a 72 DPI, que sale fino y borroso. Las térmicas de 80mm
   * son 203 DPI casi siempre.
   */
  dpi: number;
  /**
   * Rasterizar el ticket antes de mandarlo. Con true el resultado es idéntico
   * en cualquier driver; con false lo dibuja el driver, que en algunas
   * impresoras da texto más nítido.
   */
  rasterizar: boolean;
  /**
   * Cómo se manda el ticket cuando se imprime por QZ.
   *  - "escpos": comandos crudos. Sale nítido en cualquier térmica y corta el
   *    papel entre tickets. Requiere una impresora compatible con ESC/POS.
   *  - "html": se rasteriza el mismo HTML de la vista previa. Sirve para
   *    impresoras que no son térmicas.
   */
  formatoQz: "escpos" | "html";
}

export const CONFIG_IMPRESION_DEFAULT: ConfigImpresion = {
  modo: "navegador",
  impresoraComprobante: null,
  impresoraComanda: null,
  anchoMm: 80,
  copiasComprobante: 1,
  copiasComanda: 1,
  comandaActiva: true,
  dpi: 203,
  rasterizar: true,
  formatoQz: "escpos",
};

const STORAGE_KEY = "folkloresoft.impresion";

function parsear(raw: string | null): ConfigImpresion {
  if (!raw) return CONFIG_IMPRESION_DEFAULT;
  try {
    return { ...CONFIG_IMPRESION_DEFAULT, ...(JSON.parse(raw) as Partial<ConfigImpresion>) };
  } catch {
    return CONFIG_IMPRESION_DEFAULT;
  }
}

export function leerConfigImpresion(): ConfigImpresion {
  if (typeof window === "undefined") return CONFIG_IMPRESION_DEFAULT;
  try {
    return parsear(window.localStorage.getItem(STORAGE_KEY));
  } catch {
    return CONFIG_IMPRESION_DEFAULT;
  }
}

// ── Store para useSyncExternalStore ──────────────────────────────────────────
// localStorage es un store externo: la UI se suscribe en vez de copiarlo a estado.

const oyentes = new Set<() => void>();
let crudoCache: string | null = null;
let configCache: ConfigImpresion = CONFIG_IMPRESION_DEFAULT;

/** Se suscribe a cambios de la config, propios y de otras pestañas. */
export function suscribirConfigImpresion(alCambiar: () => void): () => void {
  oyentes.add(alCambiar);
  window.addEventListener("storage", alCambiar);
  return () => {
    oyentes.delete(alCambiar);
    window.removeEventListener("storage", alCambiar);
  };
}

/** Devuelve la misma referencia mientras el contenido no cambie (lo exige React). */
export function snapshotConfigImpresion(): ConfigImpresion {
  let crudo: string | null = null;
  try {
    crudo = window.localStorage.getItem(STORAGE_KEY);
  } catch {
    crudo = null;
  }
  if (crudo !== crudoCache) {
    crudoCache = crudo;
    configCache = parsear(crudo);
  }
  return configCache;
}

export function snapshotConfigImpresionServidor(): ConfigImpresion {
  return CONFIG_IMPRESION_DEFAULT;
}

export function guardarConfigImpresion(config: ConfigImpresion) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
  } catch {
    /* modo incógnito o storage bloqueado: se sigue con los valores por defecto */
  }
  oyentes.forEach((cb) => cb());
}

// ── Documento ─────────────────────────────────────────────────────────────────

/**
 * Estilos compartidos por comprobante y comanda.
 *
 * En modo QZ el cuerpo tiene que medir exactamente el ancho del papel: QZ ya
 * imprime con margen 0 y sin escalar, así que cualquier diferencia entre el
 * ancho del body y el de la página termina en un reescalado que adelgaza el
 * texto. El margen físico se hace con padding.
 */
function estilosTicket(anchoMm: number, paraQz = false): string {
  const util = Math.max(40, anchoMm - 8);
  const cuerpo = paraQz
    ? `width: ${anchoMm}mm; padding: 0 3mm;`
    : `width: ${util}mm; padding: 0;`;
  return `
    @page { size: ${anchoMm}mm auto; margin: ${paraQz ? "0" : "4mm"}; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; color: #000; margin: 0; ${cuerpo} }
    h2 { font-size: 12px; font-weight: 900; margin: 9px 0 3px; border-bottom: 2px solid #000; padding-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; }
    td, th { font-weight: 900; }
    .center { text-align: center; }
    .divider { border: none; border-top: 2px dashed #000; margin: 6px 0; }
    .firma { border-top: 2px solid #000; padding-top: 4px; text-align: center; font-size: 10px; font-weight: 900; }
    /* Cada ticket es una página: la térmica corta al terminar cada una */
    .ticket { page-break-after: always; break-after: page; }
    .ticket:last-child { page-break-after: auto; break-after: auto; }
    /* Papel en blanco para que el corte no se coma la última línea */
    .feed { height: 14mm; }
    @media screen {
      body { width: ${anchoMm}mm; padding: 8px; margin: 16px auto; }
      .ticket { border: 1px dashed #ccc; padding: 8px; margin-bottom: 16px; }
      .feed { height: 0; }
    }`;
}

/** Envuelve uno o más tickets en un documento HTML completo. */
function documentoTickets(tickets: Ticket[], titulo: string, anchoMm: number, paraQz = false): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>${titulo}</title>
<style>${estilosTicket(anchoMm, paraQz)}</style>
</head><body>
${tickets.map((t) => `<div class="ticket">${t.cuerpo}</div>`).join("\n")}
</body></html>`;
}

// ── QZ Tray ───────────────────────────────────────────────────────────────────

/* eslint-disable @typescript-eslint/no-explicit-any */
type QzApi = any;

let qzCache: QzApi | null = null;

/** Carga qz-tray sólo en el navegador (la librería toca WebSocket al conectar). */
async function cargarQz(): Promise<QzApi> {
  if (typeof window === "undefined") throw new Error("QZ Tray sólo funciona en el navegador");
  if (qzCache) return qzCache;
  const mod = await import("qz-tray");
  qzCache = (mod as { default?: QzApi }).default ?? mod;
  return qzCache;
}

// ── Firma ─────────────────────────────────────────────────────────────────────
// Sin firma QZ trata cada trabajo como anónimo y pide autorización en cada
// ticket. La clave privada vive en el backend; acá sólo se piden el certificado
// y la firma de cada payload.

/**
 * Rutas propias del frontend. No se usa /api/backend porque ese proxy sólo
 * reenvía el Authorization que le mande el cliente, y acá no tenemos el token:
 * /api/qz lo saca de la cookie del lado del servidor.
 */
const API = "/api/qz";

let certificadoCache: string | null | undefined;

async function pedirCertificado(): Promise<string> {
  if (certificadoCache !== undefined) return certificadoCache ?? "";
  try {
    const res = await fetch(`${API}/certificate`);
    const data = res.ok ? ((await res.json()) as { certificado?: string }) : null;
    certificadoCache = data?.certificado?.trim() || null;
  } catch {
    certificadoCache = null;
  }
  return certificadoCache ?? "";
}

async function pedirFirma(datos: string): Promise<string> {
  try {
    const res = await fetch(`${API}/sign`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ data: datos }),
    });
    if (!res.ok) return "";
    const data = (await res.json()) as { firma?: string };
    return data.firma ?? "";
  } catch {
    return "";
  }
}

let firmaConfigurada = false;

function configurarFirma(qz: QzApi) {
  if (firmaConfigurada) return;
  firmaConfigurada = true;

  qz.security.setSignatureAlgorithm("SHA512");

  // Resolver vacío (no rechazar) es lo que le dice a QZ «este pedido va sin
  // firma». Rechazar lo toma como error de firma y aborta sin preguntar nada.
  qz.security.setCertificatePromise((resolve: (v: string) => void) => {
    void pedirCertificado().then(resolve);
  });

  qz.security.setSignaturePromise((datos: string) =>
    (resolve: (v: string) => void) => {
      void pedirFirma(datos).then(resolve);
    });
}

/** Mensaje accionable en vez del críptico de la librería. */
function errorConexion(e: unknown): Error {
  const detalle = e instanceof Error ? e.message : String(e);
  if (/unable to establish|connection|websocket/i.test(detalle)) {
    return new Error(
      "No se pudo conectar con QZ Tray. Si el programa está abierto, entrá una vez a " +
      "https://localhost:8181 en este navegador y aceptá la advertencia de seguridad: " +
      "el certificado de QZ para localhost no viene aceptado de fábrica.",
    );
  }
  return new Error(detalle);
}

/** Abre la conexión con QZ Tray si todavía no está abierta. */
export async function conectarQz(): Promise<QzApi> {
  const qz = await cargarQz();
  configurarFirma(qz);
  if (!qz.websocket.isActive()) {
    try {
      // retries:1 porque QZ recorre 8 puertos antes de rendirse; con 0 la
      // primera negativa cortaba el barrido.
      await qz.websocket.connect({ retries: 1, delay: 1 });
    } catch (e) {
      throw errorConexion(e);
    }
  }
  return qz;
}

export interface EstadoFirma {
  /** Certificado y clave presentes: las peticiones salen firmadas. */
  configurado: boolean;
  /** Sólo el certificado. Alcanza para bajar el override.crt. */
  certificado: boolean;
  clave: boolean;
}

export async function estadoFirma(): Promise<EstadoFirma> {
  try {
    const res = await fetch(`${API}/estado`);
    if (!res.ok) return { configurado: false, certificado: false, clave: false };
    const d = (await res.json()) as Partial<EstadoFirma>;
    return {
      configurado: d.configurado === true,
      certificado: d.certificado === true,
      clave: d.clave === true,
    };
  } catch {
    return { configurado: false, certificado: false, clave: false };
  }
}

export async function listarImpresoras(): Promise<string[]> {
  const qz = await conectarQz();
  const encontradas = await qz.printers.find();
  return Array.isArray(encontradas) ? encontradas : [encontradas];
}

export async function impresoraPorDefecto(): Promise<string | null> {
  try {
    const qz = await conectarQz();
    return (await qz.printers.getDefault()) ?? null;
  } catch {
    return null;
  }
}

function impresoraDe(config: ConfigImpresion, tipo: TipoTicket): string | null {
  return tipo === "comanda"
    ? config.impresoraComanda ?? config.impresoraComprobante
    : config.impresoraComprobante;
}

function copiasDe(config: ConfigImpresion, tipo: TipoTicket): number {
  const n = tipo === "comanda" ? config.copiasComanda : config.copiasComprobante;
  return Math.max(1, Math.min(5, Math.round(n) || 1));
}

async function imprimirConQz(tickets: Ticket[], titulo: string, config: ConfigImpresion) {
  const qz = await conectarQz();

  for (const ticket of tickets) {
    const impresora = impresoraDe(config, ticket.tipo);
    if (!impresora) throw new Error(`No hay impresora configurada para el ${ticket.tipo}`);

    const copias = copiasDe(config, ticket.tipo);

    // Camino ESC/POS: comandos crudos, sin driver de por medio. Es lo único que
    // corta el papel entre el comprobante y la comanda.
    if (config.formatoQz === "escpos" && ticket.escpos) {
      const cfg = qz.configs.create(impresora, {
        copies: copias,
        jobName: `${titulo} · ${ticket.tipo}`,
      });
      await qz.print(cfg, [{
        type: "raw",
        format: "command",
        flavor: "plain",
        data: ticket.escpos,
      }]);
      continue;
    }

    const dpi = Math.max(72, Math.round(config.dpi) || 203);
    const cfg = qz.configs.create(impresora, {
      units: "mm",
      size: { width: config.anchoMm, height: null },
      margins: 0,
      // El HTML ya viene del ancho exacto del papel: escalarlo sólo lo deforma
      scaleContent: false,
      rasterize: config.rasterizar,
      // En mm la densidad se expresa en puntos por mm
      density: dpi / 25.4,
      fallbackDensity: dpi / 25.4,
      interpolation: "nearest-neighbor",
      colorType: "blackwhite",
      copies: copias,
      jobName: `${titulo} · ${ticket.tipo}`,
    });

    await qz.print(cfg, [{
      type: "pixel",
      format: "html",
      flavor: "plain",
      data: documentoTickets([ticket], titulo, config.anchoMm, true),
    }]);
  }
}

function imprimirConNavegador(tickets: Ticket[], titulo: string, config: ConfigImpresion) {
  const win = window.open("", "_blank", "width=420,height=800");
  if (!win) return;
  win.document.write(documentoTickets(tickets, titulo, config.anchoMm));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

export interface ResultadoImpresion {
  modo: ModoImpresion;
  /** Mensaje de error si QZ falló y se cayó al diálogo del navegador. */
  aviso?: string;
}

/**
 * Manda los tickets a imprimir según la configuración de la máquina.
 * Si QZ Tray está configurado pero no responde, cae al diálogo del navegador
 * en vez de dejar al usuario sin ticket.
 */
export async function imprimirTickets(
  tickets: Ticket[],
  titulo: string,
  config: ConfigImpresion = leerConfigImpresion(),
): Promise<ResultadoImpresion> {
  if (tickets.length === 0) return { modo: config.modo };

  if (config.modo === "qz") {
    try {
      await imprimirConQz(tickets, titulo, config);
      return { modo: "qz" };
    } catch (e) {
      const detalle = e instanceof Error ? e.message : String(e);
      imprimirConNavegador(tickets, titulo, config);
      return { modo: "navegador", aviso: `No se pudo imprimir con QZ Tray (${detalle}). Se abrió el diálogo del navegador.` };
    }
  }

  imprimirConNavegador(tickets, titulo, config);
  return { modo: "navegador" };
}
