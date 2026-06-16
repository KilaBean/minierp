"use server";

import { createClient } from "@/lib/supabase/server";

export interface SearchResults {
  products:  { id: string; name: string; sku: string | null }[];
  customers: { id: string; name: string }[];
  sales:     { id: string; sale_number: string; total_amount: number; status: string }[];
}

/**
 * Lightweight global search for the command palette.
 * Runs three capped `ilike` lookups in parallel. Read-only, RLS-scoped.
 */
export async function globalSearch(query: string): Promise<SearchResults> {
  const q = query.trim();
  if (q.length < 1) return { products: [], customers: [], sales: [] };

  const supabase = await createClient();
  const db = supabase as any;
  const like = `%${q}%`;

  const [products, customers, sales] = await Promise.all([
    db.from("products").select("id, name, sku").or(`name.ilike.${like},sku.ilike.${like}`).limit(5),
    db.from("customers").select("id, name").ilike("name", like).limit(5),
    db.from("sales").select("id, sale_number, total_amount, status").ilike("sale_number", like).limit(5),
  ]);

  return {
    products:  (products.data  ?? []) as SearchResults["products"],
    customers: (customers.data ?? []) as SearchResults["customers"],
    sales:     (sales.data     ?? []) as SearchResults["sales"],
  };
}
