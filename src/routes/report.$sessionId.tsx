import { createFileRoute, Link, useRouter } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Printer, ArrowLeft, Activity } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { actionFor, statusFor, statusToken } from "@/lib/biosensor";

type SessionRow = {
  id: string;
  patient_id: string;
  sample_type: string;
  created_at: string;
};
type ResultRow = {
  channel_num: number;
  pathogen_name: string;
  infection_pct: number;
  wavelength_nm: number;
  k_value: number;
  neff_shift: number;
  confidence_score: number;
};

export const Route = createFileRoute("/report/$sessionId")({
  head: ({ params }) => ({
    meta: [
      { title: `Report ${params.sessionId.slice(0, 8)} — BioSense LOC` },
      { name: "description", content: "Printable diagnostic report for a BioSense LOC test session." },
      { property: "og:title", content: "BioSense LOC — Diagnostic Report" },
    ],
  }),
  component: ReportPage,
  errorComponent: ({ error, reset }) => {
    const router = useRouter();
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-primary">Report could not load</h1>
        <p className="mt-2 text-sm text-muted-foreground">{error.message}</p>
        <div className="mt-6 flex justify-center gap-2">
          <button onClick={() => { router.invalidate(); reset(); }} className="rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">
            Try again
          </button>
          <Link to="/dashboard" className="rounded border border-border px-4 py-2 text-sm font-semibold text-primary">
            Back to dashboard
          </Link>
        </div>
      </main>
    );
  },
  notFoundComponent: () => (
    <main className="mx-auto max-w-3xl px-6 py-16 text-center">
      <h1 className="text-xl font-semibold text-primary">Session not found</h1>
      <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-secondary hover:underline">
        Back to dashboard
      </Link>
    </main>
  ),
});

