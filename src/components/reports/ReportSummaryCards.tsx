import { DollarSign, TrendingUp, TrendingDown, Package, ShoppingCart, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface Summary {
  month_revenue: number;
  month_profit: number;
  month_expenses: number;
  year_revenue: number;
  stock_value: number;
  total_sales_mtd: number;
}

interface Props { summary: Summary; currency?: string; }

export function ReportSummaryCards({ summary, currency = "USD" }: Props) {
  const cards = [
    {
      title:   "Revenue (MTD)",
      value:   formatCurrency(summary.month_revenue, currency),
      icon:    DollarSign,
      iconBg:  "bg-sky-500/15",
      iconColor: "text-sky-500",
      sub:     `${formatCurrency(summary.year_revenue, currency)} YTD`,
    },
    {
      title:   "Profit (MTD)",
      value:   formatCurrency(summary.month_profit, currency),
      icon:    summary.month_profit >= 0 ? TrendingUp : TrendingDown,
      iconBg:  summary.month_profit >= 0 ? "bg-emerald-500/15" : "bg-red-500/15",
      iconColor: summary.month_profit >= 0 ? "text-emerald-500" : "text-red-500",
      sub:     `Margin: ${summary.month_revenue > 0 ? ((summary.month_profit / summary.month_revenue) * 100).toFixed(1) : 0}%`,
    },
    {
      title:   "Expenses (MTD)",
      value:   formatCurrency(summary.month_expenses, currency),
      icon:    TrendingDown,
      iconBg:  "bg-rose-500/15",
      iconColor: "text-rose-500",
      sub:     "This month",
    },
    {
      title:   "Sales (MTD)",
      value:   summary.total_sales_mtd.toString(),
      icon:    ShoppingCart,
      iconBg:  "bg-amber-500/15",
      iconColor: "text-amber-500",
      sub:     "Transactions",
    },
    {
      title:   "Stock Value",
      value:   formatCurrency(summary.stock_value, currency),
      icon:    Package,
      iconBg:  "bg-violet-500/15",
      iconColor: "text-violet-500",
      sub:     "At cost price",
    },
    {
      title:   "Period",
      value:   new Date().toLocaleDateString("en-US", { month: "long", year: "numeric" }),
      icon:    Calendar,
      iconBg:  "bg-sky-500/15",
      iconColor: "text-sky-500",
      sub:     "Current reporting month",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map((card) => (
        <div key={card.title} className="bg-card border border-border rounded-2xl p-5">
          <div className="flex items-start justify-between mb-3">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{card.title}</p>
            <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0", card.iconBg)}>
              <card.icon size={17} className={card.iconColor} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground mb-1" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {card.value}
          </p>
          <p className="text-xs text-muted-foreground">{card.sub}</p>
        </div>
      ))}
    </div>
  );
}

export function ReportSummaryCardsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="flex items-start justify-between mb-3">
            <div className="h-3 w-24 bg-muted rounded" />
            <div className="w-9 h-9 bg-muted rounded-xl" />
          </div>
          <div className="h-7 w-28 bg-muted rounded mb-1" />
          <div className="h-3 w-20 bg-muted rounded" />
        </div>
      ))}
    </div>
  );
}
