import { ImpresionConfig } from "./_components/impresion-config";

export default function Page() {
  return (
    <div className="flex flex-col gap-4 p-4 sm:p-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-3xl font-extrabold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
          Configuración
        </h1>
        <p className="text-xs text-muted-foreground font-medium mt-0.5">
          Impresión de comprobantes y comandas
        </p>
      </div>

      <ImpresionConfig />
    </div>
  );
}
