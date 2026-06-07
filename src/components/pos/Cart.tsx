"use client";

import { Minus, Plus, Trash2, ShoppingCart, Tag } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { formatCurrency } from "@/lib/utils/index";
import { CustomerSearch } from "./CustomerSearch";
import { cn } from "@/lib/utils";

const PAYMENT_METHODS = [
  { value: "cash",          label: "Cash"          },
  { value: "card",          label: "Card"          },
  { value: "mobile_money",  label: "Mobile Money"  },
  { value: "bank_transfer", label: "Bank Transfer" },
];

interface Props {
  currency?: string;
  onCheckout: () => void;
}

export function Cart({ currency = "USD", onCheckout }: Props) {
  const {
    items, discount_amount, payment_method,
    updateQuantity, removeItem, setDiscount, setPaymentMethod,
    subtotal, total,
  } = useCartStore();

  const sub   = subtotal();
  const disc  = discount_amount;
  const tot   = total();

  if (items.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-3">Customer</h3>
          <CustomerSearch currency={currency} />
        </div>
        <div className="flex-1 flex flex-col items-center justify-center text-muted-foreground gap-3">
          <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
            <ShoppingCart size={24} className="opacity-40" />
          </div>
          <p className="text-sm">Cart is empty</p>
          <p className="text-xs text-center">Click a product on the left to add it</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full gap-4">
      {/* Customer */}
      <div>
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Customer</h3>
        <CustomerSearch currency={currency} />
      </div>

      {/* Items */}
      <div className="flex-1 overflow-y-auto space-y-2 min-h-0">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Items ({items.length})
        </h3>
        {items.map((item) => (
          <div key={item.product.id} className="bg-muted/30 border border-border rounded-xl p-3">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{item.product.name}</p>
                <p className="text-xs text-muted-foreground">{formatCurrency(item.unit_price, currency)} each</p>
              </div>
              <button onClick={() => removeItem(item.product.id)}
                className="p-1 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                <Trash2 size={13} />
              </button>
            </div>
            <div className="flex items-center justify-between">
              {/* Qty controls */}
              <div className="flex items-center gap-2">
                <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                  <Minus size={12} />
                </button>
                <span className="text-sm font-semibold text-foreground w-6 text-center">{item.quantity}</span>
                <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                  disabled={item.quantity >= item.product.quantity}
                  className="w-7 h-7 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-accent transition-all disabled:opacity-30">
                  <Plus size={12} />
                </button>
              </div>
              <span className="text-sm font-bold text-foreground">
                {formatCurrency(item.unit_price * item.quantity, currency)}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Discount */}
      <div>
        <label className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
          <Tag size={11} /> Discount
        </label>
        <div className="relative">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">$</span>
          <input
            type="number" min="0" step="0.01"
            value={disc || ""}
            onChange={(e) => setDiscount(parseFloat(e.target.value) || 0)}
            placeholder="0.00"
            className="w-full pl-7 pr-4 py-2 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
          />
        </div>
      </div>

      {/* Payment method */}
      <div>
        <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2 block">
          Payment Method
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {PAYMENT_METHODS.map((m) => (
            <button key={m.value} onClick={() => setPaymentMethod(m.value as any)}
              className={cn(
                "py-2 text-xs font-medium rounded-lg border transition-all",
                payment_method === m.value
                  ? "bg-primary/10 border-primary/40 text-primary"
                  : "border-border text-muted-foreground hover:text-foreground hover:bg-accent"
              )}>
              {m.label}
            </button>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="bg-muted/30 rounded-xl p-3 space-y-1.5">
        <div className="flex justify-between text-sm text-muted-foreground">
          <span>Subtotal</span>
          <span>{formatCurrency(sub, currency)}</span>
        </div>
        {disc > 0 && (
          <div className="flex justify-between text-sm text-red-500">
            <span>Discount</span>
            <span>-{formatCurrency(disc, currency)}</span>
          </div>
        )}
        <div className="flex justify-between text-base font-bold text-foreground pt-1 border-t border-border">
          <span>Total</span>
          <span>{formatCurrency(tot, currency)}</span>
        </div>
      </div>

      {/* Checkout */}
      <button onClick={onCheckout}
        className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold text-sm transition-all">
        Charge {formatCurrency(tot, currency)}
      </button>
    </div>
  );
}
