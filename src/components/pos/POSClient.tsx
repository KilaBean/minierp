"use client";

import { useState } from "react";
import { ProductGrid } from "./ProductGrid";
import { Cart } from "./Cart";
import { CheckoutDialog } from "./CheckoutDialog";
import { ReceiptDialog } from "./ReceiptDialog";
import { Product, Category } from "@/types";
import { getSale } from "@/lib/actions/sales";

interface Props {
  products: Product[];
  categories: Category[];
  currency: string;
  taxRate: number;
  businessName: string;
  businessAddress?: string;
  businessPhone?: string;
  cashierName?: string;
}

export function POSClient({
  products, categories, currency, taxRate,
  businessName, businessAddress, businessPhone, cashierName,
}: Props) {
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [receiptSale,  setReceiptSale]  = useState<any>(null);

  async function handleSaleSuccess(saleId: string, saleNumber: string) {
    setCheckoutOpen(false);
    // Fetch full sale for receipt
    const sale = await getSale(saleId) as any;
    if (sale) {
      setReceiptSale({
        id:               sale.id,
        sale_number:      sale.sale_number,
        created_at:       sale.created_at,
        total_amount:     sale.total_amount,
        subtotal:         sale.subtotal,
        discount_amount:  sale.discount_amount,
        tax_amount:       sale.tax_amount,
        payment_method:   sale.payment_method,
        customer_name:    sale.customers?.name,
        cashier_name:     cashierName,
        items:            (sale.items ?? []).map((i: any) => ({
          name:            i.products?.name ?? "Product",
          quantity:        i.quantity,
          unit_price:      i.unit_price,
          discount_amount: i.discount_amount,
          total_price:     i.total_price,
        })),
        business_name:    businessName,
        business_address: businessAddress,
        business_phone:   businessPhone,
        currency,
      });
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] -m-6 overflow-hidden">
      {/* Left — product grid */}
      <div className="flex-1 flex flex-col p-5 overflow-hidden border-r border-border">
        <h2 className="text-base font-bold text-foreground mb-4 flex-shrink-0"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Point of Sale
        </h2>
        <div className="flex-1 overflow-hidden">
          <ProductGrid products={products} categories={categories} currency={currency} />
        </div>
      </div>

      {/* Right — cart */}
      <div className="w-80 xl:w-96 flex flex-col p-5 bg-muted/20 flex-shrink-0 overflow-hidden">
        <h2 className="text-base font-bold text-foreground mb-4 flex-shrink-0"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Order
        </h2>
        <div className="flex-1 overflow-hidden">
          <Cart currency={currency} onCheckout={() => setCheckoutOpen(true)} />
        </div>
      </div>

      {/* Dialogs */}
      <CheckoutDialog
        open={checkoutOpen}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={handleSaleSuccess}
        currency={currency}
        taxRate={taxRate}
        businessName={businessName}
      />
      <ReceiptDialog
        sale={receiptSale}
        onClose={() => setReceiptSale(null)}
      />
    </div>
  );
}
