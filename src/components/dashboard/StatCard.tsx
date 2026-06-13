import { TrendingUp, TrendingDown, Minus, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/utils/index";
import { Sparkline } from "@/components/ui/Sparkline";

interface StatCardProps {
  title: string;
  value: number;
  change?: number;
  isCurrency?: boolean;
  icon: LucideIcon;
  iconColor: string;
  iconBg: string;
  prefix?: string;
  suffix?: string;
  currency?: string;
  /** Optional trend series for an inline sparkline. */
  sparkline?: number[];
  /** Sparkline stroke color (defaults to ocean blue). */
  sparklineColor?: string;
}

export function StatCard({
  title, value, change, isCurrency = false,
  icon: Icon, iconColor, iconBg, prefix = "", suffix = "",
  currency = "USD", sparkline, sparklineColor,
}: StatCardProps) {
  const isPositive = (change ?? 0) > 0;
  const isNeutral  = (change ?? 0) === 0;
  const TrendIcon  = isNeutral ? Minus : isPositive ? TrendingUp : TrendingDown;

  const displayValue = isCurrency
    ? formatCurrency(value, currency)
    : `${prefix}${value.toLocaleString()}${suffix}`;

  return (
    <div className="bg-card border border-border rounded-2xl p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between mb-4">
        <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">{title}</p>
        <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", iconBg)}>
          <Icon size={17} className={iconColor} />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
        {displayValue}
      </div>
      <div className="flex items-end justify-between gap-2">
        {change !== undefined ? (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium",
            isPositive ? "text-emerald-500" : isNeutral ? "text-muted-foreground" : "text-red-500"
          )}>
            <TrendIcon size={13} />
            <span>{isNeutral ? "No change" : `${Math.abs(change).toFixed(1)}% vs last month`}</span>
          </div>
        ) : <span />}
        {sparkline && sparkline.length > 1 && (
          <Sparkline data={sparkline} color={sparklineColor} className="opacity-90" />
        )}
      </div>
    </div>
  );
}

export function StatCardSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="flex items-start justify-between mb-4">
        <div className="h-3 w-20 bg-muted rounded" />
        <div className="w-9 h-9 bg-muted rounded-xl" />
      </div>
      <div className="h-7 w-28 bg-muted rounded mb-2" />
      <div className="h-3 w-36 bg-muted rounded" />
    </div>
  );
}