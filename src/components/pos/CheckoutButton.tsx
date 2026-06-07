"use client";

import { useState } from "react";
import { Loader2, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/store/useCartStore";
import { createSale } from "@/lib/actions/sales";
import { formatCurrency } from "@/lib/utils/index";
import { ReceiptModal } from "./ReceiptModal";

interface Props { total: number; currency?: string; taxRate?: number; }

export function CheckoutButton({ total, currency = "USD", taxRate = 0 }: Props) {
  const [pending,  setPending]  = useState(false);
  const [receipt,  setReceipt]  = useState<{ id: string; sale_number: string } | null>(null);
  const cart = useCartStore();

  async function handleCheckout() {
    if (cart.items.length === 0) { toast.error("Cart is empty"); return; }
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
      if (!result.success || !result.data) { toast.error(result.error ?? "Checkout failed"); return; }
      setReceipt(result.data);
      cart.clearCart();
    } finally { setPending(false); }
  }

  return (
    <>
      <button onClick={handleCheckout} disabled={pending || cart.items.length === 0}
        className="w-full flex items-center justify-center gap-2 py-3.5 bg-primary hover:bg-primary/90
          text-primary-foreground rounded-xl font-bold text-sm transition-all
          disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary/20">
        {pending ? <Loader2 size={17} className="animate-spin" /> : <CreditCard size={17} />}
        {pending ? "Processing…" : `Charge ${formatCurrency(total, currency)}`}
      </button>

      {receipt && (
        <ReceiptModal
          saleId={receipt.id}
          saleNumber={receipt.sale_number}
          onClose={() => setReceipt(null)}
        />
      )}
    </>
  );
}
