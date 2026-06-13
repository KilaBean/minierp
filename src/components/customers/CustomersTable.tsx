"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Users } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/index";
import { Customer } from "@/types";
import { StatusPill } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props { data: Customer[]; total: number; page: number; totalPages: number; }

export function CustomersTable({ data, total, page, totalPages }: Props) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  function changePage(p: number) {
    const sp = new URLSearchParams(params.toString()); sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }

  if (data.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl">
        <EmptyState
          icon={Users}
          title="No customers yet"
          description="Add your first customer to start tracking purchases and lifetime value."
        />
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-border bg-muted/30">
            {["Customer","Status","Email","Phone","Total Spent","Since"].map((h, i) => (
              <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i === 4 ? "text-right" : "text-left"}`}>{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.map((c) => (
              <tr key={c.id}
                onClick={() => router.push(`/dashboard/customers/${c.id}`)}
                className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors cursor-pointer">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3">
                  {c.total_purchases > 0
                    ? <StatusPill label="Active" tone="success" />
                    : <StatusPill label="New" tone="info" />}
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground text-right tabular-nums">{formatCurrency(c.total_purchases)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(c.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-border">
          <span className="text-xs text-muted-foreground">{total} customers</span>
          <div className="flex items-center gap-2">
            <button onClick={() => changePage(page - 1)} disabled={page <= 1} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"><ChevronLeft size={15} /></button>
            <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
            <button onClick={() => changePage(page + 1)} disabled={page >= totalPages} className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"><ChevronRight size={15} /></button>
          </div>
        </div>
      )}
    </div>
  );
}
