"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Button } from "@/components/ui/button";
import {
  guardarConfigImpresion,
  imprimirTickets,
  impresoraPorDefecto,
  leerConfigImpresion,
  firmaDisponible,
  listarImpresoras,
  snapshotConfigImpresion,
  snapshotConfigImpresionServidor,
  suscribirConfigImpresion,
  type ConfigImpresion,
  type ModoImpresion,
} from "@/lib/impresion";

type EstadoQz = "sin-probar" | "buscando" | "conectado" | "error";

const ANCHOS = [
  { valor: 80, label: '80 mm (estándar)' },
  { valor: 58, label: '58 mm (angosta)' },
];

const DPIS = [
  { valor: 203, label: '203 DPI (térmica común)' },
  { valor: 300, label: '300 DPI (térmica de etiquetas)' },
  { valor: 180, label: '180 DPI' },
  { valor: 600, label: '600 DPI (láser / inkjet)' },
];

function ticketPrueba(titulo: string) {
  return `
  <div class="center" style="margin-bottom:4px">
    <div style="font-size:16px;font-weight:900;letter-spacing:0.05em">DANZA CON ALTURA</div>
    <div style="font-size:10px;font-weight:900">Prueba de impresora</div>
  </div>
  <hr class="divider">
  <div class="center" style="font-size:13px;font-weight:900;text-transform:uppercase;margin:5px 0">${titulo}</div>
  <hr class="divider">
  <table><tbody>
    <tr><td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:10px;font-weight:900">Fecha</td>
        <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:11px;font-weight:900">${new Date().toLocaleString("es-BO")}</td></tr>
    <tr><td style="padding:4px 5px;border-bottom:1px dashed #000;font-size:10px;font-weight:900">Prueba</td>
        <td style="padding:4px 5px;border-bottom:1px dashed #000;text-align:right;font-size:11px;font-weight:900">ÁÉÍÓÚ ñ Bs. 1.234,56</td></tr>
  </tbody></table>
  <div style="font-size:11px;font-weight:900;margin-top:8px">
    Si leés esto completo y con los bordes derechos, el ancho de papel está bien configurado.
  </div>
  <div class="firma" style="margin-top:22px">Prueba correcta</div>
  <div class="feed"></div>`;
}

