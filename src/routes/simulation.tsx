import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  PATHOGENS,
  langmuirCurve,
  statusFor,
  statusToken,
  type CurvePoint,
} from "@/lib/biosensor";
import { BindingCurveChart } from "@/components/biosense/BindingCurveChart";
import { SpectrumBar } from "@/components/biosense/SpectrumBar";
import { StatusBadge } from "@/components/biosense/StatusBadge";

export const Route = createFileRoute("/simulation")({
  head: () => ({
    meta: [
      { title: "Simulation — BioSense LOC" },
      { name: "description", content: "Tune 10 pathogen channels and watch photonic binding kinetics in real time." },
      { property: "og:title", content: "BioSense LOC — Simulation" },
      { property: "og:description", content: "Live Langmuir curves and AI noise rejection." },
    ],
  }),
  component: SimulationPage,
});

function SimulationPage() {
  const [values, setValues] = useState<number[]>(PATHOGENS.map(() => 0));
  const [activeIdx, setActiveIdx] = useState(0);
  const [noise, setNoise] = useState(false);

  const curve: CurvePoint[] = useMemo(
    () => langmuirCurve({ pct: values[activeIdx], noise, seed: activeIdx + 1 }),
    [values, activeIdx, noise],
  );

  function setVal(i: number, v: number) {
    setValues((prev) => {
      const next = [...prev];
      next[i] = v;
      return next;
    });
  }

  const activePath = PATHOGENS[activeIdx];
  const activeLevel = statusFor(values[activeIdx]);
  const activeColor = statusToken(activeLevel);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      <header className="mb-6">
        <div className="font-mono text-xs uppercase tracking-wider text-secondary">Simulation</div>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-primary">
          Channel signal simulator
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Adjust each pathogen's concentration and observe how the binding curve and channel spectrum respond.
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* Controls */}
        <aside className="rounded-md border border-border bg-card p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Pathogen controls
            </h2>
            <button
              onClick={() => setValues(PATHOGENS.map(() => 0))}
              className="text-[11px] font-medium text-secondary hover:underline"
            >
              Reset all
            </button>
          </div>
          <div className="flex flex-col gap-3">
            {PATHOGENS.map((p, i) => {
              const v = values[i];
              const level = statusFor(v);
              const color = statusToken(level);
              const active = i === activeIdx;
              return (
                <div
                  key={p.id}
                  onClick={() => setActiveIdx(i)}
                  className={`cursor-pointer rounded border p-2.5 transition-colors ${
                    active ? "border-primary bg-surface-tint" : "border-border bg-background"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-[10px] text-primary">{p.id}</span>
                        <span className="truncate text-xs font-medium">{p.name}</span>
                      </div>
                      <span className="font-mono text-[10px] text-muted-foreground">
                        λ {p.wavelength.toFixed(1)} nm
                      </span>
                    </div>
                    <div className="font-mono text-sm font-semibold tabular-nums" style={{ color }}>
                      {v.toFixed(0)}%
                    </div>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={100}
                    step={1}
                    value={v}
                    onChange={(e) => setVal(i, Number(e.target.value))}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-2 w-full accent-secondary"
                    style={{ accentColor: color }}
                  />
                </div>
              );
            })}
          </div>
        </aside>

        {/* Output */}
        <section className="flex flex-col gap-6">
          <div className="rounded-md border border-border bg-card p-5">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div>
                <div className="font-mono text-xs uppercase tracking-wider text-secondary">
                  {activePath.id}
                </div>
                <h3 className="text-lg font-semibold text-primary">{activePath.name}</h3>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge level={activeLevel} size="md" />
                <label className="flex cursor-pointer items-center gap-2 text-xs font-medium text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={noise}
                    onChange={(e) => setNoise(e.target.checked)}
                    className="h-4 w-4 accent-primary"
                  />
                  Noise injection + AI rejection
                </label>
              </div>
            </div>
            <BindingCurveChart data={curve} color={activeColor} showNoise={noise} height={280} />
            {noise && (
              <div className="mt-3 flex flex-wrap gap-4 text-[11px] text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm" style={{ background: "var(--status-high)" }} />
                  Raw photonic signal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm" style={{ background: "var(--accent)" }} />
                  AI-filtered output
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-3 rounded-sm" style={{ background: activeColor }} />
                  Ideal θ(t)
                </span>
              </div>
            )}
          </div>

          <SpectrumBar values={values} />
        </section>
      </div>
    </main>
  );
}
