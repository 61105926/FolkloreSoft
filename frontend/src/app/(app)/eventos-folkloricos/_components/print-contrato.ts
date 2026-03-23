import type { Contrato } from "./eventos-client";

export function imprimirContrato(c: Contrato) {
  const prendas_ = c.prendas ?? [];
  const participantes_ = c.participantes ?? [];
  const garantias_ = c.garantias ?? [];
  const saldo = (parseFloat(c.total) - parseFloat(c.total_pagado)).toFixed(2);

  const filasPrendas = prendas_
    .map((p) => {
      const varInfo = p.variacion
        ? `${p.variacion.nombre_variacion}${p.variacion.talla ? " T." + p.variacion.talla : ""}`
        : "-";
      const cant =
        (p.cantidad_hombres ?? 0) +
        (p.cantidad_cholitas ?? 0) +
        (p.cantidad_machas ?? 0) +
        (p.cantidad_ninos ?? 0);
      return `<tr>
        <td style="padding:6px 8px;border:1px solid #ddd">${p.modelo}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${varInfo}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:center">${cant}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right">Bs. ${parseFloat(p.costo_unitario).toFixed(2)}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;text-align:right">Bs. ${parseFloat(p.subtotal).toFixed(2)}</td>
      </tr>`;
    })
    .join("");

  const filasParticipantes = participantes_
    .map((p) => {
      const instancia = p.instanciaConjunto ? p.instanciaConjunto.codigo : "-";
      const prenda = prendas_.find((pr) => pr.id === p.prendaId);
      return `<tr>
        <td style="padding:6px 8px;border:1px solid #ddd">${p.nombre}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${p.ci ?? "-"}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${p.tipo}</td>
        <td style="padding:6px 8px;border:1px solid #ddd">${prenda?.modelo ?? "-"}</td>
        <td style="padding:6px 8px;border:1px solid #ddd;font-family:monospace">${instancia}</td>
      </tr>`;
    })
    .join("");

  const filasGarantias = garantias_
    .map(
      (g) => `<tr>
      <td style="padding:6px 8px;border:1px solid #ddd">${g.tipo.replace(/_/g, " ")}</td>
      <td style="padding:6px 8px;border:1px solid #ddd">${g.descripcion ?? "-"}</td>
      <td style="padding:6px 8px;border:1px solid #ddd;text-align:right">${g.valor ? "Bs. " + parseFloat(String(g.valor)).toFixed(2) : "-"}</td>
    </tr>`
    )
    .join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Comprobante ${c.codigo}</title>
  <style>
    body { font-family: Arial, sans-serif; font-size: 12px; color: #111; margin: 0; padding: 24px; }
    h1 { font-size: 18px; margin: 0; }
    h2 { font-size: 13px; font-weight: 600; margin: 16px 0 6px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
    th { background: #f0f0f0; padding: 6px 8px; border: 1px solid #ddd; text-align: left; font-size: 11px; }
    .grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 4px 20px; }
    .label { color: #666; }
    .section { margin-bottom: 12px; }
    .firma { border-top: 1px solid #000; padding-top: 6px; text-align: center; font-size: 11px; width: 220px; }
    @media print { body { padding: 12px; } }
  </style>
  </head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:2px solid #000;padding-bottom:10px;margin-bottom:14px">
    <div><h1>FOLCKLORE Bolivia</h1><p style="margin:2px 0;color:#555">Alquiler de trajes folklóricos</p></div>
    <div style="text-align:right">
      <div style="font-size:15px;font-weight:bold">N° ${c.codigo}</div>
      <div style="color:#555">Contrato: ${new Date(c.fecha_contrato).toLocaleDateString("es-BO")}</div>
      <div style="color:#555">Estado: ${c.estado.replace(/_/g, " ")}</div>
    </div>
  </div>

  <h2>Datos del Cliente</h2>
  <div class="grid2 section">
    <div><span class="label">Nombre: </span>${c.cliente.nombre}</div>
    <div><span class="label">CI: </span>${c.cliente.ci ?? "-"}</div>
    <div><span class="label">Celular: </span>${c.cliente.celular ?? "-"}</div>
    <div><span class="label">Institución: </span>${c.institucion ?? "-"}</div>
  </div>

  <h2>Evento</h2>
  <div class="grid2 section">
    <div><span class="label">Nombre evento: </span>${c.nombre_evento_ext ?? c.evento?.nombre ?? "-"}</div>
    <div><span class="label">Lugar: </span>${c.ubicacion ?? "-"}</div>
    <div><span class="label">Entrega: </span>${new Date(c.fecha_entrega).toLocaleDateString("es-BO")}</div>
    <div><span class="label">Devolución: </span>${new Date(c.fecha_devolucion).toLocaleDateString("es-BO")}</div>
  </div>

  ${
    prendas_.length > 0
      ? `
  <h2>Prendas Alquiladas</h2>
  <table><thead><tr>
    <th>Modelo</th><th>Variación / Talla</th><th style="text-align:center">Cant.</th><th style="text-align:right">Bs./u</th><th style="text-align:right">Subtotal</th>
  </tr></thead><tbody>${filasPrendas}</tbody></table>`
      : ""
  }

  ${
    participantes_.length > 0
      ? `
  <h2>Participantes</h2>
  <table><thead><tr>
    <th>Nombre</th><th>CI</th><th>Tipo</th><th>Prenda</th><th>Instancia</th>
  </tr></thead><tbody>${filasParticipantes}</tbody></table>`
      : ""
  }

  ${
    garantias_.length > 0
      ? `
  <h2>Garantías</h2>
  <table><thead><tr><th>Tipo</th><th>Descripción</th><th style="text-align:right">Valor</th></tr></thead>
  <tbody>${filasGarantias}</tbody></table>`
      : ""
  }

  <h2>Resumen Financiero</h2>
  <div class="section" style="max-width:280px;margin-left:auto">
    <table><tbody>
      <tr><td style="padding:4px 8px;border:1px solid #ddd">Total</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right;font-weight:bold">Bs. ${parseFloat(c.total).toFixed(2)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #ddd">Anticipo</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">Bs. ${parseFloat(c.anticipo).toFixed(2)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #ddd">Total pagado</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">Bs. ${parseFloat(c.total_pagado).toFixed(2)}</td></tr>
      <tr><td style="padding:4px 8px;border:1px solid #ddd;font-weight:600">Saldo pendiente</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right;font-weight:bold;color:${parseFloat(saldo) > 0 ? "#c00" : "#080"}">Bs. ${saldo}</td></tr>
      ${c.forma_pago ? `<tr><td style="padding:4px 8px;border:1px solid #ddd">Forma de pago</td><td style="padding:4px 8px;border:1px solid #ddd;text-align:right">${c.forma_pago}</td></tr>` : ""}
    </tbody></table>
  </div>

  ${
    c.observaciones || c.condiciones
      ? `
  <h2>Observaciones y Condiciones</h2>
  <div class="section" style="background:#f9f9f9;padding:8px 12px;border-radius:4px;border:1px solid #eee">
    ${c.observaciones ? `<p style="margin:4px 0"><strong>Observaciones:</strong> ${c.observaciones}</p>` : ""}
    ${c.condiciones ? `<p style="margin:4px 0"><strong>Condiciones:</strong> ${c.condiciones}</p>` : ""}
  </div>`
      : ""
  }

  <div style="display:flex;justify-content:space-around;margin-top:48px;padding-top:12px">
    <div class="firma">Firma del cliente<br><span style="color:#888;font-size:10px">${c.cliente.nombre}</span></div>
    <div class="firma">Firma del responsable<br><span style="color:#888;font-size:10px">FOLCKLORE Bolivia</span></div>
  </div>
  </body></html>`;

  const win = window.open("", "_blank", "width=850,height=1100");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}
