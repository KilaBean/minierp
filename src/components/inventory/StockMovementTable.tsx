import { formatDateTime } from "@/lib/utils/index";
import { ArrowDownCircle, ArrowUpCircle, RefreshCw, ShoppingCart, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Movement {
  id: string; type: string; quantity: number;
  reference: string | null; notes: string | null; created_at: string;
}

const typeConfig: Record<string, { label: string; icon: React.ElementType; color: string; bg: string }> = {
  in:         { label: "Stock In",   icon: ArrowUpCircle,   color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-500/15" },
  out:        { label: "Stock Out",  icon: ArrowDownCircle, color: "text-red-600 dark:text-red-400",         bg: "bg-red-500/15"     },
  adjustment: { label: "Adjustment", icon: RefreshCw,       color: "text-sky-600 dark:text-sky-400",   bg: "bg-sky-500/15"  },
  sale:       { label: "Sale",       icon: ShoppingCart,    color: "text-amber-600 dark:text-amber-400",     bg: "bg-amber-500/15"   },
  return:     { label: "Return",     icon: RotateCcw,       color: "text-violet-600 dark:text-violet-400",   bg: "bg-violet-500/15"  },
};

export function StockMovementTable({ data }: { data: Movement[] }) {
  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-12 text-center">
        <RefreshCw size={28} className="text-muted-foreground/30 mx-auto mb-3" />
        <p className="text-sm text-muted-foreground">No stock movements recorded yet</p>
      </div>
    );
  }
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Type","Quantity","Reference / Notes","Date"].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((m) => {
              const cfg = typeConfig[m.type] ?? typeConfig.adjustment;
              const isPositive = ["in","return"].includes(m.type);
              return (
                <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div className={cn("inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-xs font-medium", cfg.bg, cfg.color)}>
                      <cfg.icon size={12} />{cfg.label}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-bold", isPositive ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400")}>
                      {isPositive ? "+" : "-"}{Math.abs(m.quantity)}
                    </span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    <div className="text-sm text-foreground truncate">{m.reference ?? "—"}</div>
                    {m.notes && <div className="text-xs text-muted-foreground truncate">{m.notes}</div>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">
                    {formatDateTime(m.created_at)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
