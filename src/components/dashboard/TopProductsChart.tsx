"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { TopProduct } from "@/types";
import { formatCurrency, truncate } from "@/lib/utils/index";

const COLORS = ["#6366f1","#8b5cf6","#06b6d4","#10b981","#f59e0b"];

interface Props { data: TopProduct[]; currency?: string; }

function CustomTooltip({ active, payload, currency }: any) {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as TopProduct;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl">
      <p className="text-xs font-medium text-foreground mb-1">{d.product_name}</p>
      <p className="text-sm font-bold text-indigo-500">{formatCurrency(d.revenue, currency)}</p>
      <p className="text-xs text-muted-foreground">{d.total_sold} units sold</p>
    </div>
  );
}

export function TopProductsChart({ data, currency = "USD" }: Props) {
  const formatted = data.map((d) => ({ ...d, short_name: truncate(d.product_name, 12) }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Top Products</h3>
        <p className="text-xs text-muted-foreground mt-0.5">By revenue this month</p>
      </div>
      {data.length === 0 ? (
        <div className="h-[220px] flex items-center justify-center text-muted-foreground text-sm">
          No sales data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={formatted} margin={{ top: 5, right: 5, left: -20, bottom: 0 }} barSize={28}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="short_name" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Bar dataKey="revenue" radius={[6,6,0,0]}>
              {formatted.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

export function TopProductsChartSkeleton() {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
      <div className="mb-6">
        <div className="h-4 w-24 bg-muted rounded mb-1" />
        <div className="h-3 w-32 bg-muted rounded" />
      </div>
      <div className="h-[220px] bg-muted/50 rounded-xl" />
    </div>
  );
}