export function ImpresionConfig() {
  // localStorage es un store externo; así no hace falta copiarlo a estado en un efecto
  const config = useSyncExternalStore(
    suscribirConfigImpresion,
    snapshotConfigImpresion,
    snapshotConfigImpresionServidor,
  );

  const [estado, setEstado] = useState<EstadoQz>("sin-probar");
  const [impresoras, setImpresoras] = useState<string[]>([]);
  const [errorQz, setErrorQz] = useState<string | null>(null);
  const [aviso, setAviso] = useState<string | null>(null);
  const [guardado, setGuardado] = useState(false);
  // Cambia en cada click de "Detectar" para relanzar la búsqueda
  const [intento, setIntento] = useState(0);
  const [firmaOk, setFirmaOk] = useState<boolean | null>(null);

  // Estado de la firma en el backend: sin ella QZ pide autorización por ticket
  useEffect(() => {
    let vivo = true;
    void firmaDisponible().then((ok) => { if (vivo) setFirmaOk(ok); });
    return () => { vivo = false; };
  }, []);

  const set = <K extends keyof ConfigImpresion>(clave: K, valor: ConfigImpresion[K]) => {
    guardarConfigImpresion({ ...leerConfigImpresion(), [clave]: valor });
    setGuardado(true);
    setTimeout(() => setGuardado(false), 1800);
  };

  // Busca impresoras al entrar en modo QZ y cada vez que se pide reintentar.
  // Los setState viven dentro del async, no en el cuerpo del efecto.
  useEffect(() => {
    if (config.modo !== "qz") return;
    let vivo = true;
    void (async () => {
      try {
        const lista = await listarImpresoras();
        if (!vivo) return;
        setImpresoras(lista);
        setEstado("conectado");
        setErrorQz(null);
        // Si todavía no hay elegida, proponer la predeterminada del sistema
        if (!leerConfigImpresion().impresoraComprobante) {
          const porDefecto = await impresoraPorDefecto();
          if (vivo && porDefecto && lista.includes(porDefecto)) {
            guardarConfigImpresion({ ...leerConfigImpresion(), impresoraComprobante: porDefecto });
          }
        }
      } catch (e) {
        if (!vivo) return;
        setEstado("error");
        setErrorQz(e instanceof Error ? e.message : String(e));
      }
    })();
    return () => { vivo = false; };
  }, [config.modo, intento]);

  /** Baja el certificado con el nombre que QZ espera, para no explicarlo por teléfono. */
  const descargarCertificado = async () => {
    try {
      const res = await fetch("/api/qz/certificate");
      const data = (await res.json()) as { certificado?: string };
      if (!data.certificado) { setAviso("El servidor no tiene certificado cargado."); return; }
      const url = URL.createObjectURL(new Blob([data.certificado], { type: "application/x-x509-ca-cert" }));
      const a = document.createElement("a");
      a.href = url;
      a.download = "override.crt";
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      setAviso("No se pudo descargar el certificado.");
    }
  };

  const buscarImpresoras = () => {
    setEstado("buscando");
    setIntento((n) => n + 1);
  };

  const probar = async (tipo: "comprobante" | "comanda") => {
    setAviso(null);
    const res = await imprimirTickets(
      [{ tipo, cuerpo: ticketPrueba(tipo === "comanda" ? "Comanda de bodega" : "Comprobante") }],
      "Prueba de impresión",
      config,
    );
    setAviso(res.aviso ?? (res.modo === "qz" ? "Enviado a la impresora." : "Se abrió el diálogo del navegador."));
  };

  const modoQz = config.modo === "qz";

  return (
    <div className="space-y-5">
      {/* Modo */}
      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-3">
        <div>
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>Cómo se imprime</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Esta configuración es de esta computadora, no de tu usuario.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-3">
          {([
            {
              valor: "navegador" as ModoImpresion,
              titulo: "Diálogo del navegador",
              detalle: "Abre la ventana de impresión y elegís la impresora cada vez. No necesita instalar nada.",
            },
            {
              valor: "qz" as ModoImpresion,
              titulo: "Directo con QZ Tray",
              detalle: "Manda el ticket a la impresora sin diálogo. Requiere QZ Tray instalado y abierto en esta máquina.",
            },
          ]).map((op) => (
            <button
              key={op.valor}
              onClick={() => set("modo", op.valor)}
              className={`text-left rounded-xl border-2 p-3 transition-all ${
                config.modo === op.valor
                  ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                  : "border-border hover:border-primary/40"
              }`}
            >
              <p className="text-sm font-bold">{op.titulo}</p>
              <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{op.detalle}</p>
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3 flex-wrap pt-1">
          <label className="text-xs font-semibold text-muted-foreground">Ancho de papel</label>
          <select
            value={config.anchoMm}
            onChange={(e) => set("anchoMm", Number(e.target.value))}
            className="px-3 py-1.5 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
          >
            {ANCHOS.map((a) => <option key={a.valor} value={a.valor}>{a.label}</option>)}
          </select>

          <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground ml-auto">
            <input
              type="checkbox"
              checked={config.comandaActiva}
              onChange={(e) => set("comandaActiva", e.target.checked)}
              className="h-4 w-4 rounded border-border"
            />
            Imprimir comanda de bodega junto al comprobante
          </label>
        </div>
      </section>

      {/* QZ Tray */}
      {modoQz && (
        <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-4">
          <div className="flex items-start justify-between gap-3 flex-wrap">
            <div>
              <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>QZ Tray</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Tiene que estar instalado y corriendo en esta computadora.{" "}
                <a href="https://qz.io/download/" target="_blank" rel="noreferrer" className="text-primary font-semibold hover:underline">
                  Descargar →
                </a>
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-2 py-1 rounded-lg border ${
                estado === "conectado" ? "bg-emerald-500/10 text-emerald-700 border-emerald-300/50"
                : estado === "error"   ? "bg-red-500/10 text-red-700 border-red-300/50"
                : "bg-muted text-muted-foreground border-border"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${
                  estado === "conectado" ? "bg-emerald-500" : estado === "error" ? "bg-red-500" : "bg-gray-400"
                }`} />
                {estado === "conectado" ? "Conectado" : estado === "buscando" ? "Buscando…" : estado === "error" ? "Sin conexión" : "Sin probar"}
              </span>
              <Button variant="outline" size="sm" onClick={buscarImpresoras} disabled={estado === "buscando"}>
                {estado === "buscando" ? "Buscando…" : "Detectar impresoras"}
              </Button>
            </div>
          </div>

          {estado === "error" && (
            <div className="rounded-xl border-2 border-red-200 bg-red-50 px-3 py-2.5 space-y-1">
              <p className="text-xs font-bold text-red-700">No se pudo conectar con QZ Tray</p>
              <p className="text-xs text-red-600">{errorQz}</p>
              <ul className="text-xs text-red-600 list-disc pl-4 space-y-0.5 pt-1">
                <li>Verificá que QZ Tray esté abierto (ícono en la barra de tareas).</li>
                <li>La primera vez pide permiso para este sitio: aceptá y marcá «Remember».</li>
                <li>QZ corre en la máquina donde está el navegador, no en el servidor.</li>
              </ul>
            </div>
          )}

          {/* Firma */}
          <div className={`rounded-xl border-2 px-3 py-3 space-y-1.5 ${
            firmaOk ? "border-emerald-200 bg-emerald-50" : "border-amber-200 bg-amber-50"
          }`}>
            <p className={`text-xs font-bold ${firmaOk ? "text-emerald-700" : "text-amber-700"}`}>
              {firmaOk === null ? "Verificando firma…"
                : firmaOk ? "Peticiones firmadas" : "Peticiones sin firmar"}
            </p>
            {firmaOk === false && (
              <>
                <p className="text-xs text-amber-700">
                  QZ muestra <b>«An anonymous request · Untrusted website»</b> al conectarse y
                  al imprimir. Como salida rápida podés darle <b>Allow</b> con{" "}
                  <b>Remember this decision</b> tildado: deja de preguntar, pero sólo en esta
                  máquina y hasta que se limpie la configuración de QZ.
                </p>
                <p className="text-xs text-amber-700 font-semibold">
                  Para que deje de preguntar de verdad hacen falta dos pasos, y ninguno
                  alcanza solo:
                </p>
                <p className="text-xs text-amber-700">
                  <b>1. En el servidor</b> — cargar{" "}
                  <code className="font-mono">QZ_PRIVATE_KEY</code> y{" "}
                  <code className="font-mono">QZ_CERTIFICATE</code>. Con esto las peticiones
                  van firmadas y QZ deja de verlas como anónimas: en vez de «anonymous
                  request» muestra el nombre del negocio. Se hace una sola vez.
                </p>
                <p className="text-xs text-amber-700">
                  <b>2. En cada equipo</b> — copiar el certificado como{" "}
                  <code className="font-mono">override.crt</code> en la carpeta de instalación
                  de QZ Tray y reiniciarlo. Sin esto QZ sigue preguntando, porque un
                  certificado propio lo identifica pero no lo hace confiable. Es el mismo
                  archivo que va en <code className="font-mono">QZ_CERTIFICATE</code>, sólo
                  renombrado, y se va a poder descargar desde acá una vez hecho el paso 1.
                </p>
              </>
            )}
            {firmaOk && (
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <p className="text-xs text-emerald-700">
                  Falta copiar el certificado como <code className="font-mono">override.crt</code>{" "}
                  en la carpeta de QZ Tray de esta máquina para que no vuelva a preguntar.
                </p>
                <Button variant="outline" size="sm" onClick={() => void descargarCertificado()}>
                  Descargar override.crt
                </Button>
              </div>
            )}
          </div>

          {/* Formato */}
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 space-y-2">
            <p className="text-xs font-bold">Formato del ticket</p>
            <div className="grid sm:grid-cols-2 gap-2">
              {([
                { valor: "escpos" as const, titulo: "ESC/POS (recomendado)", detalle: "Comandos crudos. Sale nítido en cualquier térmica y corta el papel entre el comprobante y la comanda." },
                { valor: "html" as const, titulo: "HTML rasterizado", detalle: "Imprime la misma vista previa como imagen. Para impresoras que no son térmicas." },
              ]).map((op) => (
                <button
                  key={op.valor}
                  onClick={() => set("formatoQz", op.valor)}
                  className={`text-left rounded-lg border-2 p-2.5 transition-all ${
                    config.formatoQz === op.valor
                      ? "border-primary bg-primary/5"
                      : "border-border hover:border-primary/40"
                  }`}
                >
                  <p className="text-xs font-bold">{op.titulo}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{op.detalle}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Calidad de impresión — sólo aplica al camino HTML */}
          {config.formatoQz === "html" && (
          <div className="rounded-xl border border-border bg-muted/30 px-3 py-3 space-y-2">
            <p className="text-xs font-bold">Calidad</p>
            <div className="flex items-center gap-3 flex-wrap">
              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                Densidad
                <select
                  value={config.dpi}
                  onChange={(e) => set("dpi", Number(e.target.value))}
                  className="px-2 py-1.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  {DPIS.map((d) => <option key={d.valor} value={d.valor}>{d.label}</option>)}
                </select>
              </label>

              <label className="flex items-center gap-2 text-xs text-muted-foreground">
                <input
                  type="checkbox"
                  checked={config.rasterizar}
                  onChange={(e) => set("rasterizar", e.target.checked)}
                  className="h-4 w-4 rounded border-border"
                />
                Rasterizar el ticket
              </label>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Si el ticket sale más fino o más chico que la vista previa, es la densidad:
              subila a la que dice el manual de tu impresora. Si sale grueso o borroso,
              probá destildando <b>Rasterizar</b> para que lo dibuje el driver.
            </p>
          </div>
          )}

          {/* Selección de impresoras */}
          <div className="grid sm:grid-cols-2 gap-4">
            {([
              { clave: "impresoraComprobante" as const, copias: "copiasComprobante" as const, titulo: "Comprobante (caja)", ayuda: "El ticket con precios que se lleva el cliente." },
              { clave: "impresoraComanda" as const, copias: "copiasComanda" as const, titulo: "Comanda (bodega)", ayuda: "Qué preparar, sin precios. Si la dejás vacía usa la de caja." },
            ]).map((campo) => (
              <div key={campo.clave} className="space-y-1.5">
                <label className="text-xs font-bold text-foreground">{campo.titulo}</label>
                <select
                  value={config[campo.clave] ?? ""}
                  onChange={(e) => set(campo.clave, e.target.value || null)}
                  disabled={impresoras.length === 0}
                  className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 disabled:opacity-50"
                >
                  <option value="">
                    {impresoras.length === 0 ? "Detectá las impresoras primero" : "— Sin asignar —"}
                  </option>
                  {impresoras.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs text-muted-foreground">{campo.ayuda}</p>
                  <label className="flex items-center gap-1.5 text-xs text-muted-foreground shrink-0">
                    Copias
                    <input
                      type="number" min={1} max={5}
                      value={config[campo.copias]}
                      onChange={(e) => set(campo.copias, Number(e.target.value))}
                      className="w-14 px-2 py-1 rounded-lg border border-border bg-background text-sm"
                    />
                  </label>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Prueba */}
      <section className="rounded-2xl border-2 border-border bg-card p-5 space-y-3">
        <div>
          <h2 className="font-bold text-base" style={{ fontFamily: "var(--font-outfit)" }}>Probar</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manda un ticket de prueba con la configuración actual.
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button variant="outline" onClick={() => void probar("comprobante")}>Probar comprobante</Button>
          <Button variant="outline" onClick={() => void probar("comanda")}>Probar comanda</Button>
        </div>
        {aviso && <p className="text-xs font-medium text-muted-foreground">{aviso}</p>}
      </section>

      {guardado && (
        <p className="text-xs font-semibold text-emerald-600">Configuración guardada en esta computadora.</p>
      )}
    </div>
  );
}
