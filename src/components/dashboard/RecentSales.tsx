import { formatCurrency, formatRelativeTime } from "@/lib/utils/index";
import { CreditCard, Banknote, Smartphone, Building } from "lucide-react";
import { cn } from "@/lib/utils";

interface Sale {
  id: string;
  sale_number: string;
  total_amount: number;
  payment_method: string;
  status: string;
  created_at: string;
  customers: { name: string } | null;
}

const paymentIcons: Record<string, React.ElementType> = {
  card: CreditCard, cash: Banknote, mobile_money: Smartphone, bank_transfer: Building,
};

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled: "bg-red-500/15 text-red-600 dark:text-red-400",
  refunded:  "bg-muted text-muted-foreground",
};

interface Props { data: Sale[]; currency?: string; }

export function RecentSales({ data, currency = "USD" }: Props) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-5">
        <h3 className="text-sm font-semibold text-foreground">Recent Sales</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Latest transactions</p>
      </div>
      {data.length === 0 ? (
        <div className="py-12 text-center text-muted-foreground text-sm">No sales yet</div>
      ) : (
        <div className="space-y-1">
          {data.map((sale) => {
            const PayIcon = paymentIcons[sale.payment_method] ?? Banknote;
            return (
              <div key={sale.id} className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-accent transition-colors">
                <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                  <PayIcon size={14} className="text-muted-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-foreground font-medium truncate">
                    {sale.customers?.name ?? "Walk-in"}
                  </div>
                  <div className="text-xs text-muted-foreground">{sale.sale_number}</div>
                </div>
                <div className="text-right flex-shrink-0">
                  <div className="text-sm font-semibold text-foreground">
                    {formatCurrency(sale.total_amount, currency)}
                  </div>
                  <div className="text-xs text-muted-foreground">{formatRelativeTime(sale.created_at)}</div>
                </div>
                <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize hidden sm:inline-flex", statusColors[sale.status] ?? statusColors.completed)}>
                  {sale.status}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export function RecentSalesSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="mb-5">
        <div className="h-4 w-24 bg-muted rounded mb-1" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="space-y-1">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3 px-3 py-2.5">
            <div className="w-8 h-8 bg-muted rounded-lg flex-shrink-0" />
            <div className="flex-1">
              <div className="h-3.5 w-24 bg-muted rounded mb-1" />
              <div className="h-2.5 w-16 bg-muted/60 rounded" />
            </div>
            <div className="text-right">
              <div className="h-3.5 w-16 bg-muted rounded mb-1" />
              <div className="h-2.5 w-12 bg-muted/60 rounded" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}