import { getExpenses, getExpenseCategories } from "@/lib/actions/expenses";
import { createClient } from "@/lib/supabase/server";
import { ExpensesClient } from "@/components/expenses/ExpensesClient";

interface PageProps {
  searchParams: Promise<{ search?: string; category_id?: string; date_from?: string; date_to?: string; page?: string }>;
}

export default async function ExpensesPage({ searchParams }: PageProps) {
  const sp   = await searchParams;
  const page = parseInt(sp.page ?? "1");
  const [{ data, total, total_pages }, categories] = await Promise.all([
    getExpenses({ search: sp.search, category_id: sp.category_id, date_from: sp.date_from, date_to: sp.date_to }, page, 20),
    getExpenseCategories(),
  ]);
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("businesses(currency)").single() as any;
  const currency = profile?.businesses?.currency ?? "USD";

  return <ExpensesClient initialData={data} total={total} totalPages={total_pages} page={page} categories={categories} currency={currency} />;
}
