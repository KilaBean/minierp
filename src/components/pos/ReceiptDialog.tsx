"use client";

import { CheckCircle, Download, ShoppingCart, X } from "lucide-react";
import { generateReceiptPDF } from "@/lib/utils/pdf";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";
import Link from "next/link";

interface SaleData {
  id: string;
  sale_number: string;
  created_at: string;
  total_amount: number;
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  payment_method: string;
  customer_name?: string;
  cashier_name?: string;
  items: Array<{
    name: string;
    quantity: number;
    unit_price: number;
    discount_amount: number;
    total_price: number;
  }>;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  currency?: string;
}

interface Props {
  sale: SaleData | null;
  onClose: () => void;
}

export function ReceiptDialog({ sale, onClose }: Props) {
  if (!sale) return null;

  function handleDownload() {
    generateReceiptPDF({
      sale_number:      sale!.sale_number,
      created_at:       sale!.created_at,
      cashier_name:     sale!.cashier_name,
      business_name:    sale!.business_name,
      business_address: sale!.business_address,
      business_phone:   sale!.business_phone,
      customer_name:    sale!.customer_name,
      items:            sale!.items,
      subtotal:         sale!.subtotal,
      discount_amount:  sale!.discount_amount,
      tax_amount:       sale!.tax_amount,
      total_amount:     sale!.total_amount,
      payment_method:   sale!.payment_method,
      currency:         sale!.currency,
    });
  }

  const currency = sale.currency ?? "USD";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Success header */}
        <div className="bg-emerald-500/10 border-b border-border px-6 pt-6 pb-5 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
            <CheckCircle size={24} className="text-emerald-500" />
          </div>
          <h3 className="text-base font-bold text-foreground mb-0.5"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Payment Complete
          </h3>
          <p className="text-xs text-muted-foreground">{sale.sale_number}</p>
        </div>

        {/* Receipt body */}
        <div className="px-6 py-4 space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Date</span>
            <span className="text-foreground">{formatDateTime(sale.created_at)}</span>
          </div>
          {sale.customer_name && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Customer</span>
              <span className="text-foreground">{sale.customer_name}</span>
            </div>
          )}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Items</span>
            <span className="text-foreground">{sale.items.length}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Payment</span>
            <span className="text-foreground capitalize">{sale.payment_method.replace("_", " ")}</span>
          </div>
          {sale.discount_amount > 0 && (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Discount</span>
              <span className="text-red-500">-{formatCurrency(sale.discount_amount, currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-bold text-foreground pt-2 border-t border-border">
            <span>Total Charged</span>
            <span className="text-primary text-lg">{formatCurrency(sale.total_amount, currency)}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 pb-6 flex flex-col gap-2">
          <button onClick={handleDownload}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all">
            <Download size={14} /> Download Receipt PDF
          </button>
          <Link href={`/dashboard/sales/${sale.id}`}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
            View Sale Details
          </Link>
          <button onClick={onClose}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ShoppingCart size={14} /> New Sale
          </button>
        </div>
      </div>
    </div>
  );
}
