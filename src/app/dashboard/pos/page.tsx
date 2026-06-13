import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { POSShell } from "@/components/pos/POSShell";
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
    <POSShell
      products={products.data}
      categories={categories}
      currency={currency}
      taxRate={Number(taxRate)}
    />
  );
}
