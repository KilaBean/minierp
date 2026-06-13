"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { DashboardRange } from "@/lib/dashboard-range";

const options: { value: DashboardRange; label: string }[] = [
  { value: "today", label: "Today" },
  { value: "7d",    label: "7d" },
  { value: "30d",   label: "30d" },
  { value: "month", label: "Month" },
];

export function DateRangeTabs({ value }: { value: DashboardRange }) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  function setRange(range: DashboardRange) {
    const sp = new URLSearchParams(params.toString());
    if (range === "month") sp.delete("range"); else sp.set("range", range);
    const qs = sp.toString();
    router.push(qs ? `${pathname}?${qs}` : pathname);
  }

  return (
    <div className="inline-flex items-center rounded-lg border border-border bg-muted/40 p-0.5">
      {options.map((o) => (
        <button
          key={o.value}
          onClick={() => setRange(o.value)}
          className={cn(
            "px-3 py-1.5 text-xs font-medium rounded-md transition-all",
            value === o.value
              ? "bg-primary text-primary-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
