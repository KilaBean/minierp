"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useCallback } from "react";
import { debounce } from "@/lib/utils/index";

export function SalesFilters() {
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");

  const push = useCallback((key: string, value: string) => {
    const sp = new URLSearchParams(params.toString());
    if (value) sp.set(key, value); else sp.delete(key);
    sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }, [params, pathname, router]);

  const debouncedSearch = useCallback(debounce((v: string) => push("search", v), 350), [push]);
  const hasFilters = params.get("search") || params.get("status") || params.get("payment_method") || params.get("date_from");

  return (
    <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
      <div className="relative flex-1 min-w-48">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
          placeholder="Search by sale number…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
      </div>
      <select value={params.get("status") ?? ""} onChange={(e) => push("status", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
        <option value="">All status</option>
        <option value="completed">Completed</option>
        <option value="pending">Pending</option>
        <option value="cancelled">Cancelled</option>
        <option value="refunded">Refunded</option>
      </select>
      <select value={params.get("payment_method") ?? ""} onChange={(e) => push("payment_method", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
        <option value="">All payments</option>
        <option value="cash">Cash</option>
        <option value="card">Card</option>
        <option value="mobile_money">Mobile Money</option>
        <option value="bank_transfer">Bank Transfer</option>
      </select>
      <input type="date" value={params.get("date_from") ?? ""} onChange={(e) => push("date_from", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      <input type="date" value={params.get("date_to") ?? ""} onChange={(e) => push("date_to", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
      {hasFilters && (
        <button onClick={() => { setSearch(""); router.push(pathname); }}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
