import { Suspense } from "react";
import {
  DollarSign, TrendingUp, ShoppingCart, Receipt,
} from "lucide-react";
import {
  getDashboardStats, getSalesTrend,
  getTopProducts, getRecentSales, getLowStockProducts,
} from "@/lib/actions/dashboard";
import { rangeTrendDays, type DashboardRange } from "@/lib/dashboard-range";
import { DateRangeTabs } from "@/components/dashboard/DateRangeTabs";
import { StatCard, StatCardSkeleton } from "@/components/dashboard/StatCard";
import { RevenueChart, RevenueChartSkeleton } from "@/components/dashboard/RevenueChart";
import { TopProductsChart, TopProductsChartSkeleton } from "@/components/dashboard/TopProductsChart";
import { RecentSales, RecentSalesSkeleton } from "@/components/dashboard/RecentSales";
import { LowStockAlert, LowStockAlertSkeleton } from "@/components/dashboard/LowStockAlert";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

async function StatsRow({ range }: { range: DashboardRange }) {
  const [stats, trend] = await Promise.all([
    getDashboardStats(range),
    getSalesTrend(rangeTrendDays(range)),
  ]);
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles")
    .select("businesses(currency)")
    .single() as { data: { businesses: { currency: string } | null } | null };
  const currency = profile?.businesses?.currency ?? "USD";

  const revenueSeries = trend.map((t) => t.revenue);
  const salesSeries   = trend.map((t) => t.sales);

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
        sparkline={revenueSeries}
        sparklineColor="#0ea5e9"
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
        sparkline={salesSeries}
        sparklineColor="#f59e0b"
      />
    </div>
  );
}

async function ChartsRow({ range }: { range: DashboardRange }) {
  const [trend, topProducts] = await Promise.all([
    getSalesTrend(rangeTrendDays(range)),
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

const VALID_RANGES: DashboardRange[] = ["today", "7d", "30d", "month"];

export default async function DashboardPage({ searchParams }: { searchParams: Promise<{ range?: string }> }) {
  const sp    = await searchParams;
  const range = (VALID_RANGES.includes(sp.range as DashboardRange) ? sp.range : "month") as DashboardRange;

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      <PageHeader
        title="Overview"
        subtitle={new Date().toLocaleDateString("en-US", { weekday: "long", year: "numeric", month: "long", day: "numeric" })}
        action={<DateRangeTabs value={range} />}
      />

      {/* Stats */}
      <Suspense key={`stats-${range}`} fallback={
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => <StatCardSkeleton key={i} />)}
        </div>
      }>
        <StatsRow range={range} />
      </Suspense>

      {/* Charts */}
      <Suspense key={`charts-${range}`} fallback={
        <div className="grid lg:grid-cols-2 gap-4">
          <RevenueChartSkeleton />
          <TopProductsChartSkeleton />
        </div>
      }>
        <ChartsRow range={range} />
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