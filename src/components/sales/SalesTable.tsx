"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, ShoppingCart, ArrowUp, ArrowDown, ArrowUpDown } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";
import { StatusPill, PillTone } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";

type Sort = "created_at" | "total_amount";

const statusTones: Record<string, PillTone> = {
  completed: "success",
  pending:   "warning",
  cancelled: "danger",
  refunded:  "neutral",
};

const paymentLabels: Record<string, string> = {
  cash: "Cash", card: "Card", mobile_money: "Mobile", bank_transfer: "Bank",
};

interface Props {
  data: any[];
  total: number;
  page: number;
  totalPages: number;
  currency?: string;
  sort: Sort;
  dir: "asc" | "desc";
}

export function SalesTable({ data, total, page, totalPages, currency = "USD", sort, dir }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  function changePage(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }
  function toggleSort(col: Sort) {
    const sp = new URLSearchParams(params.toString());
    const nextDir = sort === col && dir === "desc" ? "asc" : "desc";
    sp.set("sort", col); sp.set("dir", nextDir); sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }
  const SortIcon = ({ col }: { col: Sort }) =>
    sort !== col ? <ArrowUpDown size={12} className="opacity-40" />
      : dir === "asc" ? <ArrowUp size={12} /> : <ArrowDown size={12} />;

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl">
        <EmptyState
          icon={ShoppingCart}
          title="No sales found"
          description="Sales you record at the point of sale will appear here."
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              {["Sale #","Customer","Items","Payment"].map((h) => (
                <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
              <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <button onClick={() => toggleSort("total_amount")} className="flex items-center gap-1 ml-auto hover:text-foreground transition-colors">Total <SortIcon col="total_amount" /></button>
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                <button onClick={() => toggleSort("created_at")} className="flex items-center gap-1 hover:text-foreground transition-colors">Date <SortIcon col="created_at" /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((sale) => (
              <tr key={sale.id}
                onClick={() => router.push(`/dashboard/sales/${sale.id}`)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{sale.sale_number}</td>
                <td className="px-4 py-3 text-sm text-foreground">{sale.customers?.name ?? <span className="text-muted-foreground">Walk-in</span>}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground tabular-nums">{sale.sale_items?.length ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{paymentLabels[sale.payment_method] ?? sale.payment_method}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground text-right tabular-nums">{formatCurrency(sale.total_amount, currency)}</td>
                <td className="px-4 py-3">
                  <StatusPill label={sale.status} tone={statusTones[sale.status] ?? "success"} />
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(sale.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{total} sale{total !== 1 ? "s" : ""}</span>
          <div className="flex items-center gap-2">
            <button onClick={() => changePage(page - 1)} disabled={page <= 1}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronLeft size={15} />
            </button>
            <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
            <button onClick={() => changePage(page + 1)} disabled={page >= totalPages}
              className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 disabled:cursor-not-allowed transition-all">
              <ChevronRight size={15} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
