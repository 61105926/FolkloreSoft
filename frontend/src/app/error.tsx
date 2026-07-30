"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="min-h-screen flex items-center justify-center bg-cream p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-crimson flex items-center justify-center mx-auto mb-6 shadow-lg">
          <span className="text-white font-bold text-2xl">F</span>
        </div>
        <h1 className="text-3xl font-bold text-graphite mb-2">
          Algo salió mal
        </h1>
        <p className="text-muted-foreground mb-6">
          No pudimos conectar con el servidor. Intenta nuevamente en unos segundos.
        </p>
        <button
          onClick={reset}
          className="px-6 py-3 bg-crimson text-white rounded-xl font-medium hover:bg-crimson/90 transition-colors"
        >
          Reintentar
        </button>
      </div>
    </main>
  );
}
