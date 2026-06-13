"use client";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, ReferenceLine } from "recharts";
import { formatCurrency } from "@/lib/utils/index";

interface DataPoint { label: string; revenue: number; expense: number; profit: number; }
interface Props { data: DataPoint[]; currency?: string; }

function CustomTooltip({ active, payload, label, currency }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl min-w-[160px]">
      <p className="text-xs font-semibold text-foreground mb-2">{label}</p>
      {payload.map((p: any) => (
        <div key={p.dataKey} className="flex items-center justify-between gap-4 text-xs mb-0.5">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full" style={{ background: p.color }} />
            <span className="text-muted-foreground capitalize">{p.dataKey}</span>
          </span>
          <span className={`font-semibold ${p.dataKey === "profit" && p.value < 0 ? "text-red-500" : "text-foreground"}`}>
            {formatCurrency(p.value, currency)}
          </span>
        </div>
      ))}
    </div>
  );
}

export function ProfitLossChart({ data, currency = "USD" }: Props) {
  const hasData = data.some((d) => d.revenue > 0 || d.expense > 0);

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="mb-6">
        <h3 className="text-sm font-semibold text-foreground">Profit & Loss</h3>
        <p className="text-xs text-muted-foreground mt-0.5">Last 6 months — Revenue vs Expenses vs Profit</p>
      </div>

      {!hasData ? (
        <div className="h-[260px] flex items-center justify-center text-muted-foreground text-sm">
          No data yet — create some sales and expenses
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={260}>
          <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barGap={4} barSize={18}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="label" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip currency={currency} />} />
            <Legend wrapperStyle={{ fontSize: "11px", paddingTop: "12px" }} />
            <ReferenceLine y={0} stroke="hsl(var(--border))" />
            <Bar dataKey="revenue" name="Revenue" fill="#0ea5e9" fillOpacity={0.85} radius={[4,4,0,0]} />
            <Bar dataKey="expense" name="Expense" fill="#f43f5e" fillOpacity={0.75} radius={[4,4,0,0]} />
            <Bar dataKey="profit"  name="Profit"  fill="#10b981" fillOpacity={0.85} radius={[4,4,0,0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
