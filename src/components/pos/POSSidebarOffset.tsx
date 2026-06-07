"use client";

import { useUIStore } from "@/store/useUIStore";
import { useEffect } from "react";

export function POSSidebarWidth() {
  const { sidebarCollapsed } = useUIStore();

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      sidebarCollapsed ? "64px" : "240px"
    );
  }, [sidebarCollapsed]);

  return null;
}
