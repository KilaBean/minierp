"use client";

import { useState, useCallback } from "react";
import { Search, Package, Plus, AlertTriangle } from "lucide-react";
import { Product, Category } from "@/types";
import { formatCurrency, debounce } from "@/lib/utils/index";
import { useCartStore } from "@/store/useCartStore";
import { cn } from "@/lib/utils";

interface Props {
  products: Product[];
  categories: Category[];
  currency?: string;
}

export function ProductGrid({ products, categories, currency = "USD" }: Props) {
  const [search,     setSearch]     = useState("");
  const [activecat,  setActiveCat]  = useState("");
  const addItem = useCartStore((s) => s.addItem);
  const cartItems = useCartStore((s) => s.items);

  const filtered = products.filter((p) => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || (p.sku ?? "").toLowerCase().includes(search.toLowerCase());
    const matchCat = !activecat || p.category_id === activecat;
    return matchSearch && matchCat && p.is_active;
  });

  function getCartQty(productId: string) {
    return cartItems.find((i) => i.product.id === productId)?.quantity ?? 0;
  }

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="p-4 border-b border-border space-y-3">
        <div className="relative">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products or scan barcode…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl
              text-foreground placeholder:text-muted-foreground
              focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
        {/* Category chips */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => setActiveCat("")}
            className={cn("px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all",
              !activecat ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
            )}>
            All
          </button>
          {categories.map((c) => (
            <button key={c.id} onClick={() => setActiveCat(c.id)}
              className={cn("px-3 py-1.5 text-xs font-medium rounded-full border whitespace-nowrap transition-all",
                activecat === c.id ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}>
              {c.name}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto p-4">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <Package size={32} className="text-muted-foreground/30 mb-3" />
            <p className="text-sm text-muted-foreground">No products found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {filtered.map((product) => {
              const cartQty = getCartQty(product.id);
              const outOfStock = product.quantity === 0;
              const maxReached = cartQty >= product.quantity;

              return (
                <button
                  key={product.id}
                  onClick={() => addItem(product)}
                  disabled={outOfStock || maxReached}
                  className={cn(
                    "relative flex flex-col items-start p-3 rounded-xl border text-left transition-all duration-150 group",
                    outOfStock || maxReached
                      ? "border-border opacity-50 cursor-not-allowed"
                      : "border-border hover:border-primary/40 hover:bg-primary/5 active:scale-[0.98]",
                    cartQty > 0 && "border-primary/30 bg-primary/5"
                  )}
                >
                  {/* Image / icon */}
                  <div className="w-full aspect-square rounded-lg bg-muted flex items-center justify-center mb-3 overflow-hidden">
                    {product.image_url
                      ? <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                      : <Package size={24} className="text-muted-foreground/40" />
                    }
                  </div>

                  <p className="text-xs font-medium text-foreground line-clamp-2 mb-1">{product.name}</p>
                  <p className="text-sm font-bold text-primary">{formatCurrency(product.price, currency)}</p>

                  {/* Stock badge */}
                  {outOfStock ? (
                    <span className="absolute top-2 right-2 text-[10px] bg-red-500/15 text-red-500 px-1.5 py-0.5 rounded-full">Out</span>
                  ) : product.quantity <= product.low_stock_threshold ? (
                    <span className="absolute top-2 right-2 text-[10px] bg-amber-500/15 text-amber-500 px-1.5 py-0.5 rounded-full flex items-center gap-0.5">
                      <AlertTriangle size={9} />{product.quantity}
                    </span>
                  ) : null}

                  {/* Cart qty bubble */}
                  {cartQty > 0 && (
                    <span className="absolute top-2 left-2 w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
                      {cartQty}
                    </span>
                  )}

                  {/* Add overlay */}
                  {!outOfStock && !maxReached && (
                    <div className="absolute inset-0 rounded-xl flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-primary/10">
                      <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center shadow-lg">
                        <Plus size={16} className="text-primary-foreground" />
                      </div>
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
