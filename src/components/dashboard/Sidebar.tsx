"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, ShoppingCart, Users, Receipt, BarChart3, Settings, Zap, LogOut, PanelLeftClose, PanelLeftOpen, ClipboardList, X } from "lucide-react";
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
  const { sidebarCollapsed, toggleSidebar, mobileSidebarOpen, setMobileSidebarOpen } = useUIStore();
  const user = useAuthStore((s) => s.user);
  const role = (user?.role ?? "cashier") as UserRole;
  const visible = navItems.filter((i) => (i.roles as readonly string[]).includes(role));

  // `sidebarCollapsed` only affects the desktop (md+) layout — on mobile the
  // drawer is always full width with labels. So collapse-driven classes are all
  // gated behind `md:`.
  const closeMobile = () => setMobileSidebarOpen(false);

  return (
    <>
      {/* Mobile backdrop */}
      {mobileSidebarOpen && (
        <div
          onClick={closeMobile}
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 h-full z-50 flex flex-col bg-sidebar border-r border-sidebar-border",
          "transition-transform duration-300 ease-in-out md:transition-all",
          // Width: full drawer width on mobile; desktop honors collapse
          "w-60",
          sidebarCollapsed ? "md:w-16" : "md:w-60",
          // Slide in/out on mobile; always visible on desktop
          mobileSidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0",
        )}
      >
        <div className={cn("flex items-center h-16 px-4 border-b border-sidebar-border flex-shrink-0 gap-3", sidebarCollapsed && "md:justify-center md:gap-0")}>
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center flex-shrink-0"><Zap size={15} className="text-white" /></div>
          <span className={cn("text-base font-bold text-sidebar-foreground truncate", sidebarCollapsed && "md:hidden")} style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>MiniERP</span>
          {/* Mobile-only collapse/close button */}
          <button
            onClick={closeMobile}
            aria-label="Collapse menu"
            className="md:hidden ml-auto p-1.5 rounded-lg text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all"
          >
            <X size={18} />
          </button>
        </div>
        <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-0.5">
          {visible.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link key={item.href} href={item.href} onClick={closeMobile} title={sidebarCollapsed ? item.label : undefined}
                className={cn("flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all relative group", active ? "bg-indigo-600/15 text-indigo-600 dark:text-indigo-300" : "text-sidebar-foreground/50 hover:text-sidebar-foreground hover:bg-sidebar-accent", sidebarCollapsed && "md:justify-center")}>
                {active && <span className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-indigo-500 rounded-r-full" />}
                <item.icon size={17} className="flex-shrink-0" />
                <span className={cn("truncate", sidebarCollapsed && "md:hidden")}>{item.label}</span>
                {sidebarCollapsed && <span className="hidden md:block absolute left-full ml-3 px-2 py-1 bg-popover border border-border text-popover-foreground text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl">{item.label}</span>}
              </Link>
            );
          })}
        </nav>
        <div className="border-t border-sidebar-border p-2 space-y-1 flex-shrink-0">
          {user && (
            <div className={cn("px-3 py-2", sidebarCollapsed && "md:hidden")}>
              <div className="text-xs font-medium text-sidebar-foreground/70 truncate">{user.full_name ?? user.email}</div>
              <span className={cn("inline-block text-xs px-1.5 py-0.5 rounded-full capitalize font-medium mt-0.5", role === "admin" && "bg-indigo-500/20 text-indigo-600 dark:text-indigo-300", role === "manager" && "bg-emerald-500/20 text-emerald-600 dark:text-emerald-300", role === "cashier" && "bg-amber-500/20 text-amber-600 dark:text-amber-300")}>{role}</span>
            </div>
          )}
          <form action={signOut}>
            <button type="submit" title={sidebarCollapsed ? "Sign out" : undefined} className={cn("w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/40 hover:text-sidebar-foreground hover:bg-sidebar-accent transition-all", sidebarCollapsed && "md:justify-center")}>
              <LogOut size={16} className="flex-shrink-0" /><span className={cn(sidebarCollapsed && "md:hidden")}>Sign out</span>
            </button>
          </form>
          {/* Collapse toggle — desktop only (mobile uses the drawer) */}
          <button onClick={toggleSidebar} title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"} className={cn("hidden md:flex w-full items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-sidebar-foreground/30 hover:text-sidebar-foreground/70 hover:bg-sidebar-accent transition-all", sidebarCollapsed && "md:justify-center")}>
            {sidebarCollapsed ? <PanelLeftOpen size={16} className="flex-shrink-0" /> : <><PanelLeftClose size={16} className="flex-shrink-0" /><span>Collapse</span></>}
          </button>
        </div>
      </aside>

      {/* Desktop-only edge handle to expand a collapsed sidebar */}
      {sidebarCollapsed && (
        <button onClick={toggleSidebar} title="Expand sidebar" className="hidden md:flex fixed left-16 top-1/2 -translate-y-1/2 z-50 w-4 h-10 bg-sidebar border border-sidebar-border border-l-0 rounded-r-lg items-center justify-center text-sidebar-foreground/30 hover:text-sidebar-foreground/70 transition-all">
          <PanelLeftOpen size={11} />
        </button>
      )}
    </>
  );
}
