import { Suspense } from "react";
import {
  getReportSummary,
  getSalesOverTime,
  getProfitLoss,
  getTopProductsReport,
  getInventoryValuation,
} from "@/lib/actions/reports";
import { ReportSummaryCards, ReportSummaryCardsSkeleton } from "@/components/reports/ReportSummaryCards";
import { ReportTabs } from "@/components/reports/ReportTabs";
import { PageHeader } from "@/components/ui/PageHeader";
import { createClient } from "@/lib/supabase/server";

async function SummarySection({ currency }: { currency: string }) {
  const summary = await getReportSummary();
  return <ReportSummaryCards summary={summary} currency={currency} />;
}

async function ChartsSection({ currency }: { currency: string }) {
  const [salesDaily, salesMonthly, profitLoss, topProducts, inventory] = await Promise.all([
    getSalesOverTime("daily",   30),
    getSalesOverTime("monthly", 12),
    getProfitLoss(6),
    getTopProductsReport(10),
    getInventoryValuation(),
  ]);

  return (
    <ReportTabs
      salesDaily={salesDaily}
      salesMonthly={salesMonthly}
      profitLoss={profitLoss}
      topProducts={topProducts}
      inventory={inventory}
      currency={currency}
    />
  );
}

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader
        title="Reports & Analytics"
        subtitle="Business performance insights"
        action={
          <div className="text-xs text-muted-foreground bg-muted border border-border rounded-lg px-3 py-2">
            Last updated: {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
          </div>
        }
      />

      {/* Summary cards */}
      <Suspense fallback={<ReportSummaryCardsSkeleton />}>
        <SummarySection currency={currency} />
      </Suspense>

      {/* Charts */}
      <Suspense fallback={
        <div className="bg-card border border-border rounded-2xl p-5 animate-pulse">
          <div className="h-4 w-32 bg-muted rounded mb-2" />
          <div className="h-3 w-48 bg-muted rounded mb-6" />
          <div className="h-[280px] bg-muted/50 rounded-xl" />
        </div>
      }>
        <ChartsSection currency={currency} />
      </Suspense>
    </div>
  );
}
