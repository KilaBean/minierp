"use client";

import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { User, Settings, SunMoon, LogOut } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/useAuthStore";
import { signOut } from "@/lib/actions/auth";
import { getInitials } from "@/lib/utils/index";

export function UserMenu() {
  const router = useRouter();
  const user   = useAuthStore((s) => s.user);
  const { theme, setTheme } = useTheme();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          aria-label="Account menu"
          className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs font-bold text-white ml-1 select-none focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40 transition-all"
        >
          {user?.full_name ? getInitials(user.full_name) : "U"}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-foreground truncate">{user?.full_name ?? user?.email ?? "Account"}</span>
          <span className="text-xs font-normal text-muted-foreground capitalize">
            {user?.role ?? "user"}{user?.business_name ? ` · ${user.business_name}` : ""}
          </span>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <User size={15} /> Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/settings")}>
          <Settings size={15} /> Settings
        </DropdownMenuItem>
        <DropdownMenuItem onClick={(e) => { e.preventDefault(); setTheme(theme === "dark" ? "light" : "dark"); }}>
          <SunMoon size={15} /> Toggle theme
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => signOut()} className="text-rose-600 dark:text-rose-400 focus:text-rose-600">
          <LogOut size={15} /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
