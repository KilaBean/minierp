"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { productSchema, ProductFormData } from "@/lib/validations";
import { ApiResponse, Product, PaginatedResponse, ProductFilters } from "@/types";
import { createNotification } from "./notifications";

export async function getProducts(
  filters: ProductFilters = {},
  page = 1,
  perPage = 20
): Promise<PaginatedResponse<Product>> {
  const supabase = await createClient();
  let query = supabase
    .from("products")
    .select("*, categories(id, name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search)      query = query.or(`name.ilike.%${filters.search}%,sku.ilike.%${filters.search}%`);
  if (filters.category_id) query = query.eq("category_id", filters.category_id);
  if (filters.is_active !== undefined) query = query.eq("is_active", filters.is_active);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  let rows = (data ?? []) as Product[];
  if (filters.low_stock) rows = rows.filter((p) => p.quantity <= p.low_stock_threshold);

  return { data: rows, total: count ?? 0, page, per_page: perPage, total_pages: Math.ceil((count ?? 0) / perPage) };
}

export async function getProduct(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("*, categories(id, name)")
    .eq("id", id)
    .single();
  if (error) return null;
  return data as Product;
}

export async function createProduct(formData: FormData): Promise<ApiResponse<Product>> {
  const raw: Record<string, unknown> = {};
  formData.forEach((v, k) => { raw[k] = v; });
  raw.is_active = formData.get("is_active") === "true";

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile) return { data: null, error: "Not authenticated", success: false };

  const { data, error } = await supabase
    .from("products")
    .insert({ ...parsed.data, business_id: (profile as any).business_id })
    .select("*, categories(id, name)")
    .single();

  if (error) return { data: null, error: error.message, success: false };

  if (parsed.data.quantity > 0) {
    const { data: user } = await supabase.auth.getUser();
    await (supabase.from("stock_movements") as any).insert({
      business_id: (profile as any).business_id,
      product_id:  (data as any).id,
      type:        "in",
      quantity:    parsed.data.quantity,
      reference:   "Initial stock",
      created_by:  user.user?.id,
    });
  }

  // Notify if created with low stock
  if (parsed.data.quantity <= parsed.data.low_stock_threshold && parsed.data.quantity > 0) {
    await createNotification({
      business_id: (profile as any).business_id,
      title:       "Low stock on new product",
      body:        `${parsed.data.name} was added with only ${parsed.data.quantity} units`,
      type:        "warning",
      link:        `/dashboard/inventory/${(data as any).id}`,
    });
  }

  revalidatePath("/dashboard/inventory");
  return { data: data as Product, error: null, success: true };
}

export async function updateProduct(id: string, formData: FormData): Promise<ApiResponse<Product>> {
  const raw: Record<string, unknown> = {};
  formData.forEach((v, k) => { raw[k] = v; });
  raw.is_active = formData.get("is_active") === "true";

  const parsed = productSchema.safeParse(raw);
  if (!parsed.success) return { data: null, error: parsed.error.errors[0].message, success: false };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .update({ ...parsed.data, updated_at: new Date().toISOString() })
    .eq("id", id)
    .select("*, categories(id, name)")
    .single();

  if (error) return { data: null, error: error.message, success: false };

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${id}`);
  return { data: data as Product, error: null, success: true };
}

export async function deleteProduct(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) return { data: null, error: error.message, success: false };
  revalidatePath("/dashboard/inventory");
  return { data: null, error: null, success: true };
}

export async function adjustStock(
  productId: string,
  quantity: number,
  type: "in" | "out" | "adjustment",
  notes?: string
): Promise<ApiResponse<null>> {
  const supabase = await createClient();
  const { data: user } = await supabase.auth.getUser();
  if (!user.user) return { data: null, error: "Not authenticated", success: false };

  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile) return { data: null, error: "Profile not found", success: false };

  const { data: product } = await supabase
    .from("products")
    .select("quantity, name, low_stock_threshold")
    .eq("id", productId)
    .single();
  if (!product) return { data: null, error: "Product not found", success: false };

  const currentQty = (product as any).quantity as number;
  const threshold  = (product as any).low_stock_threshold as number;
  const name       = (product as any).name as string;
  const businessId = (profile as any).business_id as string;

  let newQty = currentQty;
  if (type === "in")         newQty = currentQty + quantity;
  else if (type === "out")   newQty = Math.max(0, currentQty - quantity);
  else                       newQty = quantity;

  const { error: updateError } = await (supabase.from("products") as any)
    .update({ quantity: newQty, updated_at: new Date().toISOString() })
    .eq("id", productId);

  if (updateError) return { data: null, error: updateError.message, success: false };

  await (supabase.from("stock_movements") as any).insert({
    business_id: businessId,
    product_id:  productId,
    type,
    quantity:    type === "adjustment" ? newQty - currentQty : quantity,
    notes:       notes ?? null,
    created_by:  user.user.id,
  });

  // Fire low stock notification if threshold crossed
  if (newQty <= threshold && currentQty > threshold) {
    await createNotification({
      business_id: businessId,
      title:       "Low stock alert",
      body:        `${name} is running low — ${newQty} unit${newQty === 1 ? "" : "s"} remaining`,
      type:        "warning",
      link:        `/dashboard/inventory/${productId}/stock`,
    });
  }

  // Fire out-of-stock notification
  if (newQty === 0 && currentQty > 0) {
    await createNotification({
      business_id: businessId,
      title:       "Out of stock",
      body:        `${name} is now out of stock`,
      type:        "error",
      link:        `/dashboard/inventory/${productId}`,
    });
  }

  revalidatePath("/dashboard/inventory");
  revalidatePath(`/dashboard/inventory/${productId}/stock`);
  return { data: null, error: null, success: true };
}

export async function getStockMovements(productId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("stock_movements")
    .select("*")
    .eq("product_id", productId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) return [];
  return data;
}
