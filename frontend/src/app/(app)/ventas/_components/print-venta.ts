import { imprimirTickets, leerConfigImpresion, type Ticket } from "@/lib/impresion";
import { columnas, TicketEscPos } from "@/lib/escpos";

export interface VentaItemImpresion {
  descripcion: string;
  cantidad: number;
  precio_unit: string | number;
  subtotal: string | number;
  conjunto?: { nombre: string; danza?: string } | null;
  variacion?: { nombre_variacion: string; talla?: string | null; color?: string | null } | null;
}

export interface VentaParaImprimir {
  codigo: string;
  createdAt: string;
  estado: string;
  cliente: { nombre: string; ci?: string | null; celular?: string | null };
  sucursal?: { nombre: string; direccion?: string | null; telefono?: string | null; email?: string | null } | null;
  items: VentaItemImpresion[];
  total: string | number;
  total_pagado: string | number;
  descuento?: string | number;
  forma_pago?: string | null;
  observaciones?: string | null;
}

function row(label: string, value: string, big = false, color = "") {
  return `<tr>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:${big ? "11" : "10"}px;font-weight:900">${label}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:${big ? "12" : "11"}px;font-weight:900${color ? `;color:${color}` : ""}">${value}</td>
  </tr>`;
}

const FORMA_PAGO_LABEL: Record<string, string> = {
  EFECTIVO: "Efectivo", TRANSFERENCIA: "Transferencia", QR: "QR", TARJETA: "Tarjeta",
};

const ESTADO_LABEL: Record<string, string> = {
  PENDIENTE: "Pendiente", PAGADO: "Pagado", ENTREGADO: "Entregado", CANCELADO: "Cancelado",
};

