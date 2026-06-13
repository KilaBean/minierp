import Link from "next/link";
import { cn } from "@/lib/utils";

export interface Breadcrumb {
  label: string;
  href?: string;
}

interface SummaryStat {
  label: string;
  value: string;
}

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  breadcrumbs?: Breadcrumb[];
  /** Right-aligned actions (buttons, dialogs). */
  action?: React.ReactNode;
  /** Optional summary strip rendered below the header row. */
  stats?: SummaryStat[];
  className?: string;
}

/**
 * Standardized page header used across all dashboard pages.
 * Presentational only — receives already-computed values.
 */
export function PageHeader({ title, subtitle, breadcrumbs, action, stats, className }: PageHeaderProps) {
  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          {breadcrumbs && breadcrumbs.length > 0 && (
            <nav className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1" aria-label="Breadcrumb">
              {breadcrumbs.map((b, i) => (
                <span key={i} className="flex items-center gap-1.5">
                  {b.href ? (
                    <Link href={b.href} className="hover:text-foreground transition-colors">{b.label}</Link>
                  ) : (
                    <span>{b.label}</span>
                  )}
                  {i < breadcrumbs.length - 1 && <span className="text-muted-foreground/40">/</span>}
                </span>
              ))}
            </nav>
          )}
          <h2 className="text-xl font-bold text-foreground truncate" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {title}
          </h2>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5 truncate">{subtitle}</p>}
        </div>
        {action && <div className="flex items-center gap-2 flex-shrink-0">{action}</div>}
      </div>

      {stats && stats.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          {stats.map((s) => (
            <div key={s.label} className="bg-muted/50 border border-border rounded-xl px-4 py-3">
              <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{s.label}</div>
              <div className="text-lg font-bold text-foreground mt-0.5 tabular-nums">{s.value}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
