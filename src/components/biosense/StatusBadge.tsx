import type { StatusLevel } from "@/lib/biosensor";
import { statusToken } from "@/lib/biosensor";

export function StatusBadge({ level, size = "sm" }: { level: StatusLevel; size?: "sm" | "md" }) {
  const color = statusToken(level);
  const padding = size === "md" ? "px-2.5 py-1 text-xs" : "px-2 py-0.5 text-[10px]";
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded font-semibold tracking-wider ${padding}`}
      style={{ backgroundColor: `color-mix(in oklab, ${color} 14%, white)`, color }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {level}
    </span>
  );
}
