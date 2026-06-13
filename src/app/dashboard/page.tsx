import { Suspense } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart,
  Receipt, Package,
} from "lucide-react";
import {
  getDashboardStats, getSalesTrend,
  getTopProducts, getRecentSales, getLowStockProducts,
} from "@/lib/actions/dashboard";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/RevenueChart";
import { TopProductsChart, TopProductsChartSkeleton } from "@/components/dashboard/TopProductsChart";
import { RecentSales, RecentSalesSkeleton } from "@/components/dashboard/RecentSales";
import { LowStockAlert, LowStockAlertSkeleton } from "@/components/dashboard/LowStockAlert";
import { createClient } from "@/lib/supabase/server";

async function StatsRow() {
  const stats = await getDashboardStats();
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("businesses(currency)")
    .single() as { data: { businesses: { currency: string } | null } | null };
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Revenue"
        value={stats.total_revenue}
        change={stats.revenue_change}
        isCurrency currency={currency}
        icon={DollarSign}
        iconColor="text-sky-400"
        iconBg="bg-sky-500/15"
      />
      <StatCard
        title="Total Expenses"
        value={stats.total_expenses}
        change={stats.expenses_change}
        isCurrency currency={currency}
        icon={Receipt}
        iconColor="text-rose-400"
        iconBg="bg-rose-500/15"
      />
      <StatCard
        title="Net Profit"
        value={stats.net_profit}
        isCurrency currency={currency}
        icon={TrendingUp}
        iconColor="text-emerald-400"
        iconBg="bg-emerald-500/15"
      />
      <StatCard
        title="Sales This Month"
        value={stats.total_sales}
        icon={ShoppingCart}
        iconColor="text-amber-400"
        iconBg="bg-amber-500/15"
        suffix=" orders"
      />
    </div>
  );
}

async function ChartsRow() {
  const [trend, topProducts] = await Promise.all([
    getSalesTrend(30),
    getTopProducts(5),
  ]);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("businesses(currency)")
    .single() as { data: { businesses: { currency: string } | null } | null };
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <RevenueChart data={trend} currency={currency} />
      <TopProductsChart data={topProducts} currency={currency} />
    </div>
  );
}

async function BottomRow() {
  const [recentSales, lowStock] = await Promise.all([
    getRecentSales(8),
    getLowStockProducts(6),
  ]);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("businesses(currency)")
    .single() as { data: { businesses: { currency: string } | null } | null };
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="grid lg:grid-cols-3 gap-4">
      <div className="lg:col-span-2">
        <RecentSales data={recentSales} currency={currency} />
      </div>
      <LowStockAlert data={lowStock} />
    </div>
  );
}

export default function DashboardPage() {
  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2
            className="text-xl font-bold text-foreground"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
          >
            Overview
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-2">
          <Package size={13} />
          This month
        </div>
      </div>

      {/* Stats */}
      <Suspense fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <StatsRow />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={
        <div className="grid lg:grid-cols-2 gap-4">
          <RevenueChartSkeleton />
          <TopProductsChartSkeleton />
        </div>
      }>
        <ChartsRow />
      </Suspense>

      {/* Bottom row */}
      <Suspense fallback={
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2"><RecentSalesSkeleton /></div>
          <LowStockAlertSkeleton />
        </div>
      }>
        <BottomRow />
      </Suspense>
    </div>
  );
}