"use client";

import { useUIStore } from "@/store/useUIStore";
import { cn } from "@/lib/utils";

export function SidebarOffset({ children }: { children: React.ReactNode }) {
  const { sidebarCollapsed } = useUIStore();
  return (
    <div className={cn("transition-all duration-300", sidebarCollapsed ? "ml-16" : "ml-60")}>
      {children}
    </div>
  );
}
