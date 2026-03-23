import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WeeklyChart } from "@/components/charts/weekly-chart";

const KPI_CARDS = [
  {
    label: "Fletes Activos",
    value: "24",
    change: "+3 esta semana",
    positive: true,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
      </svg>
    ),
    accent: "bg-crimson/10 text-crimson",
  },
  {
    label: "Prendas Alquiladas",
    value: "138",
    change: "+22 vs semana pasada",
    positive: true,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
      </svg>
    ),
    accent: "bg-gold/10 text-amber-700",
  },
  {
    label: "Ganancias Estimadas",
    value: "Bs. 8,450",
    change: "+12% vs mes anterior",
    positive: true,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    accent: "bg-coca/10 text-coca",
  },
  {
    label: "Devoluciones Pendientes",
    value: "7",
    change: "-2 desde ayer",
    positive: false,
    icon: (
      <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
      </svg>
    ),
    accent: "bg-orange-50 text-orange-600",
  },
];

const RECENT_MOVEMENTS = [
  { id: "ALQ-001", cliente: "Fraternidad Caporales Sur", prenda: "Traje Caporal Varón T-L", fecha: "20 Feb 2026", estado: "Activo" },
  { id: "ALQ-002", cliente: "Conjunto Morenada Central", prenda: "Traje Moreno T-XL", fecha: "19 Feb 2026", estado: "En Camino" },
  { id: "ALQ-003", cliente: "Ballet Tinku Oruro", prenda: "Pollera Tinku T-M", fecha: "19 Feb 2026", estado: "Devuelto" },
  { id: "ALQ-004", cliente: "Fraternidad Diablada Potosí", prenda: "Máscara Diablo Premium", fecha: "18 Feb 2026", estado: "Devolución Pendiente" },
  { id: "ALQ-005", cliente: "Agrupación Saya Afroboliviana", prenda: "Vestido Saya T-S", fecha: "17 Feb 2026", estado: "Activo" },
];

const STATUS_STYLES: Record<string, string> = {
  "Activo": "bg-coca/10 text-coca border-coca/20",
  "En Camino": "bg-gold/10 text-amber-700 border-gold/20",
  "Devuelto": "bg-gray-100 text-gray-600 border-gray-200",
  "Devolución Pendiente": "bg-orange-50 text-orange-700 border-orange-200",
};

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
          Dashboard
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Resumen general del sistema ·{" "}
          {new Date().toLocaleDateString("es-BO", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {KPI_CARDS.map((kpi) => (
          <div
            key={kpi.label}
            className="bg-card rounded-2xl border border-border p-5 shadow-sm hover:shadow-md transition-shadow"
          >
            <div className="flex items-start justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">{kpi.label}</p>
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${kpi.accent}`}>
                {kpi.icon}
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground" style={{ fontFamily: "var(--font-outfit)" }}>
              {kpi.value}
            </p>
            <p className={`text-xs mt-1 font-medium ${kpi.positive ? "text-coca" : "text-orange-600"}`}>
              {kpi.change}
            </p>
          </div>
        ))}
      </div>

      {/* Chart + Table row */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        {/* Recharts Bar Chart */}
        <div className="lg:col-span-2 bg-card rounded-2xl border border-border p-5 shadow-sm">
          <h2 className="text-base font-semibold mb-1" style={{ fontFamily: "var(--font-outfit)" }}>
            Alquileres esta semana
          </h2>
          <p className="text-xs text-muted-foreground mb-4">Prendas por día</p>

          {/* Legend */}
          <div className="flex items-center gap-4 mb-3">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-crimson inline-block" />
              Alquileres
            </span>
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <span className="w-3 h-3 rounded-sm bg-gold inline-block" />
              Devoluciones
            </span>
          </div>

          <WeeklyChart />

          {/* Aguayo accent line */}
          <div className="aguayo-stripe h-1 w-full mt-4 rounded-full opacity-60" />
        </div>

        {/* Recent movements table */}
        <div className="lg:col-span-3 bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-border flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold" style={{ fontFamily: "var(--font-outfit)" }}>
                Últimos Movimientos
              </h2>
              <p className="text-xs text-muted-foreground">Alquileres recientes</p>
            </div>
            <Badge variant="outline" className="text-xs border-crimson/30 text-crimson">
              {RECENT_MOVEMENTS.length} registros
            </Badge>
          </div>

          <Table>
            <TableHeader>
              <TableRow className="hover:bg-transparent border-border">
                <TableHead className="text-xs font-semibold text-muted-foreground w-20">ID</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Cliente</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground hidden lg:table-cell">Fecha</TableHead>
                <TableHead className="text-xs font-semibold text-muted-foreground">Estado</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {RECENT_MOVEMENTS.map((mov) => (
                <TableRow key={mov.id} className="border-border hover:bg-muted/40 transition-colors">
                  <TableCell className="font-mono text-xs text-muted-foreground">{mov.id}</TableCell>
                  <TableCell>
                    <p className="text-sm font-medium text-foreground truncate max-w-[160px]">{mov.cliente}</p>
                    <p className="text-xs text-muted-foreground truncate max-w-[160px]">{mov.prenda}</p>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground hidden lg:table-cell">{mov.fecha}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`text-xs font-medium ${STATUS_STYLES[mov.estado] ?? ""}`}
                    >
                      {mov.estado}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
}
