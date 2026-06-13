"use client";

import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";
import { SalesTrend } from "@/types";
import { formatCurrency } from "@/lib/utils/index";
import { format, parseISO, isValid } from "date-fns";

interface Props { data: SalesTrend[]; currency?: string; }

function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const isoDate = payload[0]?.payload?.label as string | undefined;
  const parsed  = isoDate ? parseISO(isoDate) : null;
  const dateStr = parsed && isValid(parsed) ? format(parsed, "MMM d, yyyy") : "";
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs text-muted-foreground mb-1">{dateStr}</p>
      <p className="text-sm font-bold text-sky-500">{formatCurrency(payload[0]?.value ?? 0, currency)}</p>
      <p className="text-xs text-muted-foreground">{payload[1]?.value ?? 0} orders</p>
    </div>
  );
}

export function RevenueChart({ data, currency = "USD" }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label:     d.date,
    shortDate: format(parseISO(d.date), "MMM d"),
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Revenue</h3>
          <p className="text-xs text-muted-foreground mt-0.5">Last 30 days</p>
        </div>
        <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <span className="w-2 h-2 rounded-full bg-sky-500" />Revenue
        </span>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
          <XAxis dataKey="shortDate" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={4} />
          <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
            tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
          <Tooltip content={<CustomTooltip currency={currency} />} />
          <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2}
            fill="url(#revenueGrad)" dot={false} activeDot={{ r: 4, fill: "#0ea5e9" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function RevenueChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-20 bg-muted rounded mb-1" />
        <div className="h-3 w-24 bg-muted rounded" />
      </div>
      <div className="h-[220px] bg-muted/50 rounded-xl" />
    </div>
  );
}