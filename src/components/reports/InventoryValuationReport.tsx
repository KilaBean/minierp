import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";
import { Package } from "lucide-react";

interface ValuationRow {
  id: string;
  name: string;
  sku: string | null;
  category: string;
  quantity: number;
  cost_price: number;
  sell_price: number;
  cost_value: number;
  retail_value: number;
  potential_profit: number;
}

interface Props { data: ValuationRow[]; currency?: string; }

export function InventoryValuationReport({ data, currency = "USD" }: Props) {
  const totalCost    = data.reduce((s, r) => s + r.cost_value,        0);
  const totalRetail  = data.reduce((s, r) => s + r.retail_value,      0);
  const totalProfit  = data.reduce((s, r) => s + r.potential_profit,  0);

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="px-5 py-4 border-b border-border flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Inventory Valuation</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{data.length} active products</p>
        </div>
        <div className="flex items-center gap-6 text-sm">
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Cost Value</p>
            <p className="font-bold text-foreground">{formatCurrency(totalCost, currency)}</p>
          </div>
          <div className="text-right hidden sm:block">
            <p className="text-xs text-muted-foreground">Retail Value</p>
            <p className="font-bold text-foreground">{formatCurrency(totalRetail, currency)}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Potential Profit</p>
            <p className={cn("font-bold", totalProfit >= 0 ? "text-emerald-500" : "text-red-500")}>
              {formatCurrency(totalProfit, currency)}
            </p>
          </div>
        </div>
      </div>

      {data.length === 0 ? (
        <div className="py-16 text-center">
          <Package size={28} className="mx-auto mb-3 text-muted-foreground/30" />
          <p className="text-sm text-muted-foreground">No products in inventory</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border">
                {["Product","Category","Qty","Cost","Sell","Cost Value","Retail Value","Pot. Profit"].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row) => (
                <tr key={row.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-foreground truncate max-w-[180px]">{row.name}</p>
                    {row.sku && <p className="text-xs text-muted-foreground font-mono">{row.sku}</p>}
                  </td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{row.category}</td>
                  <td className="px-4 py-3 text-sm font-semibold text-foreground">{row.quantity}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatCurrency(row.cost_price, currency)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground">{formatCurrency(row.sell_price, currency)}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{formatCurrency(row.cost_value, currency)}</td>
                  <td className="px-4 py-3 text-sm text-foreground font-medium">{formatCurrency(row.retail_value, currency)}</td>
                  <td className="px-4 py-3">
                    <span className={cn("text-sm font-semibold", row.potential_profit >= 0 ? "text-emerald-500" : "text-red-500")}>
                      {formatCurrency(row.potential_profit, currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="border-t-2 border-border bg-muted/30">
              <tr>
                <td colSpan={5} className="px-4 py-3 text-sm font-bold text-foreground">Totals</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">{formatCurrency(totalCost, currency)}</td>
                <td className="px-4 py-3 text-sm font-bold text-foreground">{formatCurrency(totalRetail, currency)}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-sm font-bold", totalProfit >= 0 ? "text-emerald-500" : "text-red-500")}>
                    {formatCurrency(totalProfit, currency)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </div>
  );
}
