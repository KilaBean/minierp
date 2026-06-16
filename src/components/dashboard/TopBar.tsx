"use client";

import { usePathname } from "next/navigation";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { NotificationBell } from "./NotificationBell";
import { CommandPalette } from "./CommandPalette";
import { UserMenu } from "./UserMenu";
import { QuickCreate } from "./QuickCreate";

const routeLabels: Record<string, string> = {
  "/dashboard":            "Dashboard",
  "/dashboard/inventory":  "Inventory",
  "/dashboard/pos":        "Point of Sale",
  "/dashboard/customers":  "Customers",
  "/dashboard/expenses":   "Expenses",
  "/dashboard/reports":    "Reports",
  "/dashboard/settings":   "Settings",
  "/dashboard/sales":      "Sales History",
};

function openPalette() {
  window.dispatchEvent(new Event("minierp:open-palette"));
}

export function TopBar() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const { sidebarCollapsed, toggleMobileSidebar } = useUIStore();
  const { theme, setTheme }  = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  // Closest matching route label (handles detail pages like /dashboard/sales/123)
  const matched = Object.keys(routeLabels)
    .filter((r) => pathname === r || (r !== "/dashboard" && pathname.startsWith(r)))
    .sort((a, b) => b.length - a.length)[0] ?? "/dashboard";
  const pageTitle = routeLabels[matched];
  const isSubPage = matched !== "/dashboard";

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 z-30 flex items-center justify-between gap-3 px-4 sm:px-6",
      "bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
      "left-0",
      sidebarCollapsed ? "md:left-16" : "md:left-60"
    )}>
      {/* Left: hamburger + breadcrumb/title */}
      <div className="flex items-center gap-2 min-w-0">
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
          className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          {isSubPage && (
            <div className="text-[11px] text-muted-foreground hidden sm:block">Dashboard</div>
          )}
          <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
        </div>
      </div>

      {/* Center: command-palette search field (md+) */}
      <button
        onClick={openPalette}
        className="hidden md:flex items-center gap-2 flex-1 max-w-xs h-9 px-3 rounded-xl border border-border bg-muted/40 text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
      >
        <Search size={15} className="flex-shrink-0" />
        <span className="text-sm truncate">Search…</span>
        <kbd className="ml-auto text-[10px] border border-border rounded px-1.5 py-0.5 bg-background">⌘K</kbd>
      </button>

      {/* Right: actions */}
      <div className="flex items-center gap-1">
        {/* Mobile search icon */}
        <button
          onClick={openPalette}
          aria-label="Search"
          className="md:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Search size={16} />
        </button>

        <QuickCreate />

        {user?.business_id && <NotificationBell businessId={user.business_id} />}

        <button
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          title={mounted ? (theme === "dark" ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
          className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          {mounted
            ? theme === "dark" ? <Sun size={16} /> : <Moon size={16} />
            : <Sun size={16} />
          }
        </button>

        <UserMenu />
      </div>

      <CommandPalette />
    </header>
  );
}
