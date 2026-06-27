import { PATHOGENS, colorForPct } from "@/lib/biosensor";

export function SpectrumBar({ values }: { values: number[] }) {
  // values length must equal PATHOGENS length (10)
  return (
    <div className="rounded-md border border-border bg-card p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Channel spectrum
        </span>
        <span className="font-mono text-[11px] text-muted-foreground">1530 – 1561 nm</span>
      </div>
      <div className="flex h-32 items-end gap-2">
        {PATHOGENS.map((p, i) => {
          const v = values[i] ?? 0;
          const h = Math.max(4, (v / 100) * 100);
          return (
            <div key={p.id} className="flex flex-1 flex-col items-center justify-end gap-1">
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">
                {v.toFixed(0)}
              </span>
              <div
                className="w-full rounded-t"
                style={{ height: `${h}%`, backgroundColor: colorForPct(v), minHeight: 4 }}
                title={`${p.name} • ${v.toFixed(1)}%`}
              />
              <span className="text-[10px] font-medium text-primary">
                {String(p.channel).padStart(2, "0")}
              </span>
            </div>
          );
        })}
      </div>
      <div className="mt-2 flex justify-between font-mono text-[10px] text-muted-foreground">
        {PATHOGENS.map((p) => (
          <span key={p.id} className="flex-1 text-center">
            {p.wavelength.toFixed(1)}
          </span>
        ))}
      </div>
    </div>
  );
}
