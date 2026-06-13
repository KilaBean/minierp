"use client";

import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function SidebarOffset({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  // No left margin on mobile (sidebar is an overlay drawer); offset only at md+
  return (
    <div className={cn("transition-all duration-300", sidebarCollapsed ? "md:ml-16" : "md:ml-60")}>
      {children}
    </div>
  );
}
