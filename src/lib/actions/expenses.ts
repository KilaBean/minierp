"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { expenseSchema } from "@/lib/validations";
import { ApiResponse, Expense, PaginatedResponse, ExpenseFilters } from "@/types";
import { createNotification } from "./notifications";

// Threshold for "large expense" notification (in business currency)
const LARGE_EXPENSE_THRESHOLD = 1000;

export async function getExpenses(
  filters: ExpenseFilters = {},
  page = 1,
  perPage = 20
): Promise<PaginatedResponse<Expense>> {
  const supabase = await createClient();
  let query = (supabase as any)
    .from("expenses")
    .select("*, expense_categories(id,name,color)", { count: "exact" })
    .order("date", { ascending: false });

  if (filters.search)      query = query.ilike("title", `%${filters.search}%`);
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.date_from)   query = query.gte("date", filters.date_from);
  if (filters.date_to)     query = query.lte("date", filters.date_to);

  const from = (page - 1) * perPage;
  const { data, count, error } = await query.range(from, from + perPage - 1);
  if (error) return { data: [], total: 0, page, per_page: perPage, total_pages: 0 };
  return { data: data ?? [], total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) };
}

export async function createExpense(formData: FormData): Promise<ApiResponse<Expense>> {
  const raw = {
    title:       formData.get("title")       as string,
    amount:      formData.get("amount")      as string,
    date:        formData.get("date")        as string,
    category_id: formData.get("category_id") as string,
    notes:       formData.get("notes")       as string,
  };
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile || !auth.user) return { data: null, error: "Not authenticated", success: false };

  const businessId = (profile as any).business_id as string;

  const { data, error } = await (supabase as any).from("expenses").insert({
    ...parsed.data,
    category_id: parsed.data.category_id || null,
    business_id: businessId,
    created_by:  auth.user.id,
  }).select().single();

  if (error) return { data: null, error: error.message, success: false };

  // Notify on large expense
  if (parsed.data.amount >= LARGE_EXPENSE_THRESHOLD) {
    await createNotification({
      business_id: businessId,
      title:       "Large expense recorded",
      body:        `${parsed.data.title} — GHS ${parsed.data.amount.toFixed(2)}`,
      type:        "warning",
      link:        "/dashboard/expenses",
    });
  }

  revalidatePath("/dashboard/expenses");
  return { data: data as Expense, error: null, success: true };
}

export async function updateExpense(
  id: string,
  formData: FormData
): Promise<ApiResponse<Expense>> {
  const raw = {
    title:       formData.get("title")       as string,
    amount:      formData.get("amount")      as string,
    date:        formData.get("date")        as string,
    category_id: formData.get("category_id") as string,
    notes:       formData.get("notes")       as string,
  };
  const parsed = expenseSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("expenses")
    .update({ ...parsed.data, category_id: parsed.data.category_id || null })
    .eq("id", id)
    .select()
    .single();
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/expenses");
  return { data: data as Expense, error: null, success: true };
}

export async function deleteExpense(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await (supabase as any).from("expenses").delete().eq("id", id);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/expenses");
  return { data: null, error: null, success: true };
}

export async function getExpenseCategories() {
  const supabase = await createClient();
  const { data } = await (supabase as any).from("expense_categories").select("*").order("name");
  return data ?? [];
}

export async function createExpenseCategory(name: string, color?: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile) return null;
  const { data } = await (supabase as any).from("expense_categories")
    .insert({ name, color: color ?? "#0ea5e9", business_id: (profile as any).business_id })
    .select()
    .single();
  revalidatePath("/dashboard/expenses");
  return data;
}
