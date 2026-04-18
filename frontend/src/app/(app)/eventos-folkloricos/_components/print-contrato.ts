import type { Contrato } from "./eventos-client";

const TIPO_P_LABEL: Record<string, string> = {
  HOMBRE: "Hombre", CHOLITA: "Mujer", MACHA: "Macha", NINO: "Niño", OTRO: "Otro",
};

function row(label: string, value: string, bold = false, color = "") {
  return `<tr>
    <td style="padding:3px 4px;border-bottom:1px dashed #ddd;color:#555;font-size:10px">${label}</td>
    <td style="padding:3px 4px;border-bottom:1px dashed #ddd;text-align:right;font-size:10px;${bold ? "font-weight:bold;" : ""}${color ? `color:${color};` : ""}">${value}</td>
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
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;font-size:10px">
        <strong>${p.modelo}</strong>${varInfo ? `<br><span style="color:#666;font-size:9px">${varInfo}</span>` : ""}
      </td>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;text-align:center;font-size:10px">${cant}</td>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;text-align:right;font-size:10px">Bs.${parseFloat(p.costo_unitario).toFixed(0)}</td>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;text-align:right;font-size:10px;font-weight:bold">Bs.${parseFloat(p.subtotal).toFixed(0)}</td>
    </tr>`;
  }).join("");

  // ── Participantes ──────────────────────────────────────────────────────────
  const filasParticipantes = participantes_.map((p) => {
    const prenda = prendas_.find((pr) => pr.id === p.prendaId);
    return `<tr>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;font-size:10px">
        <strong>${p.nombre}</strong>${p.ci ? `<br><span style="color:#666;font-size:9px">CI: ${p.ci}</span>` : ""}
        ${p.celular ? `<br><span style="color:#666;font-size:9px">Tel: ${p.celular}</span>` : ""}
      </td>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;font-size:10px;color:#555">${TIPO_P_LABEL[p.tipo] ?? p.tipo}</td>
      <td style="padding:3px 4px;border-bottom:1px dashed #eee;font-size:10px;color:#555">${prenda?.modelo ?? "-"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Comprobante ${c.codigo}</title>
  <style>
    @page { size: 80mm auto; margin: 4mm; }
    * { box-sizing: border-box; }
    body { font-family: Arial, sans-serif; font-size: 10px; color: #111; margin: 0; padding: 0; width: 72mm; }
    h2 { font-size: 11px; font-weight: 700; margin: 8px 0 3px; border-bottom: 1px solid #999; padding-bottom: 2px; text-transform: uppercase; letter-spacing: 0.04em; }
    table { width: 100%; border-collapse: collapse; }
    .center { text-align: center; }
    .divider { border: none; border-top: 1px dashed #aaa; margin: 6px 0; }
    .firma { border-top: 1px solid #000; padding-top: 4px; text-align: center; font-size: 9px; }
    @media screen { body { width: 80mm; padding: 8px; border: 1px dashed #ccc; margin: 16px auto; } }
  </style>
  </head><body>

  <!-- ENCABEZADO -->
  <div class="center" style="margin-bottom:4px">
    <div style="font-size:14px;font-weight:900;letter-spacing:0.05em">FOLCKLORE Bolivia</div>
    <div style="font-size:9px;color:#555">Alquiler de trajes folklóricos</div>
    ${c.sucursal ? `
      <div style="font-size:9px;color:#444;margin-top:2px">${c.sucursal.nombre}${c.sucursal.ciudad ? ` · ${c.sucursal.ciudad}` : ""}</div>
      ${c.sucursal.direccion ? `<div style="font-size:9px;color:#666">${c.sucursal.direccion}</div>` : ""}
      ${c.sucursal.telefono  ? `<div style="font-size:9px;color:#666">Tel: ${c.sucursal.telefono}</div>` : ""}
      ${c.sucursal.email     ? `<div style="font-size:9px;color:#666">${c.sucursal.email}</div>` : ""}
    ` : ""}
  </div>
  <hr class="divider">
  <div class="center" style="font-size:11px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;margin:4px 0">
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
    ${c.cliente.ci     ? row("CI",      c.cliente.ci) : ""}
    ${c.cliente.celular ? row("Celular", c.cliente.celular) : ""}
    ${c.institucion    ? row("Institución", c.institucion) : ""}
  </tbody></table>

  <!-- EVENTO -->
  <h2>Evento</h2>
  <table><tbody>
    ${row("Nombre", c.nombre_evento_ext ?? c.evento?.nombre ?? "-")}
    ${c.ubicacion ? row("Lugar", c.ubicacion) : ""}
    ${row("Entrega",    new Date(c.fecha_entrega).toLocaleDateString("es-BO"))}
    ${row("Devolución", new Date(c.fecha_devolucion).toLocaleDateString("es-BO"))}
  </tbody></table>

  ${prendas_.length > 0 ? `
  <!-- PRENDAS -->
  <h2>Prendas</h2>
  <table>
    <thead><tr>
      <th style="text-align:left;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Modelo / Var.</th>
      <th style="text-align:center;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Cant</th>
      <th style="text-align:right;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">P/u</th>
      <th style="text-align:right;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Sub</th>
    </tr></thead>
    <tbody>${filasPrendas}</tbody>
  </table>` : ""}

  ${participantes_.length > 0 ? `
  <!-- PARTICIPANTES -->
  <h2>Participantes</h2>
  <table>
    <thead><tr>
      <th style="text-align:left;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Nombre</th>
      <th style="text-align:left;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Tipo</th>
      <th style="text-align:left;font-size:9px;padding:2px 4px;border-bottom:1px solid #999">Prenda</th>
    </tr></thead>
    <tbody>${filasParticipantes}</tbody>
  </table>` : ""}

  ${garantiasOtras.length > 0 || garantiaEf > 0 ? `
  <!-- GARANTÍAS -->
  <h2>Garantías</h2>
  <table><tbody>
    ${garantiasOtras.map((g) => row(g.tipo.replace(/_/g, " "), g.descripcion ?? "-")).join("")}
    ${garantiaEf > 0 ? row("Efectivo (a devolver)", `Bs. ${garantiaEf.toFixed(2)}`) : ""}
  </tbody></table>` : ""}

  <!-- RESUMEN FINANCIERO -->
  <h2>Resumen Financiero</h2>
  <table><tbody>
    ${row("Total contrato", `Bs. ${parseFloat(c.total).toFixed(2)}`, true)}
    ${c.tipo === "RESERVA" ? row("Anticipo pactado", `Bs. ${parseFloat(c.anticipo).toFixed(2)}`) : ""}
    ${row("Total pagado", `Bs. ${parseFloat(c.total_pagado).toFixed(2)}`)}
    ${c.forma_pago ? row("Forma de pago", c.forma_pago) : ""}
    ${row("Saldo pendiente", `Bs. ${saldo}`, true, parseFloat(saldo) > 0 ? "#c00" : "#080")}
  </tbody></table>

  ${c.observaciones || c.condiciones ? `
  <h2>Observaciones</h2>
  <div style="font-size:9px;color:#444;line-height:1.4">
    ${c.observaciones ? `<p style="margin:2px 0">${c.observaciones}</p>` : ""}
    ${c.condiciones   ? `<p style="margin:2px 0">${c.condiciones}</p>`   : ""}
  </div>` : ""}

  <hr class="divider" style="margin-top:12px">
  <div style="display:flex;justify-content:space-between;margin-top:20px;gap:8px">
    <div class="firma" style="flex:1">Firma cliente<br><span style="color:#888">${c.cliente.nombre}</span></div>
    <div class="firma" style="flex:1">Firma responsable<br><span style="color:#888">FOLCKLORE Bolivia</span></div>
  </div>
  <div class="center" style="margin-top:8px;font-size:8px;color:#aaa">
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
