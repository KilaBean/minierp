"use client";

import { useEffect, useState, useRef } from "react";
import { Loader2, CheckCircle, Printer, X, Download } from "lucide-react";
import { getSale } from "@/lib/actions/sales";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";
import { cn } from "@/lib/utils";

interface Props { saleId: string; saleNumber: string; onClose: () => void; }

export function ReceiptModal({ saleId, saleNumber, onClose }: Props) {
  const [sale,    setSale]    = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    getSale(saleId).then((data) => { setSale(data); setLoading(false); });
  }, [saleId]);

  // Print using a hidden print stylesheet — no popup blockers, works everywhere
  function handlePrint() {
    if (!printRef.current) return;
    const printContent = printRef.current.innerHTML;

    // Inject a temporary <style> + hidden div into the current page
    const printId = "minierp-print-area";
    const styleId = "minierp-print-style";

    // Remove any previous print area
    document.getElementById(printId)?.remove();
    document.getElementById(styleId)?.remove();

    const style = document.createElement("style");
    style.id = styleId;
    style.innerHTML = `
      @media print {
        body > *:not(#${printId}) { display: none !important; }
        #${printId} {
          display: block !important;
          position: fixed;
          top: 0; left: 0;
          width: 100%;
          font-family: monospace;
          font-size: 13px;
          padding: 24px;
          color: #000;
          background: #fff;
        }
        #${printId} .r-row   { display: flex; justify-content: space-between; margin: 4px 0; }
        #${printId} .r-div   { border-top: 1px dashed #aaa; margin: 8px 0; }
        #${printId} .r-center{ text-align: center; }
        #${printId} .r-bold  { font-weight: bold; }
        #${printId} .r-lg    { font-size: 16px; }
        #${printId} .r-sm    { font-size: 11px; color: #555; }
      }
    `;

    const div = document.createElement("div");
    div.id = printId;
    div.style.display = "none"; // hidden normally, shown only in print
    div.innerHTML = printContent;

    document.head.appendChild(style);
    document.body.appendChild(div);

    window.print();

    // Cleanup after print dialog closes
    setTimeout(() => {
      document.getElementById(printId)?.remove();
      document.getElementById(styleId)?.remove();
    }, 1000);
  }

  const currency = sale?.businesses?.currency ?? "USD";

  // Build printable receipt HTML (plain HTML, no React components)
  function receiptHtml() {
    if (!sale) return "";
    const items = (sale.sale_items ?? [])
      .map((item: any) => `
        <div class="r-row">
          <span>${item.products?.name} × ${item.quantity}</span>
          <span>${formatCurrency(item.total_price, currency)}</span>
        </div>
        ${item.discount_amount > 0 ? `<div class="r-row r-sm"><span>Discount</span><span>-${formatCurrency(item.discount_amount, currency)}</span></div>` : ""}
      `)
      .join("");

    return `
      <div class="r-center r-bold r-lg">Receipt</div>
      <div class="r-center r-sm">${saleNumber}</div>
      <div class="r-center r-sm">${formatDateTime(sale.created_at)}</div>
      ${sale.customers ? `<div class="r-center r-sm">Customer: ${sale.customers.name}</div>` : ""}
      <div class="r-div"></div>
      ${items}
      <div class="r-div"></div>
      <div class="r-row"><span>Subtotal</span><span>${formatCurrency(sale.subtotal, currency)}</span></div>
      ${sale.discount_amount > 0 ? `<div class="r-row"><span>Discount</span><span>-${formatCurrency(sale.discount_amount, currency)}</span></div>` : ""}
      ${sale.tax_amount > 0 ? `<div class="r-row"><span>Tax</span><span>${formatCurrency(sale.tax_amount, currency)}</span></div>` : ""}
      <div class="r-div"></div>
      <div class="r-row r-bold r-lg"><span>TOTAL</span><span>${formatCurrency(sale.total_amount, currency)}</span></div>
      <div class="r-center r-sm" style="margin-top:12px">
        Payment: ${sale.payment_method?.replace("_", " ")}
      </div>
      <div class="r-center r-sm" style="margin-top:16px">Thank you for your business!</div>
    `;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div className="relative bg-card border border-border rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <div className="flex items-center gap-2">
            <CheckCircle size={18} className="text-emerald-500" />
            <span className="text-sm font-bold text-foreground">Sale Complete</span>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : sale ? (
          <>
            {/* On-screen receipt */}
            <div className="px-5 py-4 space-y-4">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">{saleNumber}</p>
                <p className="text-xs text-muted-foreground">{formatDateTime(sale.created_at)}</p>
                {sale.customers && (
                  <p className="text-xs font-medium text-foreground mt-1">
                    Customer: {sale.customers.name}
                  </p>
                )}
              </div>

              <div className="border-t border-dashed border-border" />

              <div className="space-y-2">
                {(sale.sale_items ?? []).map((item: any) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <div className="flex-1 min-w-0">
                      <span className="text-foreground truncate block">{item.products?.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unit_price, currency)}
                        {item.discount_amount > 0 && ` − ${formatCurrency(item.discount_amount, currency)}`}
                      </span>
                    </div>
                    <span className="font-medium text-foreground ml-2 flex-shrink-0">
                      {formatCurrency(item.total_price, currency)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-dashed border-border" />

              <div className="space-y-1.5 text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span><span>{formatCurrency(sale.subtotal, currency)}</span>
                </div>
                {sale.discount_amount > 0 && (
                  <div className="flex justify-between text-red-500">
                    <span>Discount</span><span>-{formatCurrency(sale.discount_amount, currency)}</span>
                  </div>
                )}
                {sale.tax_amount > 0 && (
                  <div className="flex justify-between text-muted-foreground">
                    <span>Tax</span><span>{formatCurrency(sale.tax_amount, currency)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-foreground text-base pt-1 border-t border-border">
                  <span>Total</span><span>{formatCurrency(sale.total_amount, currency)}</span>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground">
                Payment: <span className="capitalize">{sale.payment_method?.replace("_", " ")}</span>
              </div>
            </div>

            {/* Hidden print-only content */}
            <div ref={printRef} style={{ display: "none" }}
              dangerouslySetInnerHTML={{ __html: receiptHtml() }} />

            {/* Actions */}
            <div className="flex gap-3 px-5 pb-5">
              <button onClick={handlePrint}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 border border-border rounded-xl text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                <Printer size={15} /> Print receipt
              </button>
              <button onClick={onClose}
                className="flex-1 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl text-sm font-semibold transition-all">
                New Sale
              </button>
            </div>
          </>
        ) : (
          <div className="py-8 text-center text-muted-foreground text-sm px-5">
            Could not load receipt
          </div>
        )}
      </div>
    </div>
  );
}