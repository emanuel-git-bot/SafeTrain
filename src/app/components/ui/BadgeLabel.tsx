// ─── Badge Label ─────────────────────────────────────────────────────────────

import { cn } from "../../lib/utils";
import type { ReactNode } from "react";

type BadgeVariant = "default" | "amber" | "green" | "red" | "blue" | "gray" | "purple";

const VARIANT_STYLES: Record<BadgeVariant, string> = {
  default: "bg-muted text-muted-foreground",
  amber: "bg-amber-500/15 text-amber-400 border border-amber-500/20",
  green: "bg-emerald-500/15 text-emerald-400 border border-emerald-500/20",
  red: "bg-red-500/15 text-red-400 border border-red-500/20",
  blue: "bg-blue-500/15 text-blue-400 border border-blue-500/20",
  gray: "bg-white/5 text-slate-400 border border-white/10",
  purple: "bg-purple-500/15 text-purple-400 border border-purple-500/20",
};

export function BadgeLabel({
  children,
  variant = "default",
}: {
  children: ReactNode;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-mono font-medium",
        VARIANT_STYLES[variant]
      )}
    >
      {children}
    </span>
  );
}
