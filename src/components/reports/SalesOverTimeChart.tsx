"use client";

import { useState } from "react";
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { format, parseISO, isValid } from "date-fns";
import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface DataPoint { date: string; label: string; revenue: number; sales: number; }
interface Props { daily: DataPoint[]; monthly: DataPoint[]; currency?: string; }

function CustomTooltip({ active, payload, label, currency, period }: any) {
  if (!active || !payload?.length) return null;
  const raw    = payload[0]?.payload?.date ?? "";
  const parsed = isValid(parseISO(raw)) ? parseISO(raw) : null;
  const dateStr = parsed
    ? period === "daily" ? format(parsed, "MMM d, yyyy") : format(parsed, "MMM yyyy")
    : label;
  return (
    <div className="bg-popover border border-border rounded-xl p-3 shadow-xl min-w-[140px]">
      <p className="text-xs text-muted-foreground mb-2">{dateStr}</p>
      <p className="text-sm font-bold text-sky-500">{formatCurrency(payload[0]?.value ?? 0, currency)}</p>
      {payload[1] && <p className="text-xs text-muted-foreground mt-0.5">{payload[1].value} orders</p>}
    </div>
  );
}

export function SalesOverTimeChart({ daily, monthly, currency = "USD" }: Props) {
  const [period, setPeriod] = useState<"daily" | "monthly">("daily");
  const [chartType, setChartType] = useState<"area" | "bar">("area");
  const data = period === "daily" ? daily : monthly;

  const formatted = data.map((d) => ({
    ...d,
    shortLabel: period === "daily"
      ? (isValid(parseISO(d.date)) ? format(parseISO(d.date), "MMM d") : d.date)
      : (isValid(parseISO(d.date + "-01")) ? format(parseISO(d.date + "-01"), "MMM yy") : d.date),
  }));

  return (
    <div className="bg-card border border-border rounded-2xl p-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Sales Over Time</h3>
          <p className="text-xs text-muted-foreground mt-0.5">
            {period === "daily" ? "Last 30 days" : "Last 12 months"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {/* Period toggle */}
          <div className="flex items-center p-1 bg-muted rounded-lg gap-1">
            {(["daily","monthly"] as const).map((p) => (
              <button key={p} onClick={() => setPeriod(p)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                  period === p ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {p}
              </button>
            ))}
          </div>
          {/* Chart type */}
          <div className="flex items-center p-1 bg-muted rounded-lg gap-1">
            {(["area","bar"] as const).map((t) => (
              <button key={t} onClick={() => setChartType(t)}
                className={cn("px-3 py-1 text-xs font-medium rounded-md transition-all capitalize",
                  chartType === t ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground"
                )}>
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={260}>
        {chartType === "area" ? (
          <AreaChart data={formatted} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
            <defs>
              <linearGradient id="grad1" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#0ea5e9" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={period === "daily" ? 4 : 0} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip currency={currency} period={period} />} />
            <Area type="monotone" dataKey="revenue" name="Revenue" stroke="#0ea5e9" strokeWidth={2} fill="url(#grad1)" dot={false} activeDot={{ r: 4, fill: "#0ea5e9" }} />
          </AreaChart>
        ) : (
          <BarChart data={formatted} margin={{ top: 5, right: 5, left: -15, bottom: 0 }} barSize={period === "monthly" ? 28 : 12}>
            <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
            <XAxis dataKey="shortLabel" tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} interval={period === "daily" ? 4 : 0} />
            <YAxis tick={{ fontSize: 11, fill: "hsl(var(--muted-foreground))" }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? `${(v/1000).toFixed(0)}k` : v}`} />
            <Tooltip content={<CustomTooltip currency={currency} period={period} />} />
            <Bar dataKey="revenue" name="Revenue" fill="#0ea5e9" fillOpacity={0.85} radius={[4,4,0,0]} />
          </BarChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}
