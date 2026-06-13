import { getSales, type SaleSort } from "@/lib/actions/sales";
import { createClient } from "@/lib/supabase/server";
import { SalesTable } from "@/components/sales/SalesTable";
import { SalesFilters } from "@/components/sales/SalesFilters";
import { PageHeader } from "@/components/ui/PageHeader";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

interface PageProps {
  searchParams: Promise<{ search?: string; status?: string; payment_method?: string; page?: string; date_from?: string; date_to?: string; sort?: string; dir?: string }>;
}

const VALID_SORTS: SaleSort[] = ["created_at", "total_amount"];

export default async function SalesPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const sort = (VALID_SORTS.includes(sp.sort as SaleSort) ? sp.sort : "created_at") as SaleSort;
  const dir  = sp.dir === "asc" ? "asc" : "desc";

  const filters = {
    search: sp.search, status: sp.status as any,
    payment_method: sp.payment_method as any,
    date_from: sp.date_from, date_to: sp.date_to,
  };

  const { data, total, total_pages } = await getSales(filters, page, 20, sort, dir);

  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Sales"
        subtitle={`${total} transaction${total !== 1 ? "s" : ""}`}
        action={
          <Link href="/dashboard/pos"
            className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all">
            <ShoppingCart size={15} /> New Sale
          </Link>
        }
      />

      <SalesFilters />

      <SalesTable data={data as any} total={total} page={page} totalPages={total_pages} currency={currency} sort={sort} dir={dir} />
    </div>
  );
}
