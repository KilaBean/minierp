"use client";

import { useState } from "react";
import { BarChart3, TrendingUp, Package, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { SalesOverTimeChart } from "./SalesOverTimeChart";
import { ProfitLossChart } from "./ProfitLossChart";
import { TopProductsReport } from "./TopProductsReport";
import { InventoryValuationReport } from "./InventoryValuationReport";

const tabs = [
  { id: "sales",     label: "Sales",       icon: BarChart3  },
  { id: "pl",        label: "Profit & Loss",icon: TrendingUp },
  { id: "products",  label: "Top Products", icon: Award      },
  { id: "inventory", label: "Inventory",    icon: Package    },
] as const;

type TabId = typeof tabs[number]["id"];

interface Props {
  salesDaily:   any[];
  salesMonthly: any[];
  profitLoss:   any[];
  topProducts:  any[];
  inventory:    any[];
  currency?:    string;
}

export function ReportTabs({ salesDaily, salesMonthly, profitLoss, topProducts, inventory, currency = "USD" }: Props) {
  const [active, setActive] = useState<TabId>("sales");

  return (
    <div>
      {/* Tab bar */}
      <div className="flex items-center gap-1 p-1 bg-muted rounded-xl mb-5 w-fit">
        {tabs.map((tab) => (
          <button key={tab.id} onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-all",
              active === tab.id
                ? "bg-background text-foreground shadow-sm"
                : "text-muted-foreground hover:text-foreground"
            )}>
            <tab.icon size={15} />
            <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab content */}
      {active === "sales"     && <SalesOverTimeChart daily={salesDaily} monthly={salesMonthly} currency={currency} />}
      {active === "pl"        && <ProfitLossChart data={profitLoss} currency={currency} />}
      {active === "products"  && <TopProductsReport data={topProducts} currency={currency} />}
      {active === "inventory" && <InventoryValuationReport data={inventory} currency={currency} />}
    </div>
  );
}
