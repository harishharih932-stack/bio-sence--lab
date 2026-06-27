// BioSense LOC — domain constants & simulation math

export type Pathogen = {
  channel: number;
  id: string;
  name: string;
  wavelength: number; // nm
  shortAction: string;
};

export const PATHOGENS: Pathogen[] = [
  { channel: 1,  id: "CH-01", name: "SARS-CoV-2",                  wavelength: 1531.2, shortAction: "Isolate; PCR confirm; antiviral consult" },
  { channel: 2,  id: "CH-02", name: "Influenza A",                 wavelength: 1534.5, shortAction: "Oseltamivir within 48h; rest & fluids" },
  { channel: 3,  id: "CH-03", name: "Influenza B",                 wavelength: 1537.8, shortAction: "Symptomatic care; antiviral if severe" },
  { channel: 4,  id: "CH-04", name: "RSV",                         wavelength: 1541.0, shortAction: "Supportive care; monitor respiratory rate" },
  { channel: 5,  id: "CH-05", name: "Streptococcus pneumoniae",    wavelength: 1544.3, shortAction: "Amoxicillin; chest imaging if indicated" },
  { channel: 6,  id: "CH-06", name: "Mycobacterium tuberculosis",  wavelength: 1547.6, shortAction: "Notify public health; RIPE regimen" },
  { channel: 7,  id: "CH-07", name: "E. coli O157:H7",             wavelength: 1550.9, shortAction: "Hydration; avoid antibiotics (HUS risk)" },
  { channel: 8,  id: "CH-08", name: "Salmonella typhi",            wavelength: 1554.2, shortAction: "Ceftriaxone or azithromycin" },
  { channel: 9,  id: "CH-09", name: "Staphylococcus aureus",       wavelength: 1557.5, shortAction: "Culture & sensitivity; consider MRSA coverage" },
  { channel: 10, id: "CH-10", name: "HIV-1",                       wavelength: 1560.8, shortAction: "Confirmatory test; initiate ART consult" },
];

export type StatusLevel = "CLEAR" | "LOW" | "MODERATE" | "HIGH" | "CRITICAL";

export function statusFor(pct: number): StatusLevel {
  if (pct <= 10) return "CLEAR";
  if (pct <= 30) return "LOW";
  if (pct <= 55) return "MODERATE";
  if (pct <= 80) return "HIGH";
  return "CRITICAL";
}

// Semantic token-based colors so charts & SVG stay in sync with theme
export function statusToken(level: StatusLevel): string {
  switch (level) {
    case "CLEAR":    return "var(--status-clear)";
    case "LOW":      return "var(--status-low)";
    case "MODERATE": return "var(--status-moderate)";
    case "HIGH":     return "var(--status-high)";
    case "CRITICAL": return "var(--status-critical)";
  }
}

export function colorForPct(pct: number): string {
  return statusToken(statusFor(pct));
}

export function actionFor(level: StatusLevel, p: Pathogen): string {
  if (level === "CLEAR") return "No action required";
  if (level === "LOW") return `Monitor; retest if symptomatic`;
  return p.shortAction;
}

// Deterministic pseudo-random from string (so a patient ID can seed plausible results)
export function hashSeed(s: string): number {
  let h = 2166136261 >>> 0;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function mulberry32(seed: number) {
  let a = seed || 1;
  return () => {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Langmuir binding kinetics:
//   θ(t) = (kC) / (1 + kC) * (1 - exp( -(kC + k_d) * t ))
// We approximate concentration C from infection_pct (0..100), use small k_d.
export type CurvePoint = { t: number; theta: number; noisy?: number; filtered?: number };

export function langmuirCurve(opts: {
  pct: number;       // 0..100
  k?: number;        // association const (1/(nM·s)) scaled
  kd?: number;       // dissociation const
  duration?: number; // seconds
  points?: number;
  noise?: boolean;
  seed?: number;
}): CurvePoint[] {
  const { pct, k = 0.08, kd = 0.005, duration = 60, points = 60, noise = false, seed = 1 } = opts;
  const C = Math.max(pct, 0.1) / 10; // arbitrary nM-ish
  const kC = k * C;
  const thetaMax = kC / (1 + kC);
  const rand = mulberry32(seed);
  const out: CurvePoint[] = [];
  // simple EMA filter to demo AI rejection
  let ema = 0;
  const alpha = 0.25;
  for (let i = 0; i <= points; i++) {
    const t = (duration * i) / points;
    const theta = thetaMax * (1 - Math.exp(-(kC + kd) * t));
    const point: CurvePoint = { t, theta };
    if (noise) {
      const n = theta + (rand() - 0.5) * 0.18 * thetaMax + (rand() < 0.06 ? (rand() - 0.5) * 0.5 : 0);
      ema = i === 0 ? n : alpha * n + (1 - alpha) * ema;
      point.noisy = Math.max(0, n);
      point.filtered = Math.max(0, ema);
    }
    out.push(point);
  }
  return out;
}

export function neffShiftFor(pct: number): number {
  // neff shift Δn in 1e-3 units, scales with bound fraction
  return Number(((pct / 100) * 4.2 + 0.05).toFixed(3));
}

export function kValueFor(pct: number, seed = 1): number {
  const r = mulberry32(seed)();
  return Number((0.04 + (pct / 100) * 0.12 + r * 0.01).toFixed(4));
}

export function confidenceFor(pct: number, seed = 1): number {
  // higher confidence at extremes, lowest in the middle "ambiguous" band
  const r = mulberry32(seed)();
  const base = 88 + Math.abs(pct - 50) / 50 * 10;
  return Number(Math.min(99.5, base + r * 1.5).toFixed(1));
}

export function generateSessionResults(patientId: string, sampleType: string) {
  const rand = mulberry32(hashSeed(`${patientId}|${sampleType}|${Date.now()}`));
  return PATHOGENS.map((p) => {
    // Most channels low/clear, occasionally one or two flare up
    const flare = rand() < 0.18;
    const base = rand() * (flare ? 100 : 35);
    const pct = Number(base.toFixed(1));
    const seed = hashSeed(`${patientId}|${p.id}|${pct}`);
    return {
      channel_num: p.channel,
      pathogen_name: p.name,
      infection_pct: pct,
      wavelength_nm: p.wavelength,
      k_value: kValueFor(pct, seed),
      neff_shift: neffShiftFor(pct),
      confidence_score: confidenceFor(pct, seed),
    };
  });
}

export type ChannelResult = ReturnType<typeof generateSessionResults>[number];
