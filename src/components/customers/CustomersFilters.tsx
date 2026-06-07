"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useState, useCallback } from "react";
import { debounce } from "@/lib/utils/index";

export function CustomersFilters() {
  const router = useRouter(); const pathname = usePathname(); const params = useSearchParams();
  const [search, setSearch] = useState(params.get("search") ?? "");
  const push = useCallback((k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v); else sp.delete(k); sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }, [params, pathname, router]);
  const debouncedSearch = useCallback(debounce((v: string) => push("search", v), 350), [push]);
  return (
    <div className="flex gap-3">
      <div className="relative flex-1 max-w-sm">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input value={search} onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
          placeholder="Search customers…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
      </div>
      {search && (
        <button onClick={() => { setSearch(""); router.push(pathname); }}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} /> Clear
        </button>
      )}
    </div>
  );
}
