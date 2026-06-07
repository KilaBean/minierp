import { getCustomers } from "@/lib/actions/customers";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomersFilters } from "@/components/customers/CustomersFilters";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const { data, total, total_pages } = await getCustomers(sp.search ?? "", page, 20);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Customers</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{total} customer{total !== 1 ? "s" : ""}</p>
        </div>
        <NewCustomerDialog />
      </div>
      <CustomersFilters />
      <CustomersTable data={data} total={total} page={page} totalPages={total_pages} />
    </div>
  );
}
