import type { Contrato } from "./eventos-client";

const TIPO_P_LABEL: Record<string, string> = {
  HOMBRE: "Hombre", CHOLITA: "Mujer", MACHA: "Macha", NINO: "Niño", OTRO: "Otro",
};

function row(label: string, value: string, big = false, color = "") {
  return `<tr>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:${big ? "11" : "10"}px;font-weight:900">${label}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:${big ? "12" : "11"}px;font-weight:900${color ? `;color:${color}` : ""}">${value}</td>
  </tr>`;
}

export function imprimirContrato(c: Contrato) {
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

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Comprobante ${c.codigo}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 11px; font-weight: 900; color: #000; margin: 0; padding: 0; width: 72mm; }
    h2 { font-size: 12px; font-weight: 900; margin: 9px 0 3px; border-bottom: 2px solid #000; padding-bottom: 3px; text-transform: uppercase; letter-spacing: 0.05em; }
    table { width: 100%; border-collapse: collapse; }
    td, th { font-weight: 900; }
    .center { text-align: center; }
    .divider { border: none; border-top: 2px dashed #000; margin: 6px 0; }
    .firma { border-top: 2px solid #000; padding-top: 4px; text-align: center; font-size: 10px; font-weight: 900; }
    @media screen { body { width: 80mm; padding: 8px; border: 1px dashed #ccc; margin: 16px auto; } }
  </style>
  </head><body>

  <!-- ENCABEZADO -->
  <div class="center" style="margin-bottom:4px">
    <div style="font-size:16px;font-weight:900;letter-spacing:0.05em">${c.sucursal?.nombre ?? "DANZA CON ALTURA"}</div>
    ${c.sucursal?.direccion ? `<div style="font-size:10px;font-weight:900">${c.sucursal.direccion}</div>` : `<div style="font-size:10px;font-weight:900">CALLE LOS ANDES #1090</div>`}
    ${c.sucursal?.telefono  ? `<div style="font-size:10px;font-weight:900">Tel: ${c.sucursal.telefono}</div>` : `<div style="font-size:10px;font-weight:900">Tel: 75804700</div>`}
    ${c.sucursal?.email     ? `<div style="font-size:10px;font-weight:900">${c.sucursal.email}</div>` : ""}
  </div>
  <hr class="divider">
  <div class="center" style="font-size:13px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;margin:5px 0">
    Contrato ${c.tipo === "RESERVA" ? "de Reserva" : "Directo"}
  </div>
  <hr class="divider">
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
    ${c.institucion     ? row("Institucion", c.institucion) : ""}
  </tbody></table>

  <!-- EVENTO -->
  <h2>Evento</h2>
  <table><tbody>
    ${row("Nombre",     c.nombre_evento_ext ?? c.evento?.nombre ?? "-")}
    ${c.ubicacion ? row("Lugar", c.ubicacion) : ""}
    ${row("Entrega",    new Date(c.fecha_entrega).toLocaleDateString("es-BO"))}
    ${row("Devolucion", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"))}
  </tbody></table>

  ${prendas_.length > 0 ? `
  <!-- PRENDAS -->
  <h2>Prendas</h2>
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

  ${garantiasOtras.length > 0 || garantiaEf > 0 ? `
  <!-- GARANTIAS -->
  <h2>Garantias</h2>
  <table><tbody>
    ${garantiasOtras.map((g) => {
      const label = g.tipo === "DOCUMENTO_CARNET" ? "Documento / Carnet" : g.tipo === "CARTA_INSTITUCIONAL" ? "Carta institucional" : g.tipo.replace(/_/g, " ");
      const valor = g.valor ? `Bs. ${parseFloat(String(g.valor)).toFixed(2)}` : (g.descripcion ?? "-");
      return row(label, valor);
    }).join("")}
    ${garantiaEf > 0 ? row("Efectivo (a devolver)", `Bs. ${garantiaEf.toFixed(2)}`) : ""}
  </tbody></table>` : ""}

  <!-- RESUMEN FINANCIERO -->
  <h2>Resumen Financiero</h2>
  <table><tbody>
    ${row("Total contrato",  `Bs. ${parseFloat(c.total).toFixed(2)}`, true)}
    ${c.tipo === "RESERVA" ? row("Anticipo pactado", `Bs. ${parseFloat(c.anticipo).toFixed(2)}`) : ""}
    ${row("Total pagado",    `Bs. ${parseFloat(c.total_pagado).toFixed(2)}`)}
    ${c.forma_pago ? row("Forma de pago", c.forma_pago) : ""}
    ${row("Saldo pendiente", `Bs. ${saldo}`, true)}
  </tbody></table>

  ${c.observaciones ? `
  <h2>Observaciones</h2>
  <div style="font-size:10px;font-weight:900;line-height:1.4">
    <p style="margin:2px 0">${c.observaciones}</p>
  </div>` : ""}

  ${c.condiciones ? `
  <h2>Condiciones</h2>
  <div style="font-size:10px;font-weight:900;line-height:1.4">
    <p style="margin:2px 0">${c.condiciones}</p>
  </div>` : ""}

  <hr class="divider" style="margin-top:14px">
  <div style="display:flex;justify-content:space-between;margin-top:22px;gap:8px">
    <div class="firma" style="flex:1">Firma cliente<br><span style="font-weight:900">${c.cliente.nombre}</span></div>
    <div class="firma" style="flex:1">Firma responsable<br><span style="font-weight:900">FOLCKLORE Bolivia</span></div>
  </div>
  <div class="center" style="margin-top:8px;font-size:9px;font-weight:900">
    Generado el ${new Date().toLocaleString("es-BO")}
  </div>

  </body></html>`;

  const win = window.open("", "_blank", "width=420,height=800");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
