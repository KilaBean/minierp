"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Users, Eye } from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils/index";
import { Customer } from "@/types";

interface Props { data: Customer[]; total: number; page: number; totalPages: number; }

export function CustomersTable({ data, total, page, totalPages }: Props) {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  function changePage(p: number) {
    const sp = new URLSearchParams(params.toString()); sp.set("page", String(p));
    router.push(`${pathname}?${sp.toString()}`);
  }
  return (
    <div className="bg-card border border-border rounded-2xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead><tr className="border-b border-border">
            {["Customer","Email","Phone","Total Spent","Since",""].map((h) => (
              <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {data.length === 0 ? (
              <tr><td colSpan={6} className="px-4 py-16 text-center">
                <Users size={32} className="mx-auto mb-3 text-muted-foreground/30" />
                <p className="text-sm text-muted-foreground">No customers yet</p>
              </td></tr>
            ) : data.map((c) => (
              <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {c.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-foreground">{c.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.email ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{c.phone ?? "—"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(c.total_purchases)}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{formatDate(c.created_at)}</td>
                <td className="px-4 py-3">
                  <Link href={`/dashboard/customers/${c.id}`}
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
