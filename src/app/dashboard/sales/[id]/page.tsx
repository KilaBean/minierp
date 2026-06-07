import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Printer, XCircle } from "lucide-react";
import { getSale } from "@/lib/actions/sales";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDateTime } from "@/lib/utils/index";
import { cn } from "@/lib/utils";
import { VoidSaleButton } from "@/components/sales/VoidSaleButton";

interface Props { params: Promise<{ id: string }> }

const statusColors: Record<string, string> = {
  completed: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
  pending:   "bg-amber-500/15 text-amber-600 dark:text-amber-400",
  cancelled: "bg-red-500/15 text-red-500",
  refunded:  "bg-muted text-muted-foreground",
};

export default async function SaleDetailPage({ params }: Props) {
  const { id } = await params;
  const sale   = await getSale(id);
  if (!sale) notFound();

  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <div className="flex items-center justify-between">
        <Link href="/dashboard/sales"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <ArrowLeft size={14} /> Back to sales
        </Link>
        <div className="flex items-center gap-2">
          {sale.status === "completed" && <VoidSaleButton saleId={id} />}
        </div>
      </div>

      {/* Header card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Sale Number</p>
            <h2 className="text-2xl font-bold text-foreground font-mono" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              {sale.sale_number}
            </h2>
          </div>
          <span className={cn("text-sm px-3 py-1 rounded-full capitalize font-medium", statusColors[sale.status] ?? statusColors.completed)}>
            {sale.status}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div><p className="text-muted-foreground text-xs mb-0.5">Date</p><p className="text-foreground font-medium">{formatDateTime(sale.created_at)}</p></div>
          <div><p className="text-muted-foreground text-xs mb-0.5">Customer</p><p className="text-foreground font-medium">{sale.customers?.name ?? "Walk-in"}</p></div>
          <div><p className="text-muted-foreground text-xs mb-0.5">Cashier</p><p className="text-foreground font-medium">{sale.user_profiles?.full_name ?? "—"}</p></div>
          <div><p className="text-muted-foreground text-xs mb-0.5">Payment</p><p className="text-foreground font-medium capitalize">{sale.payment_method?.replace("_", " ")}</p></div>
        </div>
      </div>

      {/* Items */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Items</h3>
        </div>
        <table className="w-full">
          <thead><tr className="border-b border-border">
            {["Product","SKU","Qty","Unit Price","Discount","Total"].map((h) => (
              <th key={h} className="text-left px-4 py-2.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
            ))}
          </tr></thead>
          <tbody>
            {(sale.sale_items ?? []).map((item: any) => (
              <tr key={item.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                <td className="px-4 py-3 text-sm text-foreground font-medium">{item.products?.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground font-mono">{item.products?.sku ?? "—"}</td>
                <td className="px-4 py-3 text-sm text-foreground">{item.quantity}</td>
                <td className="px-4 py-3 text-sm text-foreground">{formatCurrency(item.unit_price, currency)}</td>
                <td className="px-4 py-3 text-sm text-red-500">{item.discount_amount > 0 ? `-${formatCurrency(item.discount_amount, currency)}` : "—"}</td>
                <td className="px-4 py-3 text-sm font-semibold text-foreground">{formatCurrency(item.total_price, currency)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="border-t border-border px-5 py-4 space-y-2">
          {[
            { label: "Subtotal",  val: sale.subtotal,         show: true },
            { label: "Discount",  val: -sale.discount_amount, show: sale.discount_amount > 0 },
            { label: "Tax",       val: sale.tax_amount,       show: sale.tax_amount > 0 },
          ].filter((r) => r.show).map((r) => (
            <div key={r.label} className="flex justify-between text-sm text-muted-foreground">
              <span>{r.label}</span>
              <span className={r.val < 0 ? "text-red-500" : ""}>{r.val < 0 ? `-${formatCurrency(Math.abs(r.val), currency)}` : formatCurrency(r.val, currency)}</span>
            </div>
          ))}
          <div className="flex justify-between text-base font-bold text-foreground pt-2 border-t border-border">
            <span>Total</span>
            <span>{formatCurrency(sale.total_amount, currency)}</span>
          </div>
        </div>
      </div>

      {sale.notes && (
        <div className="bg-card border border-border rounded-2xl p-5">
          <p className="text-xs text-muted-foreground mb-1">Notes</p>
          <p className="text-sm text-foreground">{sale.notes}</p>
        </div>
      )}
    </div>
  );
}
