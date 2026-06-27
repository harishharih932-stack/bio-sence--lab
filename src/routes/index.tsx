import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Droplet, Filter, Microscope, Cpu, ScanLine } from "lucide-react";
import { ColorLegend } from "@/components/biosense/ColorLegend";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BioSense LOC — 10 Pathogens. 1 Sample. 15 Minutes." },
      { name: "description", content: "A Lab-on-a-Chip photonic biosensor with AI-verified, multiplexed pathogen detection in under 15 minutes." },
      { property: "og:title", content: "BioSense LOC — Photonic Biosensor Diagnostics" },
      { property: "og:description", content: "10 channels. AI-verified. 15-minute results." },
    ],
  }),
  component: LandingPage,
});

const steps = [
  { icon: Droplet,    title: "Sample Injection",       desc: "0.5 mL biofluid loaded into the microfluidic inlet." },
  { icon: Filter,     title: "Microfluidic Sorting",   desc: "On-chip channels separate analytes into 10 lanes." },
  { icon: Microscope, title: "Biomolecular Capture",   desc: "Pathogen-specific aptamers bind target molecules." },
  { icon: ScanLine,   title: "Photonic Transduction",  desc: "Ring resonators shift λ as binding occurs." },
  { icon: Cpu,        title: "AI Diagnostics",         desc: "Neural model rejects noise and verifies result." },
];

const stats = [
  { v: "10",    l: "Channels" },
  { v: "<15",   l: "Minutes to result" },
  { v: "0.5",   l: "mL sample" },
  { v: "AI",    l: "Verified" },
];

function LandingPage() {
  return (
    <main>
      {/* HERO */}
      <section className="border-b border-border bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:py-28">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-5 inline-flex items-center gap-2 rounded border border-border bg-card px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-muted-foreground">
              <span className="h-1.5 w-1.5 rounded-full bg-status-low" />
              Photonic biosensor · v2.4
            </div>
            <h1 className="text-balance text-5xl font-bold leading-tight tracking-tight text-primary sm:text-6xl">
              10 Pathogens. 1 Sample. 15 Minutes.
            </h1>
            <p className="mx-auto mt-5 max-w-2xl text-balance text-lg text-muted-foreground">
              Lab-on-a-Chip photonic biosensor with AI-verified diagnostics.
              Multiplexed detection on a single microfluidic platform.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
              <Link
                to="/simulation"
                className="inline-flex items-center gap-2 rounded bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Run Simulation <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded border border-border bg-background px-5 py-2.5 text-sm font-semibold text-primary transition-colors hover:bg-card"
              >
                Open Live Dashboard
              </Link>
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="border-t border-border" style={{ backgroundColor: "var(--surface-tint)" }}>
          <div className="mx-auto grid max-w-7xl grid-cols-2 divide-x divide-border px-4 sm:grid-cols-4 sm:px-6">
            {stats.map((s) => (
              <div key={s.l} className="px-4 py-6 text-center">
                <div className="text-3xl font-bold tabular-nums text-primary">{s.v}</div>
                <div className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
                  {s.l}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6">
        <div className="mb-10 max-w-2xl">
          <div className="font-mono text-xs uppercase tracking-wider text-secondary">Workflow</div>
          <h2 className="mt-2 text-3xl font-semibold tracking-tight text-primary">How it works</h2>
          <p className="mt-2 text-muted-foreground">
            From sample to AI-verified result in five integrated stages.
          </p>
        </div>

        <ol className="relative grid gap-6 md:grid-cols-5">
          <div
            className="pointer-events-none absolute left-0 right-0 top-5 hidden h-px md:block"
            style={{
              background:
                "repeating-linear-gradient(to right, var(--border) 0 6px, transparent 6px 12px)",
            }}
            aria-hidden
          />
          {steps.map((s, i) => (
            <li key={s.title} className="relative flex flex-col gap-3 rounded-md border border-border bg-card p-5">
              <div className="flex items-center gap-3">
                <div className="relative z-10 grid h-10 w-10 place-items-center rounded bg-primary text-primary-foreground">
                  <s.icon className="h-5 w-5" />
                </div>
                <span className="font-mono text-xs text-muted-foreground">STEP {i + 1}</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-primary">{s.title}</div>
                <p className="mt-1 text-sm text-muted-foreground">{s.desc}</p>
              </div>
            </li>
          ))}
        </ol>
      </section>

      {/* LEGEND + CTA */}
      <section className="border-t border-border bg-background">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-16 sm:px-6 md:grid-cols-[1fr_1fr]">
          <ColorLegend />
          <div className="flex flex-col justify-center rounded-md border border-border bg-card p-6">
            <div className="font-mono text-xs uppercase tracking-wider text-secondary">Ready</div>
            <h3 className="mt-1 text-2xl font-semibold text-primary">
              Try the diagnostic console
            </h3>
            <p className="mt-2 text-sm text-muted-foreground">
              Run a simulated 10-channel test, watch the binding kinetics in real time,
              and generate a printable clinical report.
            </p>
            <div className="mt-5 flex flex-wrap gap-3">
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
              >
                Live Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/simulation"
                className="inline-flex items-center gap-2 rounded border border-border bg-background px-4 py-2 text-sm font-semibold text-primary hover:bg-surface-tint"
              >
                Simulation
              </Link>
            </div>
          </div>
        </div>
      </section>

      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6">
          BioSense LOC · For research use only. Not for clinical diagnosis.
        </div>
      </footer>
    </main>
  );
}
