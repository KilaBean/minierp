"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useCallback, useState } from "react";
import { debounce } from "@/lib/utils/index";
import { Category } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  categories: Category[];
}

export function ProductFilters({ categories }: Props) {
  const router     = useRouter();
  const pathname   = usePathname();
  const params     = useSearchParams();

  const [search, setSearch] = useState(params.get("search") ?? "");

  const push = useCallback(
    (key: string, value: string) => {
      const sp = new URLSearchParams(params.toString());
      if (value) sp.set(key, value); else sp.delete(key);
      sp.delete("page");
      router.push(`${pathname}?${sp.toString()}`);
    },
    [params, pathname, router]
  );

  const debouncedSearch = useCallback(debounce((v: string) => push("search", v), 350), [push]);

  const activeCategory = params.get("category_id") ?? "";
  const activeStatus   = params.get("status") ?? "";
  const lowStock       = params.get("low_stock") === "true";
  const hasFilters     = activeCategory || activeStatus || lowStock || search;

  function clearAll() {
    setSearch("");
    router.push(pathname);
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {/* Search */}
      <div className="relative flex-1">
        <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
          placeholder="Search products or SKU…"
          className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
      </div>

      {/* Category filter */}
      <select
        value={activeCategory}
        onChange={(e) => push("category_id", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl
          text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        <option value="">All categories</option>
        {categories.map((c) => (
          <option key={c.id} value={c.id}>{c.name}</option>
        ))}
      </select>

      {/* Status filter */}
      <select
        value={activeStatus}
        onChange={(e) => push("status", e.target.value)}
        className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl
          text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
      >
        <option value="">All status</option>
        <option value="active">Active</option>
        <option value="inactive">Inactive</option>
      </select>

      {/* Low stock toggle */}
      <button
        onClick={() => push("low_stock", lowStock ? "" : "true")}
        className={cn(
          "flex items-center gap-2 px-4 py-2.5 text-sm rounded-xl border transition-all whitespace-nowrap",
          lowStock
            ? "bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400"
            : "bg-background border-border text-muted-foreground hover:text-foreground"
        )}
      >
        <SlidersHorizontal size={14} />
        Low stock
      </button>

      {/* Clear filters */}
      {hasFilters && (
        <button
          onClick={clearAll}
          className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <X size={14} />
          Clear
        </button>
      )}
    </div>
  );
}
