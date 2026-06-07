"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Receipt, BarChart3, Settings, Zap, LogOut, PanelLeftClose, PanelLeftOpen, ClipboardList } from "lucide-react";
import { useUIStore } from "@/store/useUIStore";
import { useAuthStore } from "@/store/useAuthStore";
import { signOut } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";
import { UserRole } from "@/types";

const navItems = [
  { label: "Dashboard",    href: "/dashboard",           icon: LayoutDashboard, roles: ["admin","manager","cashier"] },
  { label: "Inventory",    href: "/dashboard/inventory", icon: Package,         roles: ["admin","manager"] },
  { label: "POS / Sales",  href: "/dashboard/pos",       icon: ShoppingCart,    roles: ["admin","manager","cashier"] },
  { label: "Sales History",href: "/dashboard/sales",     icon: ClipboardList,   roles: ["admin","manager"] },
  { label: "Customers",    href: "/dashboard/customers", icon: Users,           roles: ["admin","manager"] },
  { label: "Expenses",     href: "/dashboard/expenses",  icon: Receipt,         roles: ["admin","manager"] },
  { label: "Reports",      href: "/dashboard/reports",   icon: BarChart3,       roles: ["admin","manager"] },
  { label: "Settings",     href: "/dashboard/settings",  icon: Settings,        roles: ["admin"] },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const { sidebarCollapsed, toggleSidebar } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "cashier") as UserRole;
  const visible = navItems.filter((i) => (i.roles as readonly string[]).includes(role));

  return (
    <>
      <aside className={cn("fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ease-in-out bg-sidebar border-r border-sidebar-border", sidebarCollapsed ? "w-16" : "w-60")}>
        <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0", sidebarCollapsed ? "justify-center" : "gap-3")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0"><Zap size={15} className="text-white" /></div>
          {!sidebarCollapsed && <span className="text-base font-bold text-sidebar-foreground truncate" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>MiniERP</span>}
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {visible.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} title={sidebarCollapsed ? item.label : undefined}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group", active ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent", sidebarCollapsed && "justify-center")}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />}
                <item.icon size={17} className="flex-shrink-0" />
                {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                {sidebarCollapsed && <span className="absolute left-full ml-3 px-2 py-1 bg-popover border border-border text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-2 space-y-1 flex-shrink-0">
          {!sidebarCollapsed && user && (
            <div className="px-3 py-2">
              <div className="text-xs font-medium text-sidebar-foreground/70 truncate">{user.full_name ?? user.email}</div>
              <span className={cn("inline-block text-xs px-1.5 py-0.5 rounded-full capitalize font-medium mt-0.5", role === "admin" && "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300", role === "manager" && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300", role === "cashier" && "bg-amber-500/20 text-amber-600 dark:text-amber-300")}>{role}</span>
            </div>
          )}
          <form action={signOut}>
            <button type="submit" title={sidebarCollapsed ? "Sign out" : undefined} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all", sidebarCollapsed && "justify-center")}>
              <LogOut size={16} className="flex-shrink-0" />{!sidebarCollapsed && <span>Sign out</span>}
            </button>
          </form>
          <button onClick={toggleSidebar} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/30 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all", sidebarCollapsed && "justify-center")}>
            {sidebarCollapsed ? <PanelLeftOpen size={16} className="flex-shrink-0" /> : <><PanelLeftClose size={16} className="flex-shrink-0" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
      {sidebarCollapsed && (
        <button onClick={toggleSidebar} title="Expand sidebar" className="fixed left-16 top-1/2 -translate-y-1/2 z-50 w-4 h-10 bg-sidebar border border-sidebar-border border-l-0 rounded-r-lg flex items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground/70 transition-all">
          <PanelLeftOpen size={11} />
        </button>
      )}
    </>
  );
}
