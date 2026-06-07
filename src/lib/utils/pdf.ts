"use client";

import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";

interface ReceiptItem {
  name: string;
  quantity: number;
  unit_price: number;
  discount_amount: number;
  total_price: number;
}

interface ReceiptData {
  sale_number: string;
  created_at: string;
  cashier_name?: string;
  business_name: string;
  business_address?: string;
  business_phone?: string;
  customer_name?: string;
  customer_email?: string;
  items: ReceiptItem[];
  subtotal: number;
  discount_amount: number;
  tax_amount: number;
  total_amount: number;
  payment_method: string;
  currency?: string;
}

export function generateReceiptPDF(data: ReceiptData): void {
  const doc  = new jsPDF({ unit: "mm", format: "a5" });
  const curr = data.currency ?? "USD";
  const W    = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(99, 102, 241);
  doc.rect(0, 0, W, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text(data.business_name, W / 2, 11, { align: "center" });

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  if (data.business_address) doc.text(data.business_address, W / 2, 17, { align: "center" });
  if (data.business_phone)   doc.text(data.business_phone,   W / 2, 22, { align: "center" });

  // Sale info
  doc.setTextColor(30, 30, 30);
  let y = 35;

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("RECEIPT", W / 2, y, { align: "center" });
  y += 6;

  doc.setFontSize(8);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 100, 100);
  doc.text(`#${data.sale_number}`, W / 2, y, { align: "center" });
  y += 4;
  doc.text(formatDateTime(data.created_at), W / 2, y, { align: "center" });
  y += 8;

  // Customer & cashier
  if (data.customer_name || data.cashier_name) {
    doc.setTextColor(30, 30, 30);
    doc.setFontSize(8);
    if (data.customer_name) {
      doc.setFont("helvetica", "bold");
      doc.text("Customer:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(data.customer_name, 40, y);
      y += 5;
    }
    if (data.cashier_name) {
      doc.setFont("helvetica", "bold");
      doc.text("Cashier:", 14, y);
      doc.setFont("helvetica", "normal");
      doc.text(data.cashier_name, 40, y);
      y += 5;
    }
    y += 2;
  }

  // Items table
  autoTable(doc, {
    startY: y,
    head: [["Item", "Qty", "Price", "Total"]],
    body: data.items.map((i) => [
      i.name,
      i.quantity,
      formatCurrency(i.unit_price, curr),
      formatCurrency(i.total_price, curr),
    ]),
    styles: { fontSize: 8, cellPadding: 2 },
    headStyles: { fillColor: [99, 102, 241], textColor: 255, fontStyle: "bold" },
    columnStyles: {
      0: { cellWidth: "auto" },
      1: { cellWidth: 12, halign: "center" },
      2: { cellWidth: 25, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
    },
    margin: { left: 14, right: 14 },
  });

  y = (doc as any).lastAutoTable.finalY + 4;

  // Totals
  const addRow = (label: string, value: string, bold = false) => {
    doc.setFont("helvetica", bold ? "bold" : "normal");
    doc.setFontSize(bold ? 9 : 8);
    doc.setTextColor(bold ? 30 : 100, bold ? 30 : 100, bold ? 30 : 100);
    doc.text(label, W - 14 - 50, y, { align: "left" });
    doc.text(value, W - 14, y, { align: "right" });
    y += bold ? 6 : 5;
  };

  // Divider
  doc.setDrawColor(220, 220, 220);
  doc.line(14, y, W - 14, y);
  y += 4;

  addRow("Subtotal",   formatCurrency(data.subtotal, curr));
  if (data.discount_amount > 0) addRow("Discount", `-${formatCurrency(data.discount_amount, curr)}`);
  if (data.tax_amount > 0)      addRow("Tax",       formatCurrency(data.tax_amount, curr));

  doc.setDrawColor(200, 200, 200);
  doc.line(14, y, W - 14, y);
  y += 4;

  addRow("TOTAL", formatCurrency(data.total_amount, curr), true);
  y += 2;

  const pm = data.payment_method.replace("_", " ").toUpperCase();
  addRow("Paid by", pm);

  // Footer
  y += 6;
  doc.setFont("helvetica", "italic");
  doc.setFontSize(8);
  doc.setTextColor(150, 150, 150);
  doc.text("Thank you for your business!", W / 2, y, { align: "center" });

  doc.save(`receipt-${data.sale_number}.pdf`);
}
