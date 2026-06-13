import { getCustomers, getCustomerStats, type CustomerSort } from "@/lib/actions/customers";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomersFilters } from "@/components/customers/CustomersFilters";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { PageHeader } from "@/components/ui/PageHeader";
import { formatCurrency } from "@/lib/utils/index";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string; sort?: string; dir?: string }>;
}

const VALID_SORTS: CustomerSort[] = ["name", "total_purchases", "created_at"];

export default async function CustomersPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const sort = (VALID_SORTS.includes(sp.sort as CustomerSort) ? sp.sort : "name") as CustomerSort;
  const dir  = sp.dir === "desc" ? "desc" : "asc";

  const [{ data, total, total_pages }, stats] = await Promise.all([
    getCustomers(sp.search ?? "", page, 20, sort, dir),
    getCustomerStats(),
  ]);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Customers"
        subtitle={`${total} customer${total !== 1 ? "s" : ""}`}
        action={<NewCustomerDialog />}
        stats={[
          { label: "Total", value: stats.total.toLocaleString() },
          { label: "Lifetime value", value: formatCurrency(stats.lifetimeValue) },
          { label: "New this month", value: `+${stats.newThisMonth.toLocaleString()}` },
        ]}
      />
      <CustomersFilters />
      <CustomersTable data={data} total={total} page={page} totalPages={total_pages} sort={sort} dir={dir} />
    </div>
  );
}
