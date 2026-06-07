import { AlertTriangle, Package } from "lucide-react";
import Link from "next/link";

interface LowStockItem {
  id: string;
  name: string;
  quantity: number;
  low_stock_threshold: number;
  sku: string | null;
}

export function LowStockAlert({ data }: { data: LowStockItem[] }) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-2">
          <AlertTriangle size={15} className="text-amber-500" />
          <h3 className="text-sm font-semibold text-foreground">Low Stock</h3>
          {data.length > 0 && (
            <span className="text-xs px-1.5 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 font-medium">
              {data.length}
            </span>
          )}
        </div>
        <Link href="/dashboard/inventory" className="text-xs text-indigo-500 hover:text-indigo-400 transition-colors">
          View all
        </Link>
      </div>

      {data.length === 0 ? (
        <div className="py-8 text-center">
          <Package size={28} className="text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">All stock levels healthy</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((item) => {
            const pct = Math.min((item.quantity / item.low_stock_threshold) * 100, 100);
            const isCritical = item.quantity === 0;
            return (
              <div key={item.id}>
                <div className="flex items-center justify-between mb-1">
                  <div className="flex-1 min-w-0">
                    <span className="text-sm text-foreground/80 truncate block">{item.name}</span>
                    {item.sku && <span className="text-xs text-muted-foreground">{item.sku}</span>}
                  </div>
                  <div className="text-right flex-shrink-0 ml-3">
                    <span className={`text-sm font-bold ${isCritical ? "text-red-500" : "text-amber-500"}`}>
                      {item.quantity}
                    </span>
                    <span className="text-xs text-muted-foreground"> / {item.low_stock_threshold}</span>
                  </div>
                </div>
                <div className="h-1 bg-muted rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${isCritical ? "bg-red-500" : "bg-amber-500"}`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function LowStockAlertSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-center gap-2 mb-5">
        <div className="h-4 w-4 bg-muted rounded" />
        <div className="h-4 w-20 bg-muted rounded" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i}>
            <div className="flex justify-between mb-1">
              <div className="h-3.5 w-28 bg-muted rounded" />
              <div className="h-3.5 w-10 bg-muted rounded" />
            </div>
            <div className="h-1 bg-muted/60 rounded-full" />
          </div>
        ))}
      </div>
    </div>
  );
}