"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { customerSchema } from "@/lib/validations";
import { ApiResponse, Customer, PaginatedResponse } from "@/types";

export type CustomerSort = "name" | "total_purchases" | "created_at";
const CUSTOMER_SORT_COLUMNS: CustomerSort[] = ["name", "total_purchases", "created_at"];

export async function getCustomers(
  search = "",
  page = 1,
  perPage = 20,
  sort: CustomerSort = "name",
  dir: "asc" | "desc" = "asc",
): Promise<PaginatedResponse<Customer>> {
  const supabase = await createClient();
  const sortCol = CUSTOMER_SORT_COLUMNS.includes(sort) ? sort : "name";
  let query = supabase
    .from("customers")
    .select("*", { count: "exact" })
    .order(sortCol, { ascending: dir === "asc" });
  if (search) query = query.ilike("name", `%${search}%`);
  const from = (page - 1) * perPage;
  const { data, count, error } = await query.range(from, from + perPage - 1);
  if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 };
  return { data: (data ?? []) as Customer[], total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) };
}

/** Aggregate metrics for the customers page header strip. */
export async function getCustomerStats(): Promise<{ total: number; lifetimeValue: number; newThisMonth: number }> {
  const supabase = await createClient();
  const db = supabase as any;
  const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString();

  const [{ data: spend }, { count: total }, { count: newThisMonth }] = await Promise.all([
    db.from("customers").select("total_purchases"),
    db.from("customers").select("id", { count: "exact", head: true }),
    db.from("customers").select("id", { count: "exact", head: true }).gte("created_at", startOfMonth),
  ]);

  const lifetimeValue = ((spend ?? []) as { total_purchases: number }[])
    .reduce((s, r) => s + Number(r.total_purchases ?? 0), 0);

  return { total: total ?? 0, lifetimeValue, newThisMonth: newThisMonth ?? 0 };
}

export async function getCustomer(id: string): Promise<Customer | null> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*").eq("id", id).single();
  if (error) return null;
  return data as Customer;
}

export async function createCustomer(formData: FormData): Promise<ApiResponse<Customer>> {
  const raw = { name: formData.get("name") as string, email: formData.get("email") as string, phone: formData.get("phone") as string, address: formData.get("address") as string, notes: formData.get("notes") as string };
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile) return { data: null, error: "Not authenticated", success: false };

  const { data, error } = await (supabase.from("customers") as any)
    .insert({ ...parsed.data, business_id: (profile as any).business_id })
    .select().single();
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/customers");
  return { data: data as Customer, error: null, success: true };
}

export async function updateCustomer(id: string, formData: FormData): Promise<ApiResponse<Customer>> {
  const raw = { name: formData.get("name") as string, email: formData.get("email") as string, phone: formData.get("phone") as string, address: formData.get("address") as string, notes: formData.get("notes") as string };
  const parsed = customerSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data, error } = await (supabase.from("customers") as any)
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id).select().single();
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/customers");
  return { data: data as Customer, error: null, success: true };
}

export async function deleteCustomer(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("customers").delete().eq("id", id);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/customers");
  return { data: null, error: null, success: true };
}

export async function searchCustomers(query: string): Promise<Customer[]> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("customers").select("*").ilike("name", `%${query}%`).limit(10);
  if (error) return [];
  return data as Customer[];
}

export async function getCustomerSales(customerId: string) {
  const supabase = await createClient();
  const { data } = await (supabase as any).from("sales").select("id,sale_number,total_amount,status,payment_method,created_at").eq("customer_id", customerId).order("created_at", { ascending: false }).limit(20);
  return data ?? [];
}