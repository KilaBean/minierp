"use client";

import { useState } from "react";
import { Loader2, CheckCircle, Receipt } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { createSale } from "@/lib/actions/sales";
import { formatCurrency } from "@/lib/utils/index";

interface Props {
  open: boolean;
  onClose: () => void;
  onSuccess: (saleId: string, saleNumber: string) => void;
  currency?: string;
  taxRate?: number;
  businessName?: string;
}

export function CheckoutDialog({ open, onClose, onSuccess, currency = "USD", taxRate = 0, businessName }: Props) {
  const [pending, setPending] = useState(false);
  const cart = useCartStore();

  if (!open) return null;

  const sub  = cart.subtotal();
  const disc = cart.discount_amount;
  const tax  = (sub - disc) * (taxRate / 100);
  const tot  = Math.max(0, sub - disc + tax);

  async function handleConfirm() {
    if (cart.items.length === 0) return;
    setPending(true);
    try {
      const result = await createSale({
        items:           cart.items,
        customer_id:     cart.customer_id,
        discount_amount: cart.discount_amount,
        payment_method:  cart.payment_method,
        notes:           cart.notes,
        tax_rate:        taxRate,
      });
      if (!result.success) { toast.error(result.error ?? "Checkout failed"); return; }
      toast.success("Sale completed!");
      cart.clearCart();
      onSuccess(result.data!.id, result.data!.sale_number);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">

        <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Receipt size={22} className="text-primary" />
        </div>

        <h3 className="text-base font-bold text-foreground text-center mb-1"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Confirm Payment
        </h3>
        <p className="text-xs text-muted-foreground text-center mb-5">
          {cart.customer_name ? `Customer: ${cart.customer_name}` : "Walk-in customer"}
        </p>

        {/* Summary */}
        <div className="bg-muted/40 rounded-xl p-4 space-y-2 mb-5">
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>{cart.items.length} item{cart.items.length !== 1 ? "s" : ""}</span>
            <span>{formatCurrency(sub, currency)}</span>
          </div>
          {disc > 0 && (
            <div className="flex justify-between text-sm text-red-500">
              <span>Discount</span>
              <span>-{formatCurrency(disc, currency)}</span>
            </div>
          )}
          {tax > 0 && (
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>Tax ({taxRate}%)</span>
              <span>{formatCurrency(tax, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span className="text-lg text-primary">{formatCurrency(tot, currency)}</span>
          </div>
          <div className="text-xs text-muted-foreground text-center pt-1 capitalize">
            via {cart.payment_method.replace("_", " ")}
          </div>
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={pending}
            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
            Cancel
          </button>
          <button onClick={handleConfirm} disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-all disabled:opacity-60">
            {pending
              ? <><Loader2 size={14} className="animate-spin" /> Processing…</>
              : <><CheckCircle size={14} /> Confirm</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}
