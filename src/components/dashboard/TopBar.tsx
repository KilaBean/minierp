"use client";

import { usePathname } from "next/navigation";
import { Search, Sun, Moon, Menu } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/useAuthStore";
import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";
import { getInitials } from "@/lib/utils/index";
import { NotificationBell } from "./NotificationBell";

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

export function TopBar() {
  const pathname = usePathname();
  const user     = useAuthStore((s) => s.user);
  const { sidebarCollapsed, toggleMobileSidebar } = useUIStore();
  const { theme, setTheme }  = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const pageTitle = routeLabels[pathname] ?? "Dashboard";

  return (
    <header className={cn(
      "fixed top-0 right-0 h-16 z-30 flex items-center justify-between px-4 sm:px-6",
      "bg-background/80 backdrop-blur-md border-b border-border transition-all duration-300",
      "left-0",
      sidebarCollapsed ? "md:left-16" : "md:left-60"
    )}>
      {/* Left */}
      <div className="flex items-center gap-2 min-w-0">
        {/* Hamburger — mobile only */}
        <button
          onClick={toggleMobileSidebar}
          aria-label="Open menu"
          className="md:hidden p-2 -ml-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
        >
          <Menu size={18} />
        </button>
        <div className="min-w-0">
          <h1 className="text-sm font-semibold text-foreground truncate">{pageTitle}</h1>
          <p className="text-xs text-muted-foreground hidden sm:block truncate">
            {user?.business_name ?? "Your Business"}
          </p>
        </div>
      </div>

      {/* Right */}
      <div className="flex items-center gap-1">
        {/* Search */}
        <button className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
          <Search size={16} />
        </button>

        {/* Notifications — real component */}
        {user?.business_id && (
          <NotificationBell businessId={user.business_id} />
        )}

        {/* Theme toggle */}
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

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white ml-1 cursor-pointer select-none">
          {user?.full_name ? getInitials(user.full_name) : "U"}
        </div>
      </div>
    </header>
  );
}
