import { Badge } from "@/components/ui/badge";

const DANZAS = ["Todos", "Caporales", "Morenada", "Diablada", "Tinku", "Saya", "Kullawada"];

const TRAJES = [
  { id: 1, nombre: "Traje Caporal Varones", danza: "Caporales", talla: "L", precio: "Bs. 350/día", disponible: true, color: "#991B1B" },
  { id: 2, nombre: "Traje Caporal Damas", danza: "Caporales", talla: "M", precio: "Bs. 320/día", disponible: true, color: "#991B1B" },
  { id: 3, nombre: "Traje Moreno Completo", danza: "Morenada", talla: "XL", precio: "Bs. 480/día", disponible: false, color: "#1a1a2e" },
  { id: 4, nombre: "Vestido Chola Moreno", danza: "Morenada", talla: "S", precio: "Bs. 290/día", disponible: true, color: "#1a1a2e" },
  { id: 5, nombre: "Máscara Diablo Premium", danza: "Diablada", talla: "Única", precio: "Bs. 150/día", disponible: true, color: "#4a0e0e" },
  { id: 6, nombre: "Traje Diablo Ángel", danza: "Diablada", talla: "L", precio: "Bs. 520/día", disponible: true, color: "#4a0e0e" },
  { id: 7, nombre: "Pollera Tinku Bordada", danza: "Tinku", talla: "M", precio: "Bs. 210/día", disponible: false, color: "#1e3a1e" },
  { id: 8, nombre: "Montera y Chuspa Tinku", danza: "Tinku", talla: "Única", precio: "Bs. 95/día", disponible: true, color: "#1e3a1e" },
  { id: 9, nombre: "Vestido Saya Afroboliviana", danza: "Saya", talla: "S", precio: "Bs. 180/día", disponible: true, color: "#3d2600" },
  { id: 10, nombre: "Traje Kullawada Completo", danza: "Kullawada", talla: "L", precio: "Bs. 400/día", disponible: true, color: "#0e2a4a" },
  { id: 11, nombre: "Corona Morenada Plateada", danza: "Morenada", talla: "Única", precio: "Bs. 120/día", disponible: true, color: "#1a1a2e" },
  { id: 12, nombre: "Traje Caporal Chileno", danza: "Caporales", talla: "XL", precio: "Bs. 380/día", disponible: false, color: "#991B1B" },
];

export default function RentalsPage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "var(--font-outfit)" }}>
            Catalogo de Ropa Folklorica
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {TRAJES.length} prendas registradas · {TRAJES.filter((t) => t.disponible).length} disponibles
          </p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-crimson text-white text-sm font-semibold hover:bg-crimson-dark transition-colors shadow-sm">
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nueva Prenda
        </button>
      </div>

      {/* Filter chips */}
      <div className="flex gap-2 flex-wrap">
        {DANZAS.map((danza) => (
          <button
            key={danza}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              danza === "Todos"
                ? "bg-crimson text-white border-crimson"
                : "bg-card text-muted-foreground border-border hover:border-crimson/40 hover:text-crimson"
            }`}
          >
            {danza}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {TRAJES.map((traje) => (
          <div
            key={traje.id}
            className="group bg-card rounded-2xl border border-border overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
          >
            {/* Visual card top — pattern-based color block */}
            <div
              className="h-40 relative flex items-center justify-center overflow-hidden"
              style={{ backgroundColor: traje.color }}
            >
              {/* Aguayo overlay stripes (decorative) */}
              <div className="absolute inset-0 opacity-20"
                style={{
                  backgroundImage: "repeating-linear-gradient(135deg, rgba(255,255,255,0.15) 0px 2px, transparent 2px 12px)",
                }} />

              {/* Dress icon */}
              <div className="relative z-10 w-16 h-16 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm">
                <svg className="h-9 w-9 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                    d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
                </svg>
              </div>

              {/* Availability badge */}
              <div className="absolute top-3 right-3">
                <span
                  className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                    traje.disponible
                      ? "bg-coca text-white"
                      : "bg-gray-600 text-white"
                  }`}
                >
                  {traje.disponible ? "Disponible" : "Alquilado"}
                </span>
              </div>

              {/* Hover overlay with CTA */}
              {traje.disponible && (
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <button className="bg-gold text-graphite text-sm font-bold px-5 py-2 rounded-xl shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-transform duration-200">
                    Alquilar Ahora
                  </button>
                </div>
              )}
            </div>

            {/* Card body */}
            <div className="p-4">
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h3 className="font-semibold text-sm text-foreground truncate" style={{ fontFamily: "var(--font-outfit)" }}>
                    {traje.nombre}
                  </h3>
                  <p className="text-xs text-muted-foreground mt-0.5">{traje.danza}</p>
                </div>
                <Badge variant="outline" className="text-xs shrink-0 border-border">
                  T-{traje.talla}
                </Badge>
              </div>

              <div className="mt-3 flex items-center justify-between">
                <span className="text-base font-bold text-crimson" style={{ fontFamily: "var(--font-outfit)" }}>
                  {traje.precio}
                </span>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Ver detalle
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
