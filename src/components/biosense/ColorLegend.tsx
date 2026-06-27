const stops = [
  { pct: "0%", label: "CLEAR", color: "var(--status-clear)" },
  { pct: "25%", label: "LOW", color: "var(--status-low)" },
  { pct: "50%", label: "MODERATE", color: "var(--status-moderate)" },
  { pct: "75%", label: "HIGH", color: "var(--status-high)" },
  { pct: "100%", label: "CRITICAL", color: "var(--status-critical)" },
];

export function ColorLegend() {
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Infection level
        </span>
        <span className="font-mono text-xs text-muted-foreground">0 → 100 %</span>
      </div>
      <div
        className="h-2.5 w-full rounded"
        style={{
          background:
            "linear-gradient(to right, var(--status-clear), var(--status-low), var(--status-moderate), var(--status-high), var(--status-critical))",
        }}
      />
      <div className="mt-2 grid grid-cols-5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
        {stops.map((s) => (
          <div key={s.label} className="flex flex-col items-start gap-0.5">
            <span style={{ color: s.color }}>{s.label}</span>
            <span className="font-mono">{s.pct}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
