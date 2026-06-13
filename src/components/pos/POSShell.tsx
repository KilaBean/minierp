"use client";

import { useState } from "react";
import { ShoppingCart, X } from "lucide-react";
import { ProductGrid } from "./ProductGrid";
import { CartPanel } from "./CartPanel";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils/index";
import { cn } from "@/lib/utils";
import { Product, Category } from "@/types";

interface Props {
  products: Product[];
  categories: Category[];
  currency: string;
  taxRate: number;
}

export function POSShell({ products, categories, currency, taxRate }: Props) {
  const [cartOpen, setCartOpen] = useState(false);
  const itemCount = useCartStore((s) => s.itemCount());
  const total = useCartStore((s) => s.total());

  return (
    <div
      className="fixed inset-0 pt-16 flex left-0 md:left-[var(--sidebar-width,240px)]"
    >
      {/* Product area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-background">
        <ProductGrid products={products} categories={categories} currency={currency} />
      </div>

      {/* Cart panel — desktop: fixed split. Mobile: off-canvas drawer */}
      <div
        className={cn(
          "flex-shrink-0 overflow-hidden flex flex-col bg-card z-40",
          "w-80 xl:w-96",
          // Mobile drawer
          "fixed inset-y-0 right-0 pt-16 transition-transform duration-300 max-w-[90vw]",
          cartOpen ? "translate-x-0" : "translate-x-full",
          // Desktop: static, always visible
          "md:static md:pt-0 md:translate-x-0 md:max-w-none md:z-auto",
        )}
      >
        {/* Mobile close button */}
        <button
          onClick={() => setCartOpen(false)}
          aria-label="Close cart"
          className="md:hidden absolute top-[4.5rem] right-3 z-10 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <X size={18} />
        </button>
        <CartPanel currency={currency} taxRate={taxRate} />
      </div>

      {/* Mobile backdrop */}
      {cartOpen && (
        <div
          onClick={() => setCartOpen(false)}
          className="md:hidden fixed inset-0 top-16 z-30 bg-black/50 backdrop-blur-sm"
          aria-hidden="true"
        />
      )}

      {/* Mobile floating "view cart" button */}
      {!cartOpen && (
        <button
          onClick={() => setCartOpen(true)}
          className="md:hidden fixed bottom-5 left-1/2 -translate-x-1/2 z-30 flex items-center gap-3 pl-4 pr-5 py-3 rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/30 active:scale-95 transition-transform"
        >
          <span className="relative">
            <ShoppingCart size={18} />
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-background text-foreground text-[9px] font-bold flex items-center justify-center border border-border">
                {itemCount}
              </span>
            )}
          </span>
          <span className="text-sm font-semibold">{formatCurrency(total, currency)}</span>
        </button>
      )}
    </div>
  );
}
