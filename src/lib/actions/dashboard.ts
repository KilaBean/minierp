"use server";

import { createClient } from "@/lib/supabase/server";
import { DashboardStats, SalesTrend, TopProduct } from "@/types";

export async function getDashboardStats(): Promise<DashboardStats> {
  const supabase = await createClient();
  const db = supabase as any;

  const now = new Date();
  const startOfMonth     = new Date(now.getFullYear(), now.getMonth(),     1).toISOString();
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
  const endOfLastMonth   = new Date(now.getFullYear(), now.getMonth(),     0).toISOString();

  const [{ data: currentSales }, { data: lastSales }, { data: currentExpenses }, { data: lastExpenses }] =
    await Promise.all([
      db.from("sales").select("total_amount").gte("created_at", startOfMonth).eq("status", "completed"),
      db.from("sales").select("total_amount").gte("created_at", startOfLastMonth).lte("created_at", endOfLastMonth).eq("status", "completed"),
      db.from("expenses").select("amount").gte("date", startOfMonth.split("T")[0]),
      db.from("expenses").select("amount").gte("date", startOfLastMonth.split("T")[0]).lte("date", endOfLastMonth.split("T")[0]),
    ]);

  const totalRevenue   = ((currentSales   ?? []) as { total_amount: number }[]).reduce((s, r) => s + Number(r.total_amount), 0);
  const lastRevenue    = ((lastSales      ?? []) as { total_amount: number }[]).reduce((s, r) => s + Number(r.total_amount), 0);
  const totalExpenses  = ((currentExpenses ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0);
  const lastExpenses_  = ((lastExpenses    ?? []) as { amount: number }[]).reduce((s, r) => s + Number(r.amount), 0);

  return {
    total_revenue:   totalRevenue,
    total_expenses:  totalExpenses,
    net_profit:      totalRevenue - totalExpenses,
    total_sales:     (currentSales ?? []).length,
    revenue_change:  lastRevenue   === 0 ? 0 : ((totalRevenue  - lastRevenue)  / lastRevenue)  * 100,
    sales_change:    0,
    expenses_change: lastExpenses_ === 0 ? 0 : ((totalExpenses - lastExpenses_) / lastExpenses_) * 100,
  };
}

export async function getSalesTrend(days = 30): Promise<SalesTrend[]> {
  const supabase = await createClient();
  const since    = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString();

  const { data } = await (supabase as any)
    .from("sales")
    .select("total_amount, created_at")
    .gte("created_at", since)
    .eq("status", "completed")
    .order("created_at", { ascending: true });

  const byDate: Record<string, { revenue: number; sales: number }> = {};
  for (let i = days - 1; i >= 0; i--) {
    const key = new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    byDate[key] = { revenue: 0, sales: 0 };
  }

  ((data ?? []) as { total_amount: number; created_at: string }[]).forEach((row) => {
    const key = row.created_at.split("T")[0];
    if (byDate[key]) { byDate[key].revenue += Number(row.total_amount); byDate[key].sales += 1; }
  });

  return Object.entries(byDate).map(([date, v]) => ({ date, ...v }));
}

export async function getTopProducts(limit = 5): Promise<TopProduct[]> {
  const supabase = await createClient();

  const { data } = await (supabase as any)
    .from("sale_items")
    .select("product_id, quantity, total_price, products(name)")
    .order("total_price", { ascending: false })
    .limit(100);

  const map: Record<string, TopProduct> = {};
  ((data ?? []) as any[]).forEach((row) => {
    const id = row.product_id as string;
    if (!map[id]) map[id] = { product_id: id, product_name: row.products?.name ?? "Unknown", total_sold: 0, revenue: 0 };
    map[id].total_sold += Number(row.quantity);
    map[id].revenue    += Number(row.total_price);
  });

  return Object.values(map).sort((a, b) => b.revenue - a.revenue).slice(0, limit);
}

export async function getRecentSales(limit = 8) {
  const supabase = await createClient();

  const { data } = await (supabase as any)
    .from("sales")
    .select("id, sale_number, total_amount, payment_method, status, created_at, customers(name)")
    .order("created_at", { ascending: false })
    .limit(limit);

  return (data ?? []) as Array<{
    id: string; sale_number: string; total_amount: number;
    payment_method: string; status: string; created_at: string;
    customers: { name: string } | null;
  }>;
}

export async function getLowStockProducts(limit = 5) {
  const supabase = await createClient();

  const { data: allLow } = await supabase
    .from("products")
    .select("id, name, quantity, low_stock_threshold, sku")
    .eq("is_active", true)
    .order("quantity", { ascending: true })
    .limit(50);

  return ((allLow ?? []) as Array<{
    id: string; name: string; quantity: number;
    low_stock_threshold: number; sku: string | null;
  }>)
    .filter((p) => p.quantity <= p.low_stock_threshold)
    .slice(0, limit);
}