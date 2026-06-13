import { getCustomers } from "@/lib/actions/customers";
import { CustomersTable } from "@/components/customers/CustomersTable";
import { CustomersFilters } from "@/components/customers/CustomersFilters";
import { NewCustomerDialog } from "@/components/customers/NewCustomerDialog";
import { PageHeader } from "@/components/ui/PageHeader";

interface PageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function CustomersPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const { data, total, total_pages } = await getCustomers(sp.search ?? "", page, 20);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <PageHeader
        title="Customers"
        subtitle={`${total} customer${total !== 1 ? "s" : ""}`}
        action={<NewCustomerDialog />}
      />
      <CustomersFilters />
      <CustomersTable data={data} total={total} page={page} totalPages={total_pages} />
    </div>
  );
}
