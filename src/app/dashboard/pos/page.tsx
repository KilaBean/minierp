import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductGrid } from "@/components/pos/ProductGrid";
import { CartPanel } from "@/components/pos/CartPanel";
import { createClient } from "@/lib/supabase/server";

export default async function POSPage() {
  const [products, categories] = await Promise.all([
    getProducts({ is_active: true }, 1, 200),
    getCategories(),
  ]);

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles").select("businesses(currency, tax_rate)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";
  const taxRate  = profile?.businesses?.tax_rate  ?? 0;

  return (
    <div className="fixed inset-0 pt-16 flex" style={{ left: "var(--sidebar-width, 240px)" }}>
      {/* Product area */}
      <div className="flex-1 overflow-hidden flex flex-col bg-background">
        <ProductGrid
          products={products.data}
          categories={categories}
          currency={currency}
        />
      </div>

      {/* Cart panel */}
      <div className="w-80 xl:w-96 flex-shrink-0 overflow-hidden flex flex-col">
        <CartPanel currency={currency} taxRate={Number(taxRate)} />
      </div>
    </div>
  );
}