/** Encabezado con los datos de la sucursal, común a comprobante y comanda. */
function encabezado(v: VentaParaImprimir, titulo: string) {
  return `
  <div class="center" style="margin-bottom:4px">
    <div style="font-size:16px;font-weight:900;letter-spacing:0.05em">${v.sucursal?.nombre ?? "DANZA CON ALTURA"}</div>
    ${v.sucursal?.direccion ? `<div style="font-size:10px;font-weight:900">${v.sucursal.direccion}</div>` : `<div style="font-size:10px;font-weight:900">CALLE LOS ANDES #1090</div>`}
    ${v.sucursal?.telefono ? `<div style="font-size:10px;font-weight:900">Tel: ${v.sucursal.telefono}</div>` : `<div style="font-size:10px;font-weight:900">Tel: 75804700</div>`}
    ${v.sucursal?.email ? `<div style="font-size:10px;font-weight:900">${v.sucursal.email}</div>` : ""}
  </div>
  <hr class="divider">
  <div class="center" style="font-size:13px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;margin:5px 0">
    ${titulo}
  </div>
  <hr class="divider">`;
}

/** Nombre del modelo y su detalle (talla / color), sin precios. */
function detalleItem(it: VentaItemImpresion) {
  const modelo = it.conjunto?.nombre ?? it.descripcion.split(" — ")[0];
  const extras = [
    it.variacion?.nombre_variacion,
    it.variacion?.talla ? `T.${it.variacion.talla}` : null,
    it.variacion?.color,
  ].filter(Boolean).join(" · ");
  return { modelo, extras };
}

/**
 * Comanda de bodega: qué hay que preparar y entregar, sin precios ni datos de cobro.
 * Va como ticket aparte para que la térmica corte entre los dos.
 */
function comandaHtml(v: VentaParaImprimir) {
  const totalUnidades = v.items.reduce((s, it) => s + it.cantidad, 0);

  const filas = v.items.map((it) => {
    const { modelo, extras } = detalleItem(it);
    return `<tr>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;font-size:14px;font-weight:900;text-align:center;width:22px">[ ]</td>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;font-size:12px;font-weight:900">
        ${modelo}${extras ? `<br><span style="font-size:10px;font-weight:900">${extras}</span>` : ""}
      </td>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;text-align:right;font-size:18px;font-weight:900;width:34px">${it.cantidad}</td>
    </tr>`;
  }).join("");

  return `
    ${encabezado(v, "Comanda · Preparacion")}
    <table><tbody>
      ${row("N° Venta", v.codigo, true)}
      ${row("Cliente", v.cliente.nombre)}
      ${v.cliente.celular ? row("Celular", v.cliente.celular) : ""}
      ${row("Fecha", new Date(v.createdAt).toLocaleDateString("es-BO"), true)}
      ${row("Estado", ESTADO_LABEL[v.estado] ?? v.estado)}
    </tbody></table>

    <h2>Preparar</h2>
    <table><tbody>${filas || `<tr><td style="font-size:11px;font-weight:900;padding:6px 0">Sin items cargados</td></tr>`}</tbody></table>
    <table style="margin-top:4px"><tbody>
      ${row("Total unidades", String(totalUnidades), true)}
    </tbody></table>

    ${v.observaciones ? `<div style="font-size:11px;font-weight:900;line-height:1.4;margin-top:6px;border:2px solid #000;padding:4px"><span style="font-weight:900">OBS:</span> ${v.observaciones}</div>` : ""}

    <div class="firma" style="margin-top:24px">Preparado por</div>
    <div class="center" style="margin-top:6px;font-size:9px;font-weight:900">
      ${new Date().toLocaleString("es-BO")}
    </div>
    <div class="feed"></div>`;
}

/** Comprobante para el cliente: con precios, totales y firmas. */
function comprobanteHtml(v: VentaParaImprimir) {
  const saldo = Math.max(0, Number(v.total) - Number(v.total_pagado));
  const descuento = Number(v.descuento ?? 0);

  const filasItems = v.items.map((it) => `<tr>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:11px;font-weight:900">${it.descripcion}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:center;font-size:11px;font-weight:900">${it.cantidad}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:11px;font-weight:900">Bs.${Number(it.precio_unit).toFixed(0)}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:12px;font-weight:900">Bs.${Number(it.subtotal).toFixed(0)}</td>
  </tr>`).join("");

  return `
  ${encabezado(v, "Comprobante de Venta")}
  <table><tbody>
    ${row("N° Venta", v.codigo, true)}
    ${row("Fecha", new Date(v.createdAt).toLocaleDateString("es-BO"))}
    ${row("Estado", ESTADO_LABEL[v.estado] ?? v.estado)}
  </tbody></table>

  <!-- CLIENTE -->
  <h2>Cliente</h2>
  <table><tbody>
    ${row("Nombre", v.cliente.nombre, true)}
    ${v.cliente.ci ? row("CI", v.cliente.ci) : ""}
    ${v.cliente.celular ? row("Celular", v.cliente.celular) : ""}
  </tbody></table>

  <!-- ÍTEMS -->
  <h2>Ítems</h2>
  <table>
    <thead><tr>
      <th style="text-align:left;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Descripción</th>
      <th style="text-align:center;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Cant</th>
      <th style="text-align:right;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">P/u</th>
      <th style="text-align:right;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Sub</th>
    </tr></thead>
    <tbody>${filasItems}</tbody>
  </table>

  <!-- RESUMEN -->
  <h2>Resumen</h2>
  <table><tbody>
    ${descuento > 0 ? row("Subtotal", `Bs. ${(Number(v.total) + descuento).toFixed(2)}`) : ""}
    ${descuento > 0 ? row("Descuento", `−Bs. ${descuento.toFixed(2)}`) : ""}
    ${row("Total", `Bs. ${Number(v.total).toFixed(2)}`, true)}
    ${row("Total pagado", `Bs. ${Number(v.total_pagado).toFixed(2)}`)}
    ${v.forma_pago ? row("Forma de pago", FORMA_PAGO_LABEL[v.forma_pago] ?? v.forma_pago) : ""}
    ${saldo > 0.01 ? row("Saldo pendiente", `Bs. ${saldo.toFixed(2)}`, true, "#dc2626") : row("", "✓ Pagado completo", false, "#000")}
  </tbody></table>

  ${v.observaciones ? `
  <h2>Observaciones</h2>
  <div style="font-size:10px;font-weight:900;line-height:1.4">
    <p style="margin:2px 0">${v.observaciones}</p>
  </div>` : ""}

  <hr class="divider" style="margin-top:14px">
  <div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px">
    <div class="firma" style="flex:1">Firma cliente<br><span style="font-weight:900">${v.cliente.nombre}</span></div>
    <div class="firma" style="flex:1">Firma del responsable</div>
  </div>
  <div class="center" style="margin-top:8px;font-size:9px;font-weight:900">
    Generado el ${new Date().toLocaleString("es-BO")}
  </div>
  <div class="feed"></div>`;
}

// ── ESC/POS ───────────────────────────────────────────────────────────────────

function encabezadoEscPos(t: TicketEscPos, v: VentaParaImprimir, titulo: string) {
  t.centrada(v.sucursal?.nombre ?? "DANZA CON ALTURA", { grande: true, negrita: true });
  t.centrada(v.sucursal?.direccion ?? "CALLE LOS ANDES #1090");
  t.centrada(`Tel: ${v.sucursal?.telefono ?? "75804700"}`);
  t.separador("=");
  t.centrada(titulo, { negrita: true });
  t.separador("=");
}

function comprobanteEscPos(v: VentaParaImprimir, anchoMm: number): string {
  const t = new TicketEscPos(columnas(anchoMm));
  const saldo = Math.max(0, Number(v.total) - Number(v.total_pagado));
  const descuento = Number(v.descuento ?? 0);

  encabezadoEscPos(t, v, "Comprobante de Venta");
  t.par("N. Venta", v.codigo, true);
  t.par("Fecha", new Date(v.createdAt).toLocaleDateString("es-BO"));
  t.par("Estado", ESTADO_LABEL[v.estado] ?? v.estado);

  t.linea();
  t.titulo("Cliente");
  t.par("Nombre", v.cliente.nombre, true);
  if (v.cliente.ci) t.par("CI", v.cliente.ci);
  if (v.cliente.celular) t.par("Celular", v.cliente.celular);

  t.linea();
  t.titulo("Items");
  for (const it of v.items) {
    t.item(
      it.descripcion,
      `${it.cantidad} x Bs. ${Number(it.precio_unit).toFixed(2)}`,
      `Bs. ${Number(it.subtotal).toFixed(2)}`,
    );
  }
  t.separador();

  if (descuento > 0) {
    t.par("Subtotal", `Bs. ${(Number(v.total) + descuento).toFixed(2)}`);
    t.par("Descuento", `-Bs. ${descuento.toFixed(2)}`);
  }
  t.par("TOTAL", `Bs. ${Number(v.total).toFixed(2)}`, true);
  t.par("Pagado", `Bs. ${Number(v.total_pagado).toFixed(2)}`);
  if (v.forma_pago) t.par("Forma de pago", FORMA_PAGO_LABEL[v.forma_pago] ?? v.forma_pago);
  if (saldo > 0.01) t.par("SALDO PENDIENTE", `Bs. ${saldo.toFixed(2)}`, true);
  else t.centrada("PAGADO COMPLETO", { negrita: true });

  if (v.observaciones) {
    t.linea();
    t.titulo("Observaciones");
    t.linea(v.observaciones);
  }

  t.firma(`Firma cliente - ${v.cliente.nombre}`);
  t.firma("Firma del responsable");
  t.linea();
  t.centrada(`Generado el ${new Date().toLocaleString("es-BO")}`);
  return t.finalizar();
}

function comandaEscPos(v: VentaParaImprimir, anchoMm: number): string {
  const t = new TicketEscPos(columnas(anchoMm));
  const totalUnidades = v.items.reduce((s, it) => s + it.cantidad, 0);

  encabezadoEscPos(t, v, "Comanda - Preparacion");
  t.par("N. Venta", v.codigo, true);
  t.par("Cliente", v.cliente.nombre);
  if (v.cliente.celular) t.par("Celular", v.cliente.celular);
  t.par("Fecha", new Date(v.createdAt).toLocaleDateString("es-BO"), true);
  t.par("Estado", ESTADO_LABEL[v.estado] ?? v.estado);

  t.linea();
  t.titulo("Preparar");
  if (v.items.length === 0) {
    t.linea("Sin items cargados");
  } else {
    for (const it of v.items) {
      const { modelo, extras } = detalleItem(it);
      t.parEnvuelto(`[ ] ${modelo}`, `x${it.cantidad}`, true);
      if (extras) t.detalle(extras);
    }
  }
  t.separador();
  t.par("TOTAL UNIDADES", String(totalUnidades), true);

  if (v.observaciones) {
    t.linea();
    t.separador("*");
    t.linea(`OBS: ${v.observaciones}`);
    t.separador("*");
  }

  t.firma("Preparado por");
  t.linea();
  t.centrada(new Date().toLocaleString("es-BO"));
  return t.finalizar();
}

export function imprimirVenta(
  v: VentaParaImprimir,
  opciones?: { comanda?: boolean; soloComanda?: boolean },
) {
  const config = leerConfigImpresion();

  const comanda: Ticket = {
    tipo: "comanda",
    cuerpo: comandaHtml(v),
    escpos: comandaEscPos(v, config.anchoMm),
  };

  if (opciones?.soloComanda) {
    return imprimirTickets([comanda], `Comanda ${v.codigo}`, config);
  }

  const conComanda = opciones?.comanda ?? config.comandaActiva;
  const tickets: Ticket[] = [{
    tipo: "comprobante",
    cuerpo: comprobanteHtml(v),
    escpos: comprobanteEscPos(v, config.anchoMm),
  }];
  if (conComanda) tickets.push(comanda);

  return imprimirTickets(tickets, `Venta ${v.codigo}`, config);
}
