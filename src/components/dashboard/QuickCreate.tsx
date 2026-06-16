"use client";

import { useRouter } from "next/navigation";
import { Plus, ShoppingCart, Package, Users, Receipt, ChevronDown } from "lucide-react";
import {
  DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

export function QuickCreate() {
  const router = useRouter();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="hidden sm:flex items-center gap-1.5 h-9 px-3 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium transition-all focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/40">
          <Plus size={15} /> New <ChevronDown size={13} className="opacity-70" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        <DropdownMenuItem onClick={() => router.push("/dashboard/pos")}>
          <ShoppingCart size={15} /> New sale
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/inventory/new")}>
          <Package size={15} /> New product
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/customers")}>
          <Users size={15} /> New customer
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => router.push("/dashboard/expenses")}>
          <Receipt size={15} /> New expense
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
