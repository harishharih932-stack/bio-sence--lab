import { Link } from "@tanstack/react-router";
import { Activity } from "lucide-react";

const nav = [
  { to: "/", label: "Overview" },
  { to: "/dashboard", label: "Dashboard" },
  { to: "/simulation", label: "Simulation" },
] as const;

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30 border-b border-border bg-background/95 backdrop-blur no-print">
      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span
            className="grid h-7 w-7 place-items-center rounded bg-primary text-primary-foreground"
            aria-hidden
          >
            <Activity className="h-4 w-4" />
          </span>
          <div className="leading-tight">
            <div className="text-sm font-semibold tracking-tight text-primary">BioSense LOC</div>
            <div className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              Photonic Diagnostics
            </div>
          </div>
        </Link>
        <nav className="flex items-center gap-1">
          {nav.map((n) => (
            <Link
              key={n.to}
              to={n.to}
              activeOptions={{ exact: true }}
              activeProps={{ className: "bg-surface-tint text-primary" }}
              inactiveProps={{ className: "text-muted-foreground hover:text-primary" }}
              className="rounded px-3 py-1.5 text-sm font-medium transition-colors"
            >
              {n.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
