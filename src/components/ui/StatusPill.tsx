import { cn } from "@/lib/utils";

export type PillTone = "success" | "warning" | "danger" | "info" | "neutral";

const toneClasses: Record<PillTone, string> = {
  success: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  warning: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  danger:  "bg-rose-500/15 text-rose-600 dark:text-rose-400",
  info:    "bg-sky-500/15 text-sky-600 dark:text-sky-400",
  neutral: "bg-muted text-muted-foreground",
};

interface StatusPillProps {
  label: string;
  tone?: PillTone;
  icon?: React.ReactNode;
  className?: string;
}

/** Small colored status badge. Presentational only. */
export function StatusPill({ label, tone = "neutral", icon, className }: StatusPillProps) {
  return (
    <span className={cn(
      "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium capitalize",
      toneClasses[tone],
      className,
    )}>
      {icon}
      {label}
    </span>
  );
}
