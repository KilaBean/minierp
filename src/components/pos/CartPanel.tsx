"use client";

import { Minus, Plus, Trash2, ShoppingCart, User } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils/index";
import { CustomerSearch } from "./CustomerSearch";
import { CheckoutButton } from "./CheckoutButton";
import { cn } from "@/lib/utils";

interface Props { currency?: string; taxRate?: number; }

const paymentMethods = [
  { value: "cash",          label: "Cash"     },
  { value: "card",          label: "Card"     },
  { value: "mobile_money",  label: "Mobile"   },
  { value: "bank_transfer", label: "Bank"     },
] as const;

export function CartPanel({ currency = "USD", taxRate = 0 }: Props) {
  const { items, customer_name, discount_amount, payment_method,
    removeItem, updateQuantity, updateItemDiscount,
    setDiscount, setPaymentMethod, setNotes, notes,
    subtotal, total, itemCount, setCustomer } = useCartStore();

  const sub      = subtotal();
  const discount = discount_amount;
  const tax      = (sub - discount) * (taxRate / 100);
  const grandTotal = Math.max(0, sub - discount + tax);

  return (
    <div className="flex flex-col h-full bg-card border-l border-border">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border">
        <div className="flex items-center gap-2">
          <ShoppingCart size={17} className="text-primary" />
          <span className="text-sm font-semibold text-foreground">Cart</span>
          {itemCount() > 0 && (
            <span className="w-5 h-5 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center">
              {itemCount()}
            </span>
          )}
        </div>
        {items.length > 0 && (
          <button onClick={() => useCartStore.getState().clearCart()}
            className="text-xs text-muted-foreground hover:text-destructive transition-colors">
            Clear all
          </button>
        )}
      </div>

      {/* Customer */}
      <div className="px-5 py-3 border-b border-border">
        <CustomerSearch currency={currency} />
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto px-5 py-3 space-y-3">
        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <ShoppingCart size={32} className="text-muted-foreground/20 mb-3" />
            <p className="text-sm text-muted-foreground">Cart is empty</p>
            <p className="text-xs text-muted-foreground/60 mt-1">Click products to add them</p>
          </div>
        ) : (
          items.map((item) => (
            <div key={item.product.id} className="bg-background border border-border rounded-xl p-3">
              <div className="flex items-start justify-between gap-2 mb-2">
                <p className="text-sm font-medium text-foreground line-clamp-1 flex-1">{item.product.name}</p>
                <button onClick={() => removeItem(item.product.id)}
                  className="text-muted-foreground hover:text-destructive transition-colors flex-shrink-0">
                  <Trash2 size={13} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                {/* Qty controls */}
                <div className="flex items-center gap-2">
                  <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                    className="w-6 h-6 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all">
                    <Minus size={11} />
                  </button>
                  <span className="text-sm font-semibold text-foreground w-6 text-center">{item.quantity}</span>
                  <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                    disabled={item.quantity >= item.product.quantity}
                    className="w-6 h-6 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-foreground/30 transition-all disabled:opacity-30">
                    <Plus size={11} />
                  </button>
                </div>
                <span className="text-sm font-bold text-foreground">
                  {formatCurrency(item.unit_price * item.quantity - item.discount_amount, currency)}
                </span>
              </div>
              {/* Per-item discount */}
              <div className="mt-2 flex items-center gap-2">
                <span className="text-xs text-muted-foreground">Item discount:</span>
                <input type="number" min="0" value={item.discount_amount || ""}
                  onChange={(e) => updateItemDiscount(item.product.id, parseFloat(e.target.value) || 0)}
                  placeholder="0"
                  className="w-20 px-2 py-0.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              </div>
            </div>
          ))
        )}
      </div>

      {/* Summary + checkout */}
      {items.length > 0 && (
        <div className="border-t border-border px-5 py-4 space-y-3">
          {/* Order discount */}
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground flex-1">Order discount</span>
            <input type="number" min="0" value={discount || ""}
              onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
              placeholder="0"
              className="w-24 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground focus:outline-none focus:ring-1 focus:ring-primary/30 text-right" />
          </div>

          {/* Totals */}
          <div className="space-y-1.5 text-sm">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span><span>{formatCurrency(sub, currency)}</span>
            </div>
            {discount > 0 && (
              <div className="flex justify-between text-red-500">
                <span>Discount</span><span>-{formatCurrency(discount, currency)}</span>
              </div>
            )}
            {taxRate > 0 && (
              <div className="flex justify-between text-muted-foreground">
                <span>Tax ({taxRate}%)</span><span>{formatCurrency(tax, currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-foreground text-base pt-1 border-t border-border">
              <span>Total</span><span>{formatCurrency(grandTotal, currency)}</span>
            </div>
          </div>

          {/* Payment method */}
          <div className="grid grid-cols-4 gap-1.5">
            {paymentMethods.map((pm) => (
              <button key={pm.value} onClick={() => setPaymentMethod(pm.value as any)}
                className={cn("py-1.5 text-xs font-medium rounded-lg border transition-all",
                  payment_method === pm.value ? "bg-primary text-primary-foreground border-primary" : "border-border text-muted-foreground hover:text-foreground"
                )}>
                {pm.label}
              </button>
            ))}
          </div>

          {/* Notes */}
          <input value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="Order notes (optional)…"
            className="w-full px-3 py-2 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />

          {/* Checkout */}
          <CheckoutButton total={grandTotal} currency={currency} taxRate={taxRate} />
        </div>
      )}
    </div>
  );
}
