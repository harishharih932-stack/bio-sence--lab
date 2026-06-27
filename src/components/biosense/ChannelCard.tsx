import { statusFor, statusToken } from "@/lib/biosensor";
import { StatusBadge } from "./StatusBadge";
import { ProgressBar } from "./ProgressBar";

export type ChannelCardData = {
  channel_num: number;
  pathogen_name: string;
  infection_pct: number;
  wavelength_nm: number;
};

export function ChannelCard({
  data,
  selected,
  onClick,
}: {
  data: ChannelCardData;
  selected?: boolean;
  onClick?: () => void;
}) {
  const level = statusFor(data.infection_pct);
  const color = statusToken(level);
  const chId = `CH-${String(data.channel_num).padStart(2, "0")}`;
  return (
    <button
      type="button"
      onClick={onClick}
      className={`group flex flex-col gap-3 rounded-md border bg-card p-4 text-left transition-all hover:border-secondary/60 hover:shadow-sm ${
        selected ? "border-primary ring-2 ring-primary/15" : "border-border"
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <div className="text-xs font-semibold tracking-wider text-primary">{chId}</div>
          <div className="mt-0.5 text-sm font-medium text-foreground line-clamp-1">
            {data.pathogen_name}
          </div>
        </div>
        <StatusBadge level={level} />
      </div>

      <div className="flex items-end justify-between">
        <div>
          <div className="text-3xl font-bold tabular-nums leading-none" style={{ color }}>
            {data.infection_pct.toFixed(1)}
            <span className="ml-0.5 text-base font-medium text-muted-foreground">%</span>
          </div>
          <div className="mt-1 font-mono text-[11px] text-muted-foreground">
            λ {data.wavelength_nm.toFixed(1)} nm
          </div>
        </div>
      </div>

      <ProgressBar pct={data.infection_pct} />
    </button>
  );
}
