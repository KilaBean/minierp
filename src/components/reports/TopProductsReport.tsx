"use client";

import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface ProductRow {
  product_id: string;
  name: string;
  sku: string | null;
  category: string;
  units_sold: number;
  revenue: number;
}

interface Props { data: ProductRow[]; currency?: string; }

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b","#f43f5e","#ec4899","#14b8a6","#84cc16","#f97316"];

export function TopProductsReport({ data, currency = "USD" }: Props) {
  const maxRevenue = data[0]?.revenue ?? 1;

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border">
        <h3 className="text-sm font-semibold text-foreground">Top Products by Revenue</h3>
        <p className="text-xs text-muted-foreground mt-0.5">All time</p>
      </div>

      {data.length === 0 ? (
        <div className="py-16 text-center text-muted-foreground text-sm">No sales data yet</div>
      ) : (
        <div className="divide-y divide-border">
          {data.map((row, i) => (
            <div key={row.product_id} className="px-5 py-4 hover:bg-muted/20 transition-colors">
              <div className="flex items-start gap-4">
                {/* Rank */}
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5"
                  style={{ background: `${COLORS[i % COLORS.length]}20`, color: COLORS[i % COLORS.length] }}>
                  {i + 1}
                </span>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-4 mb-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">{row.name}</p>
                      <p className="text-xs text-muted-foreground">{row.category}{row.sku ? ` · ${row.sku}` : ""}</p>
                    </div>
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold text-foreground">{formatCurrency(row.revenue, currency)}</p>
                      <p className="text-xs text-muted-foreground">{row.units_sold} units</p>
                    </div>
                  </div>
                  {/* Progress bar */}
                  <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all"
                      style={{ width: `${(row.revenue / maxRevenue) * 100}%`, background: COLORS[i % COLORS.length] }} />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
