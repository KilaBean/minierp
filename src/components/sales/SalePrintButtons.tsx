"use client";

import { Printer, ReceiptText } from "lucide-react";
import { formatCurrency, formatDateTime, formatDate } from "@/lib/utils/index";

interface Props {
  sale: any;
  businessName: string;
  currency: string;
}

/** Injects a hidden print area + @media print stylesheet, prints, then cleans up. */
function printHtml(html: string, css: string) {
  const printId = "minierp-print-area";
  const styleId = "minierp-print-style";
  document.getElementById(printId)?.remove();
  document.getElementById(styleId)?.remove();

  const style = document.createElement("style");
  style.id = styleId;
  style.innerHTML = `@media print {
    body > *:not(#${printId}) { display: none !important; }
    #${printId} { display: block !important; position: fixed; top: 0; left: 0; width: 100%; color: #000; background: #fff; }
    ${css}
  }`;

  const div = document.createElement("div");
  div.id = printId;
  div.style.display = "none";
  div.innerHTML = html;

  document.head.appendChild(style);
  document.body.appendChild(div);
  window.print();
  setTimeout(() => {
    document.getElementById(printId)?.remove();
    document.getElementById(styleId)?.remove();
  }, 1000);
}

export function SalePrintButtons({ sale, businessName, currency }: Props) {
  const items = (sale.sale_items ?? []) as any[];

  function printInvoice() {
    const rows = items.map((it) => `
      <tr>
        <td>${it.products?.name ?? "—"}</td>
        <td class="mono">${it.products?.sku ?? "—"}</td>
        <td class="right">${it.quantity}</td>
        <td class="right">${formatCurrency(it.unit_price, currency)}</td>
        <td class="right">${it.discount_amount > 0 ? "-" + formatCurrency(it.discount_amount, currency) : "—"}</td>
        <td class="right">${formatCurrency(it.total_price, currency)}</td>
      </tr>`).join("");

    const html = `
      <div class="inv">
        <div class="head">
          <div>
            <div class="biz">${businessName}</div>
            <div class="muted">Invoice</div>
          </div>
          <div class="right">
            <div class="num">${sale.sale_number}</div>
            <div class="muted">${formatDate(sale.created_at)}</div>
            <div class="muted cap">${String(sale.status)}</div>
          </div>
        </div>

        <div class="billto">
          <div class="muted">Bill to</div>
          <div class="strong">${sale.customers?.name ?? "Walk-in customer"}</div>
          ${sale.customers?.email ? `<div class="muted">${sale.customers.email}</div>` : ""}
          ${sale.customers?.phone ? `<div class="muted">${sale.customers.phone}</div>` : ""}
        </div>

        <table>
          <thead><tr>
            <th>Product</th><th>SKU</th><th class="right">Qty</th>
            <th class="right">Unit</th><th class="right">Disc.</th><th class="right">Total</th>
          </tr></thead>
          <tbody>${rows}</tbody>
        </table>

        <div class="totals">
          <div class="trow"><span>Subtotal</span><span>${formatCurrency(sale.subtotal, currency)}</span></div>
          ${sale.discount_amount > 0 ? `<div class="trow"><span>Discount</span><span>-${formatCurrency(sale.discount_amount, currency)}</span></div>` : ""}
          ${sale.tax_amount > 0 ? `<div class="trow"><span>Tax</span><span>${formatCurrency(sale.tax_amount, currency)}</span></div>` : ""}
          <div class="trow grand"><span>Total</span><span>${formatCurrency(sale.total_amount, currency)}</span></div>
          <div class="trow muted"><span>Payment</span><span class="cap">${sale.payment_method?.replace("_", " ")}</span></div>
        </div>

        <div class="foot muted">Thank you for your business.</div>
      </div>`;

    const css = `
      #minierp-print-area { font-family: Arial, Helvetica, sans-serif; font-size: 12px; padding: 40px; }
      #minierp-print-area .inv { max-width: 720px; margin: 0 auto; }
      #minierp-print-area .head { display: flex; justify-content: space-between; align-items: flex-start; border-bottom: 2px solid #111; padding-bottom: 16px; }
      #minierp-print-area .biz { font-size: 20px; font-weight: bold; }
      #minierp-print-area .num { font-size: 15px; font-weight: bold; font-family: monospace; }
      #minierp-print-area .muted { color: #666; }
      #minierp-print-area .strong { font-weight: bold; font-size: 13px; }
      #minierp-print-area .cap { text-transform: capitalize; }
      #minierp-print-area .right { text-align: right; }
      #minierp-print-area .mono { font-family: monospace; }
      #minierp-print-area .billto { margin: 20px 0; }
      #minierp-print-area table { width: 100%; border-collapse: collapse; margin-top: 8px; }
      #minierp-print-area th { text-align: left; border-bottom: 1px solid #ccc; padding: 8px 6px; font-size: 11px; text-transform: uppercase; color: #666; }
      #minierp-print-area td { padding: 8px 6px; border-bottom: 1px solid #eee; }
      #minierp-print-area .totals { margin-top: 16px; margin-left: auto; width: 260px; }
      #minierp-print-area .trow { display: flex; justify-content: space-between; padding: 4px 0; }
      #minierp-print-area .grand { font-weight: bold; font-size: 14px; border-top: 2px solid #111; margin-top: 6px; padding-top: 8px; }
      #minierp-print-area .foot { text-align: center; margin-top: 32px; }`;

    printHtml(html, css);
  }

  function printReceipt() {
    const lines = items.map((it) => `
      <div class="r-row"><span>${it.products?.name} × ${it.quantity}</span><span>${formatCurrency(it.total_price, currency)}</span></div>
      ${it.discount_amount > 0 ? `<div class="r-row r-sm"><span>Discount</span><span>-${formatCurrency(it.discount_amount, currency)}</span></div>` : ""}`).join("");

    const html = `
      <div class="r-center r-bold r-lg">${businessName}</div>
      <div class="r-center r-sm">${sale.sale_number}</div>
      <div class="r-center r-sm">${formatDateTime(sale.created_at)}</div>
      ${sale.customers ? `<div class="r-center r-sm">Customer: ${sale.customers.name}</div>` : ""}
      <div class="r-div"></div>
      ${lines}
      <div class="r-div"></div>
      <div class="r-row"><span>Subtotal</span><span>${formatCurrency(sale.subtotal, currency)}</span></div>
      ${sale.discount_amount > 0 ? `<div class="r-row"><span>Discount</span><span>-${formatCurrency(sale.discount_amount, currency)}</span></div>` : ""}
      ${sale.tax_amount > 0 ? `<div class="r-row"><span>Tax</span><span>${formatCurrency(sale.tax_amount, currency)}</span></div>` : ""}
      <div class="r-div"></div>
      <div class="r-row r-bold r-lg"><span>TOTAL</span><span>${formatCurrency(sale.total_amount, currency)}</span></div>
      <div class="r-center r-sm" style="margin-top:12px">Payment: ${sale.payment_method?.replace("_", " ")}</div>
      <div class="r-center r-sm" style="margin-top:16px">Thank you for your business!</div>`;

    const css = `
      #minierp-print-area { font-family: monospace; font-size: 13px; padding: 24px; max-width: 320px; }
      #minierp-print-area .r-row { display: flex; justify-content: space-between; margin: 4px 0; }
      #minierp-print-area .r-div { border-top: 1px dashed #aaa; margin: 8px 0; }
      #minierp-print-area .r-center { text-align: center; }
      #minierp-print-area .r-bold { font-weight: bold; }
      #minierp-print-area .r-lg { font-size: 16px; }
      #minierp-print-area .r-sm { font-size: 11px; color: #555; }`;

    printHtml(html, css);
  }

  return (
    <div className="flex items-center gap-2">
      <button onClick={printReceipt}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
        <ReceiptText size={15} /> Receipt
      </button>
      <button onClick={printInvoice}
        className="inline-flex items-center gap-1.5 px-3 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all">
        <Printer size={15} /> Print invoice
      </button>
    </div>
  );
}
