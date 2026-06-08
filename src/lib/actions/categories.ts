"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { categorySchema } from "@/lib/validations";
import { ApiResponse, Category } from "@/types";

export async function getCategories(): Promise<Category[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("categories")
    .select("*")
    .order("name", { ascending: true });
  if (error) return [];
  return data as Category[];
}

export async function createCategory(
  formData: FormData
): Promise<ApiResponse<Category>> {
  const raw = {
    name:        formData.get("name")        as string,
    description: formData.get("description") as string,
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("user_profiles").select("business_id").single();
  if (!profile) return { data: null, error: "Not authenticated", success: false };

  const { data, error } = await (supabase.from("categories") as any)
    .insert({ ...parsed.data, business_id: (profile as any).business_id })
    .select()
    .single();

  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/inventory");
  return { data: data as Category, error: null, success: true };
}

export async function updateCategory(
  id: string,
  formData: FormData
): Promise<ApiResponse<Category>> {
  const raw = {
    name:        formData.get("name")        as string,
    description: formData.get("description") as string,
  };
  const parsed = categorySchema.safeParse(raw);
  if (!parsed.success)
    return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data, error } = await (supabase.from("categories") as any)
    .update(parsed.data)
    .eq("id", id)
    .select()
    .single();

  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/inventory");
  return { data: data as Category, error: null, success: true };
}

export async function deleteCategory(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/inventory");
  return { data: null, error: null, success: true };
}