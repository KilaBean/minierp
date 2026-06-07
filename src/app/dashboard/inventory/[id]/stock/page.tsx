import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Package } from "lucide-react";
import { getProduct, getStockMovements } from "@/lib/actions/products";
import { StockMovementTable } from "@/components/inventory/StockMovementTable";
import { formatCurrency } from "@/lib/utils/index";

interface Props { params: Promise<{ id: string }> }

export default async function StockHistoryPage({ params }: Props) {
  const { id } = await params;
  const [product, movements] = await Promise.all([getProduct(id), getStockMovements(id)]);
  if (!product) notFound();

  const supabase = (await import("@/lib/supabase/server")).createClient;
  const client   = await supabase();
  const { data: profile } = await client.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-5xl mx-auto space-y-5">
      <Link href={`/dashboard/inventory/${id}`}
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
        <ArrowLeft size={14} /> Back to product
      </Link>

      {/* Product summary */}
      <div className="bg-card border border-border rounded-2xl p-5 flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center">
          <Package size={20} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold text-foreground truncate"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {product.name}
          </h2>
          {product.sku && <p className="text-xs text-muted-foreground">{product.sku}</p>}
        </div>
        <div className="grid grid-cols-3 gap-6 text-center flex-shrink-0">
          {[
            { label: "Current Stock", value: product.quantity.toString() },
            { label: "Sell Price",    value: formatCurrency(product.price, currency) },
            { label: "Movements",     value: movements.length.toString() },
          ].map((s) => (
            <div key={s.label}>
              <div className="text-lg font-bold text-foreground">{s.value}</div>
              <div className="text-xs text-muted-foreground">{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* History */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-3">Movement History</h3>
        <StockMovementTable data={movements as any} />
      </div>
    </div>
  );
}
