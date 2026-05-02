export interface VentaParaImprimir {
  codigo: string;
  createdAt: string;
  estado: string;
  cliente: { nombre: string; ci?: string | null; celular?: string | null };
  sucursal?: { nombre: string; direccion?: string | null; telefono?: string | null; email?: string | null } | null;
  items: { descripcion: string; cantidad: number; precio_unit: string | number; subtotal: string | number }[];
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

export function imprimirVenta(v: VentaParaImprimir) {
  const saldo = Math.max(0, Number(v.total) - Number(v.total_pagado));
  const descuento = Number(v.descuento ?? 0);

  const filasItems = v.items.map((it) => `<tr>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:11px;font-weight:900">${it.descripcion}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:center;font-size:11px;font-weight:900">${it.cantidad}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:11px;font-weight:900">Bs.${Number(it.precio_unit).toFixed(0)}</td>
    <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:12px;font-weight:900">Bs.${Number(it.subtotal).toFixed(0)}</td>
  </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8">
  <title>Comprobante de Venta ${v.codigo}</title>
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
    <div style="font-size:16px;font-weight:900;letter-spacing:0.05em">${v.sucursal?.nombre ?? "DANZA CON ALTURA"}</div>
    ${v.sucursal?.direccion ? `<div style="font-size:10px;font-weight:900">${v.sucursal.direccion}</div>` : `<div style="font-size:10px;font-weight:900">CALLE LOS ANDES #1090</div>`}
    ${v.sucursal?.telefono ? `<div style="font-size:10px;font-weight:900">Tel: ${v.sucursal.telefono}</div>` : `<div style="font-size:10px;font-weight:900">Tel: 75804700</div>`}
  </div>
  <hr class="divider">
  <div class="center" style="font-size:13px;font-weight:900;letter-spacing:0.06em;text-transform:uppercase;margin:5px 0">
    Comprobante de Venta
  </div>
  <hr class="divider">
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
