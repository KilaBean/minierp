import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Mail, Phone, MapPin, ShoppingCart } from "lucide-react";
import { getCustomer, getCustomerSales } from "@/lib/actions/customers";
import { createClient } from "@/lib/supabase/server";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils/index";
import { StatusPill, PillTone } from "@/components/ui/StatusPill";
import { EmptyState } from "@/components/ui/EmptyState";

interface Props { params: Promise<{ id: string }> }

const statusTones: Record<string, PillTone> = {
  completed: "success",
  pending:   "warning",
  cancelled: "danger",
  refunded:  "neutral",
};

export default async function CustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const customer = await getCustomer(id);
  if (!customer) notFound();

  const sales = await getCustomerSales(id);

  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <Link href="/dashboard/customers"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to customers
      </Link>

      {/* Profile card */}
      <div className="bg-card border border-border rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0">
            <div className="w-14 h-14 rounded-full bg-primary/15 flex items-center justify-center text-lg font-bold text-primary flex-shrink-0">
              {customer.name[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <h2 className="text-xl font-bold text-foreground truncate" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
                {customer.name}
              </h2>
              <p className="text-sm text-muted-foreground mt-0.5">Customer since {formatDate(customer.created_at)}</p>
            </div>
          </div>
          {customer.total_purchases > 0
            ? <StatusPill label="Active" tone="success" />
            : <StatusPill label="New" tone="info" />}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
          <div className="flex items-center gap-2.5 text-sm">
            <Mail size={15} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground truncate">{customer.email ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm">
            <Phone size={15} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{customer.phone ?? "—"}</span>
          </div>
          <div className="flex items-center gap-2.5 text-sm sm:col-span-2">
            <MapPin size={15} className="text-muted-foreground flex-shrink-0" />
            <span className="text-foreground">{customer.address ?? "—"}</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-6">
          <div className="bg-muted/50 border border-border rounded-xl px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Total spent</div>
            <div className="text-lg font-bold text-foreground mt-0.5 tabular-nums">{formatCurrency(customer.total_purchases, currency)}</div>
          </div>
          <div className="bg-muted/50 border border-border rounded-xl px-4 py-3">
            <div className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</div>
            <div className="text-lg font-bold text-foreground mt-0.5 tabular-nums">{sales.length}</div>
          </div>
        </div>

        {customer.notes && (
          <div className="mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground mb-1">Notes</p>
            <p className="text-sm text-foreground">{customer.notes}</p>
          </div>
        )}
      </div>

      {/* Purchase history */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-border">
          <h3 className="text-sm font-semibold text-foreground">Purchase history</h3>
        </div>
        {sales.length === 0 ? (
          <EmptyState icon={ShoppingCart} title="No purchases yet" description="This customer hasn't made any purchases." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-border bg-muted/30">
                {["Sale #","Payment","Total","Status","Date"].map((h, i) => (
                  <th key={h} className={`px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider ${i === 2 ? "text-right" : "text-left"}`}>{h}</th>
                ))}
              </tr></thead>
              <tbody>
                {(sales as any[]).map((s) => (
                  <tr key={s.id}
                    className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-foreground">
                      <Link href={`/dashboard/sales/${s.id}`} className="hover:text-primary transition-colors">{s.sale_number}</Link>
                    </td>
                    <td className="px-4 py-3 text-sm text-muted-foreground capitalize">{s.payment_method?.replace("_", " ")}</td>
                    <td className="px-4 py-3 text-sm font-semibold text-foreground text-right tabular-nums">{formatCurrency(s.total_amount, currency)}</td>
                    <td className="px-4 py-3"><StatusPill label={s.status} tone={statusTones[s.status] ?? "success"} /></td>
                    <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDateTime(s.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
