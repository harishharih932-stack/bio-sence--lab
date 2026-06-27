import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Play, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  PATHOGENS,
  generateSessionResults,
  langmuirCurve,
  statusFor,
  statusToken,
  type ChannelResult,
} from "@/lib/biosensor";
import { ChannelCard } from "@/components/biosense/ChannelCard";
import { StatusBadge } from "@/components/biosense/StatusBadge";
import { BindingCurveChart } from "@/components/biosense/BindingCurveChart";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Live Dashboard — BioSense LOC" },
      { name: "description", content: "Real-time multiplexed channel readings across 10 pathogens." },
      { property: "og:title", content: "BioSense LOC — Live Dashboard" },
      { property: "og:description", content: "10 channels, live photonic readings, AI-verified." },
    ],
  }),
  component: DashboardPage,
});

const SAMPLE_TYPES = ["Whole Blood", "Saliva", "Nasal Swab", "Urine", "Plasma"];

function DashboardPage() {
  const navigate = useNavigate();
  const [patientId, setPatientId] = useState("PT-00421");
  const [sampleType, setSampleType] = useState(SAMPLE_TYPES[0]);
  const [results, setResults] = useState<ChannelResult[] | null>(null);
  const [selected, setSelected] = useState<number>(1);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const selectedResult = useMemo(
    () => results?.find((r) => r.channel_num === selected) ?? null,
    [results, selected],
  );

  const curve = useMemo(() => {
    const pct = selectedResult?.infection_pct ?? 0;
    return langmuirCurve({ pct, k: selectedResult?.k_value ? selectedResult.k_value * 4 : 0.08 });
  }, [selectedResult]);

  async function runTest() {
    if (!patientId.trim()) {
      setError("Patient ID is required");
      return;
    }
    setRunning(true);
    setError(null);
    try {
      const generated = generateSessionResults(patientId.trim(), sampleType);
      const { data: session, error: sErr } = await supabase
        .from("test_sessions")
        .insert({ patient_id: patientId.trim(), sample_type: sampleType })
        .select()
        .single();
      if (sErr || !session) throw sErr ?? new Error("Failed to create session");

      const rows = generated.map((g) => ({ session_id: session.id, ...g }));
      const { error: cErr } = await supabase.from("channel_results").insert(rows);
      if (cErr) throw cErr;

      setResults(generated);
      setSelected(1);
      // Offer "View report" via a banner; keep user on dashboard, but stash id
      sessionStorage.setItem("biosense:lastSession", session.id);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Unknown error";
      setError(msg);
    } finally {
      setRunning(false);
    }
  }

  const lastSessionId = typeof window !== "undefined" ? sessionStorage.getItem("biosense:lastSession") : null;

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top bar */}
      <div className="rounded-md border border-border bg-card p-4">
        <div className="grid gap-3 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Patient ID
            </label>
            <input
              value={patientId}
              onChange={(e) => setPatientId(e.target.value)}
              placeholder="PT-00421"
              className="w-full rounded border border-input bg-background px-3 py-2 font-mono text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-ring/30"
            />
          </div>
          <div>
            <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
              Sample type
            </label>
            <select
              value={sampleType}
              onChange={(e) => setSampleType(e.target.value)}
              className="w-full rounded border border-input bg-background px-3 py-2 text-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-ring/30"
            >
              {SAMPLE_TYPES.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
          <button
            onClick={runTest}
            disabled={running}
            className="inline-flex items-center justify-center gap-2 rounded bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90 disabled:opacity-60"
          >
            {running ? <Loader2 className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4" />}
            {running ? "Running…" : "Run Test"}
          </button>
        </div>
        {error && <p className="mt-2 text-sm text-destructive">{error}</p>}
        {lastSessionId && results && (
          <div className="mt-3 flex flex-wrap items-center justify-between gap-2 rounded border border-border bg-surface-tint px-3 py-2">
            <span className="text-xs text-muted-foreground">
              Last session <span className="font-mono text-primary">{lastSessionId.slice(0, 8)}</span> ready
            </span>
            <button
              className="text-xs font-semibold text-primary hover:underline"
              onClick={() => navigate({ to: "/report/$sessionId", params: { sessionId: lastSessionId } })}
            >
              View report →
            </button>
          </div>
        )}
      </div>

      {/* Grid + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <section>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Channels (10)
            </h2>
            {!results && (
              <span className="text-xs text-muted-foreground">
                Press <span className="font-semibold text-primary">Run Test</span> to populate readings.
              </span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4">
            {(results ?? PATHOGENS.map((p) => ({
              channel_num: p.channel,
              pathogen_name: p.name,
              infection_pct: 0,
              wavelength_nm: p.wavelength,
              k_value: 0,
              neff_shift: 0,
              confidence_score: 0,
            }))).map((r) => (
              <ChannelCard
                key={r.channel_num}
                data={r}
                selected={selected === r.channel_num}
                onClick={() => setSelected(r.channel_num)}
              />
            ))}
          </div>
        </section>

        <aside className="rounded-md border border-border bg-card p-5">
          {selectedResult ? (
            <ChannelDetail r={selectedResult} curve={curve} />
          ) : (
            <div className="flex h-full min-h-[300px] flex-col items-center justify-center text-center text-sm text-muted-foreground">
              <div className="mb-2 font-mono text-xs uppercase tracking-wider text-secondary">
                CH-{String(selected).padStart(2, "0")}
              </div>
              <p>Channel details and binding kinetics appear here after a test run.</p>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}

function ChannelDetail({
  r,
  curve,
}: {
  r: ChannelResult;
  curve: ReturnType<typeof langmuirCurve>;
}) {
  const level = statusFor(r.infection_pct);
  const color = statusToken(level);
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="flex items-center justify-between">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-secondary">
              CH-{String(r.channel_num).padStart(2, "0")}
            </div>
            <h3 className="text-base font-semibold text-primary">{r.pathogen_name}</h3>
          </div>
          <StatusBadge level={level} size="md" />
        </div>
        <div className="mt-3 flex items-end gap-3">
          <span className="text-4xl font-bold tabular-nums" style={{ color }}>
            {r.infection_pct.toFixed(1)}%
          </span>
          <span className="pb-1 font-mono text-xs text-muted-foreground">
            λ {r.wavelength_nm.toFixed(2)} nm
          </span>
        </div>
      </div>

      <div className="rounded border border-border bg-background p-3">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Langmuir binding
          </span>
          <span className="font-mono text-[10px] text-muted-foreground">θ vs t</span>
        </div>
        <BindingCurveChart data={curve} color={color} height={180} />
      </div>

      <dl className="grid grid-cols-3 gap-2 text-center">
        <Stat label="Δneff" value={`${r.neff_shift.toFixed(3)}e-3`} />
        <Stat label="k" value={r.k_value.toFixed(4)} />
        <Stat label="conf." value={`${r.confidence_score.toFixed(1)}%`} />
      </dl>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-border bg-background p-2">
      <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 font-mono text-sm font-semibold text-primary">{value}</div>
    </div>
  );
}
