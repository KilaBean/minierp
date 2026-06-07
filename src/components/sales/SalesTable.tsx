"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Eye, ShoppingCart } from "lucide-react";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled: "bg-red-500/15 text-red-500",
  refunded:  "bg-muted text-muted-foreground",
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
}

export function SalesTable({ data, total, page, totalPages, currency = "USD" }: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  function changePage(p: number) {
    const sp = new URLSearchParams(params.toString());
    sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border">
              {["Sale #","Customer","Items","Payment","Total","Status","Date",""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={8} className="px-4 py-16 text-center">
                <ShoppingCart size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No sales found</p>
              </td></tr>
            ) : data.map((sale) => (
              <tr key={sale.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">{sale.sale_number}</td>
                <td className="px-4 py-3 text-sm text-foreground">{sale.customers?.name ?? <span className="text-muted-foreground">Walk-in</span>}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{sale.sale_items?.length ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{paymentLabels[sale.payment_method] ?? sale.payment_method}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(sale.total_amount, currency)}</td>
                <td className="px-4 py-3">
                  <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize font-medium", statusColors[sale.status] ?? statusColors.completed)}>
                    {sale.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(sale.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/sales/${sale.id}`}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all inline-flex">
                    <Eye size={15} />
                  </Link>
                </td>
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
