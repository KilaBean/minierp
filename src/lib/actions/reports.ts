"use server";

import { createClient } from "@/lib/supabase/server";

function isoDate(d: Date) { return d.toISOString().split("T")[0]; }

export async function getSalesOverTime(period: "daily" | "monthly", count = 30) {
  const supabase = await createClient();
  const now      = new Date();

  const since = period === "daily"
    ? new Date(now.getTime() - (count - 1) * 86400000)
    : new Date(now.getFullYear(), now.getMonth() - (count - 1), 1);

  const { data } = await (supabase as any)
    .from("sales")
    .select("total_amount, created_at")
    .gte("created_at", since.toISOString())
    .eq("status", "completed");

  if (period === "monthly") {
    const map: Record<string, { revenue: number; sales: number }> = {};
    for (let i = count - 1; i >= 0; i--) {
      const d   = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      map[key]  = { revenue: 0, sales: 0 };
    }
    (data ?? []).forEach((row: any) => {
      const d   = new Date(row.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
      if (map[key]) { map[key].revenue += Number(row.total_amount); map[key].sales += 1; }
    });
    return Object.entries(map).map(([date, v]) => ({ date, label: date, ...v }));
  }

  const buckets: Record<string, { revenue: number; sales: number }> = {};
  for (let i = count - 1; i >= 0; i--) {
    const key = isoDate(new Date(now.getTime() - i * 86400000));
    buckets[key] = { revenue: 0, sales: 0 };
  }
  (data ?? []).forEach((row: any) => {
    const key = isoDate(new Date(row.created_at));
    if (buckets[key]) { buckets[key].revenue += Number(row.total_amount); buckets[key].sales += 1; }
  });
  return Object.entries(buckets).map(([date, v]) => ({ date, label: date, ...v }));
}

export async function getProfitLoss(months = 6) {
  const supabase = await createClient();
  const now      = new Date();
  const result   = [];

  for (let i = months - 1; i >= 0; i--) {
    const d     = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const start = new Date(d.getFullYear(), d.getMonth(), 1).toISOString();
    const end   = new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59).toISOString();
    const label = d.toLocaleDateString("en-US", { month: "short", year: "2-digit" });

    const [{ data: sales }, { data: expenses }] = await Promise.all([
      (supabase as any).from("sales").select("total_amount").gte("created_at", start).lte("created_at", end).eq("status", "completed"),
      (supabase as any).from("expenses").select("amount").gte("date", start.split("T")[0]).lte("date", end.split("T")[0]),
    ]);

    const revenue = (sales    ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0);
    const expense = (expenses ?? []).reduce((s: number, r: any) => s + Number(r.amount),       0);
    result.push({ label, revenue, expense, profit: revenue - expense });
  }
  return result;
}

export async function getInventoryValuation() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("products")
    .select("id, name, sku, quantity, cost_price, price, categories(name)")
    .eq("is_active", true)
    .order("name");

  return (data ?? []).map((p: any) => ({
    id:               p.id,
    name:             p.name,
    sku:              p.sku,
    category:         p.categories?.name ?? "Uncategorised",
    quantity:         p.quantity,
    cost_price:       p.cost_price,
    sell_price:       p.price,
    cost_value:       p.quantity * p.cost_price,
    retail_value:     p.quantity * p.price,
    potential_profit: p.quantity * (p.price - p.cost_price),
  }));
}

export async function getTopProductsReport(limit = 10, dateFrom?: string, dateTo?: string) {
  const supabase = await createClient();
  let query = (supabase as any)
    .from("sale_items")
    .select("product_id, quantity, total_price, sales!inner(created_at,status), products(name,sku,categories(name))")
    .eq("sales.status", "completed");

  if (dateFrom) query = query.gte("sales.created_at", dateFrom);
  if (dateTo)   query = query.lte("sales.created_at", dateTo);

  const { data } = await query;
  const map: Record<string, any> = {};

  (data ?? []).forEach((row: any) => {
    const id = row.product_id;
    if (!map[id]) map[id] = { product_id: id, name: row.products?.name ?? "Unknown", sku: row.products?.sku ?? null, category: row.products?.categories?.name ?? "—", units_sold: 0, revenue: 0 };
    map[id].units_sold += Number(row.quantity);
    map[id].revenue    += Number(row.total_price);
  });

  return Object.values(map)
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, limit);
}

export async function getReportSummary() {
  const supabase = await createClient();
  const now = new Date();
  const som = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const soy = new Date(now.getFullYear(), 0, 1).toISOString();

  const [{ data: ms }, { data: ys }, { data: me }, { data: products }] = await Promise.all([
    (supabase as any).from("sales").select("total_amount").gte("created_at", som).eq("status", "completed"),
    (supabase as any).from("sales").select("total_amount").gte("created_at", soy).eq("status", "completed"),
    (supabase as any).from("expenses").select("amount").gte("date", som.split("T")[0]),
    supabase.from("products").select("quantity, cost_price").eq("is_active", true),
  ]);

  const monthRevenue  = (ms ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0);
  const yearRevenue   = (ys ?? []).reduce((s: number, r: any) => s + Number(r.total_amount), 0);
  const monthExpenses = (me ?? []).reduce((s: number, r: any) => s + Number(r.amount),       0);
  const stockValue    = (products ?? []).reduce((s: number, p: any) => s + p.quantity * Number(p.cost_price), 0);

  return {
    month_revenue:   monthRevenue,
    month_profit:    monthRevenue - monthExpenses,
    month_expenses:  monthExpenses,
    year_revenue:    yearRevenue,
    stock_value:     stockValue,
    total_sales_mtd: (ms ?? []).length,
  };
}
