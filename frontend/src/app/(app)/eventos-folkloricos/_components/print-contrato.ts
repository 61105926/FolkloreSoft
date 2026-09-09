import type { Contrato, ContratoGarantia, ContratoPrenda } from "./eventos-client";
import { imprimirTickets, leerConfigImpresion, type Ticket } from "@/lib/impresion";
import { columnas, TicketEscPos } from "@/lib/escpos";

const TIPO_P_LABEL: Record<string, string> = {
  HOMBRE: "Hombre", CHOLITA: "Mujer", MACHA: "Macha", NINO: "Niño", OTRO: "Otro",
};

function row(label: string, value: string, big = false, color = "") {
  return `<tr>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:${big ? "11" : "10"}px;font-weight:900">${label}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:${big ? "12" : "11"}px;font-weight:900${color ? `;color:${color}` : ""}">${value}</td>
  </tr>`;
}

/** Encabezado con los datos de la sucursal, común a comprobante y comanda. */
function encabezado(c: Contrato, titulo: string) {
  return `
  <div class="center" style="margin-bottom:4px">
    <div style="font-size:16px;font-weight:900;letter-spacing:0.05em">${c.sucursal?.nombre ?? "DANZA CON ALTURA"}</div>
    ${c.sucursal?.direccion ? `<div style="font-size:10px;font-weight:900">${c.sucursal.direccion}</div>` : `<div style="font-size:10px;font-weight:900">CALLE LOS ANDES #1090</div>`}
    ${c.sucursal?.telefono  ? `<div style="font-size:10px;font-weight:900">Tel: ${c.sucursal.telefono}</div>` : `<div style="font-size:10px;font-weight:900">Tel: 75804700</div>`}
    ${c.sucursal?.email     ? `<div style="font-size:10px;font-weight:900">${c.sucursal.email}</div>` : ""}
  </div>
  <hr class="divider">
  <div class="center" style="font-size:13px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;margin:5px 0">
    ${titulo}
  </div>
  <hr class="divider">`;
}

/**
 * Comanda de bodega: qué hay que preparar, sin precios ni datos de cobro.
 * Va como segunda página para que la térmica corte entre los dos tickets.
 */
function comandaHtml(c: Contrato) {
  const prendas_ = c.prendas ?? [];
  const totalUnidades = prendas_.reduce((s, p) => s + p.total, 0);

  const filas = prendas_.map((p) => {
    const varInfo = p.variacion
      ? [p.variacion.nombre_variacion, p.variacion.talla ? `T.${p.variacion.talla}` : "", p.variacion.color]
          .filter(Boolean).join(" · ")
      : "";
    return `<tr>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;font-size:14px;font-weight:900;text-align:center;width:22px">[ ]</td>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;font-size:12px;font-weight:900">
        ${p.modelo}${varInfo ? `<br><span style="font-size:10px;font-weight:900">${varInfo}</span>` : ""}
      </td>
      <td style="padding:5px 4px;border-bottom:1px dashed #000;text-align:right;font-size:18px;font-weight:900;width:34px">${p.total}</td>
    </tr>`;
  }).join("");

  return `
    ${encabezado(c, "Comanda · Preparacion")}
    <table><tbody>
      ${row("N° Contrato", c.codigo, true)}
      ${row("Cliente", c.cliente.nombre)}
      ${row("Entrega", new Date(c.fecha_entrega).toLocaleDateString("es-BO"), true)}
      ${row("Devolucion", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"))}
      ${c.ubicacion ? row("Lugar", c.ubicacion) : ""}
    </tbody></table>

    <h2>Preparar</h2>
    <table><tbody>${filas || `<tr><td style="font-size:11px;font-weight:900;padding:6px 0">Sin prendas cargadas</td></tr>`}</tbody></table>
    <table style="margin-top:4px"><tbody>
      ${row("Total unidades", String(totalUnidades), true)}
    </tbody></table>

    ${c.observaciones ? `<div style="font-size:11px;font-weight:900;line-height:1.4;margin-top:6px;border:2px solid #000;padding:4px"><span style="font-weight:900">OBS:</span> ${c.observaciones}</div>` : ""}

    <div class="firma" style="margin-top:24px">Preparado por</div>
    <div class="center" style="margin-top:6px;font-size:9px;font-weight:900">
      ${new Date().toLocaleString("es-BO")}
    </div>
    <div class="feed"></div>`;
}

/**
 * Texto de una garantía documental: cantidad y monto son datos distintos.
 * Antes competían por `valor` y un contrato con 1 carnet se imprimía "Bs. 1.00".
 */
function valorGarantia(g: ContratoGarantia): string {
  const partes: string[] = [];
  if (g.cantidad && g.cantidad > 0) {
    const unidad = g.tipo === "CARTA_INSTITUCIONAL"
      ? (g.cantidad === 1 ? "carta" : "cartas")
      : (g.cantidad === 1 ? "documento" : "documentos");
    partes.push(`${g.cantidad} ${unidad}`);
  }
  if (g.valor && parseFloat(String(g.valor)) > 0) {
    partes.push(`Bs. ${parseFloat(String(g.valor)).toFixed(2)}`);
  }
  if (partes.length === 0) return g.descripcion || "Retenido";
  return partes.join(" · ");
}

// ── ESC/POS ───────────────────────────────────────────────────────────────────

function encabezadoEscPos(t: TicketEscPos, c: Contrato, titulo: string) {
  t.centrada(c.sucursal?.nombre ?? "DANZA CON ALTURA", { grande: true, negrita: true });
  t.centrada(c.sucursal?.direccion ?? "CALLE LOS ANDES #1090");
  t.centrada(`Tel: ${c.sucursal?.telefono ?? "75804700"}`);
  t.separador("=");
  t.centrada(titulo, { negrita: true });
  t.separador("=");
}

/** Detalle de talla y color de una prenda, o aviso de que no la tiene. */
function detallePrenda(p: ContratoPrenda): string {
  if (!p.variacion) return "SIN TALLA ASIGNADA";
  return [
    p.variacion.nombre_variacion,
    p.variacion.talla ? `T.${p.variacion.talla}` : null,
    p.variacion.color,
  ].filter(Boolean).join(" - ");
}

function comprobanteEscPos(c: Contrato, anchoMm: number): string {
  const t = new TicketEscPos(columnas(anchoMm));
  const prendas_ = c.prendas ?? [];
  const participantes_ = c.participantes ?? [];
  const garantias_ = c.garantias ?? [];
  const saldo = (parseFloat(c.total) - parseFloat(c.total_pagado)).toFixed(2);
  const garantiaEf = garantias_
    .filter((g) => g.tipo === "EFECTIVO")
    .reduce((s, g) => s + (g.valor ? parseFloat(String(g.valor)) : 0), 0);

  encabezadoEscPos(t, c, `Contrato ${c.tipo === "RESERVA" ? "de Reserva" : "Directo"}`);
  t.par("N. Contrato", c.codigo, true);
  t.par("Fecha", new Date(c.fecha_contrato).toLocaleDateString("es-BO"));
  t.par("Estado", c.estado.replace(/_/g, " "));

  t.linea();
  t.titulo("Cliente");
  t.par("Nombre", c.cliente.nombre, true);
  if (c.cliente.ci) t.par("CI", c.cliente.ci);
  if (c.cliente.celular) t.par("Celular", c.cliente.celular);

  t.linea();
  t.titulo("Tipo de Evento");
  t.par("Nombre", c.nombre_evento_ext ?? c.evento?.nombre ?? "-");
  if (c.institucion) t.par("Institucion", c.institucion);
  if (c.ubicacion) t.par("Lugar", c.ubicacion);
  t.par("Entrega", new Date(c.fecha_entrega).toLocaleDateString("es-BO"));
  t.par("Devolucion", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"));

  if (prendas_.length > 0) {
    t.linea();
    t.titulo("Items");
    for (const p of prendas_) {
      const cant = (p.cantidad_hombres ?? 0) + (p.cantidad_cholitas ?? 0)
        + (p.cantidad_machas ?? 0) + (p.cantidad_ninos ?? 0);
      t.item(
        p.modelo,
        `${detallePrenda(p)}  |  ${cant} x Bs. ${parseFloat(p.costo_unitario).toFixed(2)}`,
        `Bs. ${parseFloat(p.subtotal).toFixed(2)}`,
      );
    }
    t.separador();
  }

  if (participantes_.length > 0) {
    t.linea();
    t.titulo("Participantes");
    for (const p of participantes_) {
      const prenda = prendas_.find((pr) => pr.id === p.prendaId);
      t.par(p.nombre, prenda?.modelo ?? "-");
      if (p.ci) t.linea(`   CI: ${p.ci}`);
    }
  }

  if (garantias_.length > 0) {
    t.linea();
    t.titulo("Garantias");
    for (const g of garantias_.filter((x) => x.tipo !== "EFECTIVO")) {
      const label = g.tipo === "DOCUMENTO_CARNET" ? "Documento / Carnet"
        : g.tipo === "CARTA_INSTITUCIONAL" ? "Carta institucional"
        : g.tipo.replace(/_/g, " ");
      t.par(label, valorGarantia(g));
    }
    if (garantiaEf > 0) t.par("Efectivo (a devolver)", `Bs. ${garantiaEf.toFixed(2)}`);
  }

  t.linea();
  t.titulo("Resumen Financiero");
  t.par("Total contrato", `Bs. ${parseFloat(c.total).toFixed(2)}`, true);
  if (c.tipo === "RESERVA") t.par("Anticipo pactado", `Bs. ${parseFloat(c.anticipo).toFixed(2)}`);
  t.par("Total pagado", `Bs. ${parseFloat(c.total_pagado).toFixed(2)}`);
  if (c.forma_pago) t.par("Forma de pago", c.forma_pago);
  t.par("SALDO PENDIENTE", `Bs. ${saldo}`, true);

  if (c.observaciones) {
    t.linea();
    t.titulo("Observaciones");
    t.linea(c.observaciones);
  }
  if (c.condiciones) {
    t.linea();
    t.titulo("Condiciones");
    t.linea(c.condiciones);
  }

  t.firma(`Firma cliente - ${c.cliente.nombre}`);
  t.firma("Firma del responsable");
  t.linea();
  t.centrada(`Generado el ${new Date().toLocaleString("es-BO")}`);
  return t.finalizar();
}

function comandaEscPos(c: Contrato, anchoMm: number): string {
  const t = new TicketEscPos(columnas(anchoMm));
  const prendas_ = c.prendas ?? [];
  const totalUnidades = prendas_.reduce((s, p) => s + p.total, 0);

  encabezadoEscPos(t, c, "Comanda - Preparacion");
  t.par("N. Contrato", c.codigo, true);
  t.par("Cliente", c.cliente.nombre);
  t.par("Entrega", new Date(c.fecha_entrega).toLocaleDateString("es-BO"), true);
  t.par("Devolucion", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"));
  if (c.ubicacion) t.par("Lugar", c.ubicacion);

  t.linea();
  t.titulo("Preparar");
  if (prendas_.length === 0) {
    t.linea("Sin prendas cargadas");
  } else {
    for (const p of prendas_) {
      t.parEnvuelto(`[ ] ${p.modelo}`, `x${p.total}`, true);
      t.detalle(detallePrenda(p));
    }
  }
  t.separador();
  t.par("TOTAL UNIDADES", String(totalUnidades), true);

  if (c.observaciones) {
    t.linea();
    t.separador("*");
    t.linea(`OBS: ${c.observaciones}`);
    t.separador("*");
  }

  t.firma("Preparado por");
  t.linea();
  t.centrada(new Date().toLocaleString("es-BO"));
  return t.finalizar();
}

export function imprimirContrato(c: Contrato, opciones?: { comanda?: boolean }) {
  const config         = leerConfigImpresion();
  const conComanda     = opciones?.comanda ?? config.comandaActiva;
  const prendas_       = c.prendas ?? [];
  const participantes_ = c.participantes ?? [];
  const garantias_     = c.garantias ?? [];
  const saldo          = (parseFloat(c.total) - parseFloat(c.total_pagado)).toFixed(2);
  const garantiaEf     = garantias_
    .filter((g) => g.tipo === "EFECTIVO")
    .reduce((s, g) => s + (g.valor ? parseFloat(String(g.valor)) : 0), 0);
  const garantiasOtras = garantias_.filter((g) => g.tipo !== "EFECTIVO");

  // ── Prendas ────────────────────────────────────────────────────────────────
  const filasPrendas = prendas_.map((p) => {
    const varInfo = p.variacion
      ? `${p.variacion.nombre_variacion}${p.variacion.talla ? " T." + p.variacion.talla : ""}`
      : "";
    const cant = (p.cantidad_hombres ?? 0) + (p.cantidad_cholitas ?? 0) + (p.cantidad_machas ?? 0) + (p.cantidad_ninos ?? 0);
    return `<tr>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:11px;font-weight:900">
        ${p.modelo}${varInfo ? `<br><span style="font-size:9px;font-weight:900">${varInfo}</span>` : ""}
      </td>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:center;font-size:12px;font-weight:900">${cant}</td>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:11px;font-weight:900">Bs.${parseFloat(p.costo_unitario).toFixed(0)}</td>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:12px;font-weight:900">Bs.${parseFloat(p.subtotal).toFixed(0)}</td>
    </tr>`;
  }).join("");

  // ── Participantes ──────────────────────────────────────────────────────────
  const filasParticipantes = participantes_.map((p) => {
    const prenda = prendas_.find((pr) => pr.id === p.prendaId);
    return `<tr>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:10px;font-weight:900">
        ${p.nombre}${p.ci ? `<br><span style="font-size:9px;font-weight:900">CI: ${p.ci}</span>` : ""}
        ${p.celular ? `<br><span style="font-size:9px;font-weight:900">Tel: ${p.celular}</span>` : ""}
      </td>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:10px;font-weight:900">${TIPO_P_LABEL[p.tipo] ?? p.tipo}</td>
      <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:10px;font-weight:900">${prenda?.modelo ?? "-"}</td>
    </tr>`;
  }).join("");

  const comprobante = `
  ${encabezado(c, `Contrato ${c.tipo === "RESERVA" ? "de Reserva" : "Directo"}`)}
  <table><tbody>
    ${row("N° Contrato", c.codigo, true)}
    ${row("Fecha", new Date(c.fecha_contrato).toLocaleDateString("es-BO"))}
    ${row("Estado", c.estado.replace(/_/g, " "))}
  </tbody></table>

  <!-- CLIENTE -->
  <h2>Cliente</h2>
  <table><tbody>
    ${row("Nombre", c.cliente.nombre, true)}
    ${c.cliente.ci      ? row("CI",         c.cliente.ci) : ""}
    ${c.cliente.celular ? row("Celular",     c.cliente.celular) : ""}
  </tbody></table>

  <!-- EVENTO -->
  <h2>Tipo de Evento</h2>
  <table><tbody>
    ${row("Nombre",     c.nombre_evento_ext ?? c.evento?.nombre ?? "-")}
    ${c.institucion ? row("Institucion", c.institucion) : ""}
    ${c.ubicacion ? row("Lugar", c.ubicacion) : ""}
    ${row("Entrega",    new Date(c.fecha_entrega).toLocaleDateString("es-BO"))}
    ${row("Devolucion", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"))}
  </tbody></table>

  ${prendas_.length > 0 ? `
  <!-- ITEMS -->
  <h2>Items</h2>
  <table>
    <thead><tr>
      <th style="text-align:left;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Modelo</th>
      <th style="text-align:center;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Cant</th>
      <th style="text-align:right;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">P/u</th>
      <th style="text-align:right;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Sub</th>
    </tr></thead>
    <tbody>${filasPrendas}</tbody>
  </table>` : ""}

  ${participantes_.length > 0 ? `
  <!-- PARTICIPANTES -->
  <h2>Participantes</h2>
  <table>
    <thead><tr>
      <th style="text-align:left;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Nombre</th>
      <th style="text-align:left;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Tipo</th>
      <th style="text-align:left;font-size:10px;padding:3px 5px;border-bottom:2px solid #000;font-weight:900">Prenda</th>
    </tr></thead>
    <tbody>${filasParticipantes}</tbody>
  </table>` : ""}

  ${garantiasOtras.length > 0 || garantiaEf > 0 || c.observaciones ? `
  <!-- GARANTIAS -->
  <h2>Garantias</h2>
  <table><tbody>
    ${garantiasOtras.map((g) => {
      const label = g.tipo === "DOCUMENTO_CARNET" ? "Documento / Carnet" : g.tipo === "CARTA_INSTITUCIONAL" ? "Carta institucional" : g.tipo.replace(/_/g, " ");
      return row(label, valorGarantia(g));
    }).join("")}
    ${garantiaEf > 0 ? row("Efectivo (a devolver)", `Bs. ${garantiaEf.toFixed(2)}`) : ""}
  </tbody></table>
  ${c.observaciones ? `<div style="font-size:10px;font-weight:900;line-height:1.4;margin-top:4px"><span style="font-weight:900">Obs:</span> ${c.observaciones}</div>` : ""}
  ` : ""}

  <!-- RESUMEN FINANCIERO -->
  <h2>Resumen Financiero</h2>
  <table><tbody>
    ${row("Total contrato",  `Bs. ${parseFloat(c.total).toFixed(2)}`, true)}
    ${c.tipo === "RESERVA" ? row("Anticipo pactado", `Bs. ${parseFloat(c.anticipo).toFixed(2)}`) : ""}
    ${row("Total pagado",    `Bs. ${parseFloat(c.total_pagado).toFixed(2)}`)}
    ${c.forma_pago ? row("Forma de pago", c.forma_pago) : ""}
    ${row("Saldo pendiente", `Bs. ${saldo}`, true)}
  </tbody></table>


  ${c.condiciones ? `
  <h2>Condiciones</h2>
  <div style="font-size:10px;font-weight:900;line-height:1.4">
    <p style="margin:2px 0">${c.condiciones}</p>
  </div>` : ""}

  <hr class="divider" style="margin-top:14px">
  <div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px">
    <div class="firma" style="flex:1">Firma cliente<br><span style="font-weight:900">${c.cliente.nombre}</span></div>
    <div class="firma" style="flex:1">Firma del responsable</div>
  </div>
  <div class="center" style="margin-top:8px;font-size:9px;font-weight:900">
    Generado el ${new Date().toLocaleString("es-BO")}
  </div>
  <div class="feed"></div>`;

  const tickets: Ticket[] = [{
    tipo: "comprobante",
    cuerpo: comprobante,
    escpos: comprobanteEscPos(c, config.anchoMm),
  }];
  if (conComanda) {
    tickets.push({
      tipo: "comanda",
      cuerpo: comandaHtml(c),
      escpos: comandaEscPos(c, config.anchoMm),
    });
  }

  return imprimirTickets(tickets, `Contrato ${c.codigo}`, config);
}
