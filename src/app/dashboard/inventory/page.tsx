import { Suspense } from "react";
import Link from "next/link";
import { Plus, Tag } from "lucide-react";
import { getProducts } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductTable } from "@/components/inventory/ProductTable";
import { ProductFilters } from "@/components/inventory/ProductFilters";
import { ProductTableClient } from "@/components/inventory/ProductTableClient";
import { PageHeader } from "@/components/ui/PageHeader";

interface PageProps {
  searchParams: Promise<{
    search?: string; category_id?: string; status?: string;
    low_stock?: string; page?: string;
  }>;
}

export default async function InventoryPage({ searchParams }: PageProps) {
  const sp         = await searchParams;
  const page       = parseInt(sp.page ?? "1");
  const categories = await getCategories();

  const filters = {
    search:      sp.search,
    category_id: sp.category_id,
    is_active:   sp.status === "active" ? true : sp.status === "inactive" ? false : undefined,
    low_stock:   sp.low_stock === "true",
  };

  const { data, total, total_pages } = await getProducts(filters, page, 20);

  const supabase = (await import("@/lib/supabase/server")).createClient;
  const client   = await supabase();
  const { data: profile } = await client.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Inventory"
        subtitle={`${total} product${total !== 1 ? "s" : ""} total`}
        action={
          <>
            <Link href="/dashboard/inventory/categories"
              className="flex items-center gap-2 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
              <Tag size={15} /> Categories
            </Link>
            <Link href="/dashboard/inventory/new"
              className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all">
              <Plus size={15} /> Add Product
            </Link>
          </>
        }
      />

      {/* Filters */}
      <ProductFilters categories={categories} />

      {/* Table */}
      <ProductTableClient
        data={data}
        total={total}
        page={page}
        totalPages={total_pages}
        currency={currency}
      />
    </div>
  );
}
