"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import {
  Search, LayoutDashboard, Package, ShoppingCart, ClipboardList, Users,
  Receipt, BarChart3, Settings, Plus, SunMoon, LogOut, CornerDownLeft,
} from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { globalSearch, type SearchResults } from "@/lib/actions/search";
import { signOut } from "@/lib/actions/auth";
import { debounce, formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface Cmd {
  id: string;
  label: string;
  hint?: string;
  icon: React.ComponentType<{ size?: number; className?: string }>;
  run: () => void;
  group: string;
}

export function CommandPalette() {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [open, setOpen]     = useState(false);
  const [query, setQuery]   = useState("");
  const [active, setActive] = useState(0);
  const [results, setResults] = useState<SearchResults>({ products: [], customers: [], sales: [] });
  const inputRef = useRef<HTMLInputElement>(null);

  // Global ⌘K / Ctrl+K, plus a custom event so the top-bar field can open it
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("minierp:open-palette", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("minierp:open-palette", onOpen);
    };
  }, []);

  // Reset on open/close
  useEffect(() => {
    if (open) { setQuery(""); setActive(0); setResults({ products: [], customers: [], sales: [] }); }
  }, [open]);

  const close = useCallback(() => setOpen(false), []);
  const go = useCallback((href: string) => { close(); router.push(href); }, [close, router]);

  // Debounced remote search
  const runSearch = useMemo(
    () => debounce((q: string) => { globalSearch(q).then(setResults); }, 250),
    [],
  );
  useEffect(() => {
    if (query.trim()) runSearch(query); else setResults({ products: [], customers: [], sales: [] });
  }, [query, runSearch]);

  // Static navigation + actions
  const staticCmds: Cmd[] = useMemo(() => [
    { id: "nav-dash",   label: "Dashboard",   icon: LayoutDashboard, group: "Navigation", run: () => go("/dashboard") },
    { id: "nav-inv",    label: "Inventory",   icon: Package,         group: "Navigation", run: () => go("/dashboard/inventory") },
    { id: "nav-pos",    label: "POS / Sales", icon: ShoppingCart,    group: "Navigation", run: () => go("/dashboard/pos") },
    { id: "nav-sales",  label: "Sales History", icon: ClipboardList, group: "Navigation", run: () => go("/dashboard/sales") },
    { id: "nav-cust",   label: "Customers",   icon: Users,           group: "Navigation", run: () => go("/dashboard/customers") },
    { id: "nav-exp",    label: "Expenses",    icon: Receipt,         group: "Navigation", run: () => go("/dashboard/expenses") },
    { id: "nav-rep",    label: "Reports",     icon: BarChart3,       group: "Navigation", run: () => go("/dashboard/reports") },
    { id: "nav-set",    label: "Settings",    icon: Settings,        group: "Navigation", run: () => go("/dashboard/settings") },
    { id: "act-sale",   label: "New sale",     icon: Plus, group: "Actions", run: () => go("/dashboard/pos") },
    { id: "act-product",label: "New product",  icon: Plus, group: "Actions", run: () => go("/dashboard/inventory/new") },
    { id: "act-customer",label: "New customer",icon: Plus, group: "Actions", run: () => go("/dashboard/customers") },
    { id: "act-expense",label: "New expense",  icon: Plus, group: "Actions", run: () => go("/dashboard/expenses") },
    { id: "act-theme",  label: "Toggle theme", icon: SunMoon, group: "Actions", run: () => { setTheme(theme === "dark" ? "light" : "dark"); } },
    { id: "act-signout",label: "Sign out",     icon: LogOut, group: "Actions", run: () => { close(); signOut(); } },
  ], [go, setTheme, theme, close]);

  // Build the flattened, filtered command list
  const commands: Cmd[] = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filteredStatic = q
      ? staticCmds.filter((c) => c.label.toLowerCase().includes(q))
      : staticCmds;

    const remote: Cmd[] = [
      ...results.products.map((p) => ({
        id: `p-${p.id}`, label: p.name, hint: p.sku ?? undefined, icon: Package, group: "Products",
        run: () => go(`/dashboard/inventory/${p.id}`),
      })),
      ...results.customers.map((c) => ({
        id: `c-${c.id}`, label: c.name, icon: Users, group: "Customers",
        run: () => go(`/dashboard/customers/${c.id}`),
      })),
      ...results.sales.map((s) => ({
        id: `s-${s.id}`, label: s.sale_number, hint: formatCurrency(s.total_amount), icon: ClipboardList, group: "Sales",
        run: () => go(`/dashboard/sales/${s.id}`),
      })),
    ];

    return [...remote, ...filteredStatic];
  }, [query, staticCmds, results, go]);

  useEffect(() => { setActive(0); }, [commands.length]);

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, commands.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); commands[active]?.run(); }
  }

  // Group for rendering while preserving the flat index for highlight
  let runningIndex = -1;
  const groups = ["Products", "Customers", "Sales", "Navigation", "Actions"];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent
        showCloseButton={false}
        className="p-0 gap-0 top-[12%] translate-y-0 max-w-xl sm:max-w-xl overflow-hidden"
        onKeyDown={onKeyDown}
      >
        <DialogTitle className="sr-only">Command palette</DialogTitle>
        <div className="flex items-center gap-3 px-4 h-12 border-b border-border">
          <Search size={16} className="text-muted-foreground flex-shrink-0" />
          <input
            ref={inputRef}
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search products, customers, sales… or jump to a page"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground focus:outline-none"
          />
          <kbd className="text-[10px] text-muted-foreground border border-border rounded px-1.5 py-0.5">esc</kbd>
        </div>

        <div className="max-h-[60vh] overflow-y-auto py-2">
          {commands.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">No results for “{query}”</div>
          ) : (
            groups.map((group) => {
              const items = commands.filter((c) => c.group === group);
              if (items.length === 0) return null;
              return (
                <div key={group} className="px-2 pb-1">
                  <div className="px-2 py-1.5 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">{group}</div>
                  {items.map((c) => {
                    runningIndex += 1;
                    const idx = runningIndex;
                    const isActive = idx === active;
                    const Icon = c.icon;
                    return (
                      <button
                        key={c.id}
                        onClick={c.run}
                        onMouseEnter={() => setActive(idx)}
                        className={cn(
                          "w-full flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm text-left transition-colors",
                          isActive ? "bg-accent text-foreground" : "text-muted-foreground",
                        )}
                      >
                        <Icon size={15} className="flex-shrink-0" />
                        <span className="flex-1 truncate text-foreground">{c.label}</span>
                        {c.hint && <span className="text-xs text-muted-foreground tabular-nums">{c.hint}</span>}
                        {isActive && <CornerDownLeft size={13} className="text-muted-foreground" />}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
