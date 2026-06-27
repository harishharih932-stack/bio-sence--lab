import {
  Area,
  AreaChart,
  CartesianGrid,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { CurvePoint } from "@/lib/biosensor";

export function BindingCurveChart({
  data,
  color = "var(--secondary)",
  height = 220,
  showNoise = false,
}: {
  data: CurvePoint[];
  color?: string;
  height?: number;
  showNoise?: boolean;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
        <defs>
          <linearGradient id="bcg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={color} stopOpacity={0.35} />
            <stop offset="100%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
        <XAxis
          dataKey="t"
          tickFormatter={(v) => `${v}s`}
          stroke="var(--muted-foreground)"
          fontSize={10}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <YAxis
          stroke="var(--muted-foreground)"
          fontSize={10}
          tickFormatter={(v) => v.toFixed(2)}
          tickLine={false}
          axisLine={{ stroke: "var(--border)" }}
        />
        <Tooltip
          contentStyle={{
            background: "white",
            border: "1px solid var(--border)",
            borderRadius: 6,
            fontSize: 12,
          }}
          labelFormatter={(l) => `t = ${Number(l).toFixed(1)} s`}
          formatter={(v: number, name: string) => [Number(v).toFixed(3), name]}
        />
        {showNoise && (
          <Line
            type="monotone"
            dataKey="noisy"
            stroke="var(--status-high)"
            strokeWidth={1}
            dot={false}
            name="Raw signal"
            isAnimationActive={false}
          />
        )}
        {showNoise && (
          <Line
            type="monotone"
            dataKey="filtered"
            stroke="var(--accent)"
            strokeWidth={2}
            dot={false}
            name="AI filtered"
            isAnimationActive={false}
          />
        )}
        <Area
          type="monotone"
          dataKey="theta"
          stroke={color}
          strokeWidth={2}
          fill="url(#bcg)"
          name="θ(t) ideal"
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