function ReportPage() {
  const { sessionId } = Route.useParams();
  const [session, setSession] = useState<SessionRow | null>(null);
  const [rows, setRows] = useState<ResultRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      const [s, r] = await Promise.all([
        supabase.from("test_sessions").select("*").eq("id", sessionId).maybeSingle(),
        supabase.from("channel_results").select("*").eq("session_id", sessionId).order("channel_num"),
      ]);
      if (!active) return;
      if (s.error) { setError(s.error.message); return; }
      if (r.error) { setError(r.error.message); return; }
      setSession(s.data as SessionRow | null);
      setRows((r.data as ResultRow[]) ?? []);
    })();
    return () => { active = false; };
  }, [sessionId]);

  if (error) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-center text-destructive">{error}</main>;
  }
  if (!session || !rows) {
    return <main className="mx-auto max-w-3xl px-6 py-16 text-center text-muted-foreground">Loading report…</main>;
  }
  if (!session.id) {
    return (
      <main className="mx-auto max-w-3xl px-6 py-16 text-center">
        <h1 className="text-xl font-semibold text-primary">Session not found</h1>
        <Link to="/dashboard" className="mt-4 inline-block text-sm font-semibold text-secondary hover:underline">
          Back to dashboard
        </Link>
      </main>
    );
  }

  const dt = new Date(session.created_at);

  return (
    <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6">
      {/* Toolbar (hidden in print) */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3 no-print">
        <Link to="/dashboard" className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline">
          <ArrowLeft className="h-4 w-4" /> Back to dashboard
        </Link>
        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
        >
          <Printer className="h-4 w-4" /> Export PDF
        </button>
      </div>

      <article className="rounded-md border border-border bg-background p-8 shadow-sm print:border-0 print:p-0 print:shadow-none">
        {/* Header */}
        <header className="flex flex-wrap items-start justify-between gap-4 border-b border-border pb-5">
          <div className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded bg-primary text-primary-foreground">
              <Activity className="h-5 w-5" />
            </span>
            <div>
              <div className="text-lg font-semibold text-primary">BioSense LOC</div>
              <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
                Photonic Biosensor Diagnostic Report
              </div>
            </div>
          </div>
          <div className="text-right text-xs">
            <Row k="Session" v={<span className="font-mono">{session.id.slice(0, 8)}</span>} />
            <Row k="Patient ID" v={<span className="font-mono">{session.patient_id}</span>} />
            <Row k="Sample" v={session.sample_type} />
            <Row k="Date" v={dt.toLocaleString()} />
          </div>
        </header>

        {/* Summary */}
        <section className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {(["CLEAR", "LOW", "MODERATE", "HIGH", "CRITICAL"] as const).map((lvl) => {
            const count = rows.filter((r) => statusFor(r.infection_pct) === lvl).length;
            return (
              <div key={lvl} className="rounded border border-border bg-card p-3">
                <div className="text-[10px] font-semibold uppercase tracking-wider" style={{ color: statusToken(lvl) }}>
                  {lvl}
                </div>
                <div className="mt-1 text-xl font-bold tabular-nums text-primary">{count}</div>
              </div>
            );
          })}
        </section>

        {/* Results table */}
        <section className="mt-6 overflow-hidden rounded border border-border">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-card text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-2">Channel</th>
                <th className="px-3 py-2">Pathogen</th>
                <th className="px-3 py-2 text-right">Infection %</th>
                <th className="px-3 py-2 text-right">Wavelength</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Recommended action</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const level = statusFor(r.infection_pct);
                const color = statusToken(level);
                const pathogen = { channel: r.channel_num, id: `CH-${String(r.channel_num).padStart(2, "0")}`, name: r.pathogen_name, wavelength: r.wavelength_nm, shortAction: "" };
                return (
                  <tr key={r.channel_num} className="border-t border-border align-top">
                    <td className="px-3 py-2 font-mono text-xs text-primary">
                      CH-{String(r.channel_num).padStart(2, "0")}
                    </td>
                    <td className="px-3 py-2 font-medium">{r.pathogen_name}</td>
                    <td className="px-3 py-2 text-right font-mono tabular-nums" style={{ color }}>
                      {r.infection_pct.toFixed(1)}%
                    </td>
                    <td className="px-3 py-2 text-right font-mono text-xs text-muted-foreground">
                      {r.wavelength_nm.toFixed(2)} nm
                    </td>
                    <td className="px-3 py-2">
                      <span
                        className="inline-flex items-center gap-1.5 rounded px-2 py-0.5 text-[10px] font-semibold tracking-wider"
                        style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, white)`, color }}
                      >
                        <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
                        {level}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-xs text-muted-foreground">
                      {actionFor(level, { ...pathogen, shortAction: defaultActionFor(r.pathogen_name) })}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>

        <footer className="mt-6 border-t border-border pt-4 text-[11px] text-muted-foreground">
          <p>
            This report is generated by a research-grade simulation of the BioSense LOC photonic
            biosensor. Results have been AI-verified using on-chip noise rejection. For research
            use only — not for clinical diagnosis.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-8 print:mt-12">
            <div>
              <div className="h-px bg-foreground/40" />
              <div className="mt-1 text-[10px]">Reviewing physician</div>
            </div>
            <div>
              <div className="h-px bg-foreground/40" />
              <div className="mt-1 text-[10px]">Date / signature</div>
            </div>
          </div>
        </footer>
      </article>
    </main>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return (
    <div className="flex items-baseline justify-end gap-2">
      <span className="text-[10px] uppercase tracking-wider text-muted-foreground">{k}</span>
      <span className="font-medium">{v}</span>
    </div>
  );
}

function defaultActionFor(name: string): string {
  // mirror short actions from PATHOGENS by name (kept local to avoid extra imports)
  const map: Record<string, string> = {
    "SARS-CoV-2": "Isolate; PCR confirm; antiviral consult",
    "Influenza A": "Oseltamivir within 48h; rest & fluids",
    "Influenza B": "Symptomatic care; antiviral if severe",
    "RSV": "Supportive care; monitor respiratory rate",
    "Streptococcus pneumoniae": "Amoxicillin; chest imaging if indicated",
    "Mycobacterium tuberculosis": "Notify public health; RIPE regimen",
    "E. coli O157:H7": "Hydration; avoid antibiotics (HUS risk)",
    "Salmonella typhi": "Ceftriaxone or azithromycin",
    "Staphylococcus aureus": "Culture & sensitivity; consider MRSA coverage",
    "HIV-1": "Confirmatory test; initiate ART consult",
  };
  return map[name] ?? "Clinical correlation recommended";
}
