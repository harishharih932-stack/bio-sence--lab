export function ProgressBar({ pct }: { pct: number }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div className="h-1.5 w-full overflow-hidden rounded bg-muted">
      <div
        className="h-full rounded"
        style={{
          width: `${clamped}%`,
          background:
            "linear-gradient(to right, var(--status-clear), var(--status-low), var(--status-moderate), var(--status-high), var(--status-critical))",
        }}
      />
    </div>
  );
}
