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
}

export const CONFIG_IMPRESION_DEFAULT: ConfigImpresion = {
  modo: "navegador",
  impresoraComprobante: null,
  impresoraComanda: null,
  anchoMm: 80,
  copiasComprobante: 1,
  copiasComanda: 1,
  comandaActiva: true,
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

/** Estilos compartidos por comprobante y comanda, en ambos modos de impresión. */
function estilosTicket(anchoMm: number): string {
  const util = Math.max(40, anchoMm - 8);
  return `
    @page { size: ${anchoMm}mm auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; color: #000; margin: 0; padding: 0; width: ${util}mm; }
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
function documentoTickets(tickets: Ticket[], titulo: string, anchoMm: number): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
<title>${titulo}</title>
<style>${estilosTicket(anchoMm)}</style>
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

/** Abre la conexión con QZ Tray si todavía no está abierta. */
export async function conectarQz(): Promise<QzApi> {
  const qz = await cargarQz();
  if (!qz.websocket.isActive()) {
    await qz.websocket.connect({ retries: 1, delay: 1 });
  }
  return qz;
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

    const cfg = qz.configs.create(impresora, {
      units: "mm",
      size: { width: config.anchoMm, height: null },
      margins: 0,
      scaleContent: true,
      rasterize: true,
      copies: copiasDe(config, ticket.tipo),
      jobName: `${titulo} · ${ticket.tipo}`,
    });

    await qz.print(cfg, [{
      type: "pixel",
      format: "html",
      flavor: "plain",
      data: documentoTickets([ticket], titulo, config.anchoMm),
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
