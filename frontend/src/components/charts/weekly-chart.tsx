"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useTheme } from "next-themes";

export interface ChartDay {
  day: string;
  ingresos: number;
  egresos: number;
}

interface TooltipPayload {
  name: string;
  value: number;
  color: string;
}

function CustomTooltip({
  active,
  payload,
  label,
  isDark,
}: {
  active?: boolean;
  payload?: TooltipPayload[];
  label?: string;
  isDark: boolean;
}) {
  if (!active || !payload?.length) return null;
  return (
    <div
      className="rounded-xl shadow-xl p-3 text-sm border"
      style={{
        background: isDark ? "#1c1c1f" : "#ffffff",
        borderColor: isDark ? "rgba(255,255,255,0.08)" : "#e5e7eb",
        color: isDark ? "#f0f0f0" : "#111",
      }}
    >
      <p className="font-semibold mb-1.5">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} style={{ color: entry.color }} className="text-xs font-medium">
          {entry.name === "ingresos" ? "Ingresos" : "Egresos"}:{" "}
          <strong>Bs. {entry.value.toLocaleString("es-BO", { minimumFractionDigits: 2 })}</strong>
        </p>
      ))}
    </div>
  );
}

export function WeeklyChart({ data }: { data: ChartDay[] }) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const gridColor  = isDark ? "rgba(255,255,255,0.06)" : "#e5e7eb";
  const tickColor  = isDark ? "#6b7280" : "#9ca3af";
  const cursorFill = isDark ? "rgba(212,175,55,0.06)" : "rgba(153,27,27,0.05)";

  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={data} barSize={14} barGap={3}>
        <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
        <XAxis
          dataKey="day"
          tick={{ fontSize: 11, fill: tickColor }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 10, fill: tickColor }}
          axisLine={false}
          tickLine={false}
          width={30}
          tickFormatter={(v: number) => v >= 1000 ? `${(v / 1000).toFixed(0)}k` : String(v)}
        />
        <Tooltip
          content={(props) => (
            <CustomTooltip
              active={props.active}
              payload={props.payload as TooltipPayload[] | undefined}
              label={props.label as string | undefined}
              isDark={isDark}
            />
          )}
          cursor={{ fill: cursorFill }}
        />
        <Bar dataKey="ingresos" fill={isDark ? "#D4AF37" : "#991B1B"} radius={[6, 6, 0, 0]} />
        <Bar dataKey="egresos"  fill={isDark ? "rgba(153,27,27,0.70)" : "#D4AF37"} radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
