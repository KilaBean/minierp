"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { generateSaleNumber } from "@/lib/utils/index";
import { ApiResponse, Sale, PaginatedResponse, SaleFilters, CartItem } from "@/types";
import { createNotification } from "./notifications";

interface CreateSaleInput {
  items:           CartItem[];
  customer_id:     string | null;
  discount_amount: number;
  payment_method:  string;
  notes:           string;
  tax_rate:        number;
}

export async function createSale(
  input: CreateSaleInput
): Promise<ApiResponse<{ id: string; sale_number: string }>> {
  const supabase = await createClient();
  const db = supabase as any;

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { data: null, error: "Not authenticated", success: false };

  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();
  if (!profile) return { data: null, error: "Profile not found", success: false };

  const businessId        = (profile as any).business_id as string;
  const subtotal          = input.items.reduce((s, i) => s + i.unit_price * i.quantity - i.discount_amount, 0);
  const totalAfterDiscount = Math.max(0, subtotal - input.discount_amount);
  const taxAmount         = totalAfterDiscount * (input.tax_rate / 100);
  const totalAmount       = totalAfterDiscount + taxAmount;
  const saleNumber        = generateSaleNumber();

  const { data: sale, error: saleError } = await db.from("sales").insert({
    business_id:     businessId,
    customer_id:     input.customer_id || null,
    cashier_id:      user.id,
    sale_number:     saleNumber,
    subtotal,
    discount_amount: input.discount_amount,
    tax_amount:      taxAmount,
    total_amount:    totalAmount,
    payment_method:  input.payment_method,
    status:          "completed",
    notes:           input.notes || null,
  }).select().single();

  if (saleError || !sale)
    return { data: null, error: saleError?.message ?? "Failed to create sale", success: false };

  const saleId   = (sale as any).id as string;
  const saleItems = input.items.map((i) => ({
    sale_id:         saleId,
    product_id:      i.product.id,
    quantity:        i.quantity,
    unit_price:      i.unit_price,
    discount_amount: i.discount_amount,
    total_price:     i.unit_price * i.quantity - i.discount_amount,
  }));

  const { error: itemsError } = await db.from("sale_items").insert(saleItems);
  if (itemsError) return { data: null, error: itemsError.message, success: false };

  // Deduct stock
  for (const item of input.items) {
    const { data: product } = await supabase.from("products").select("quantity").eq("id", item.product.id).single();
    const currentQty = (product as any)?.quantity ?? 0;
    await (supabase.from("products") as any).update({
      quantity:    Math.max(0, currentQty - item.quantity),
      updated_at:  new Date().toISOString(),
    }).eq("id", item.product.id);

    await db.from("stock_movements").insert({
      business_id: businessId,
      product_id:  item.product.id,
      type:        "sale",
      quantity:    -item.quantity,
      reference:   saleNumber,
      created_by:  user.id,
    });
  }

  // Update customer total
  if (input.customer_id) {
    const { data: customer } = await supabase.from("customers").select("total_purchases, name").eq("id", input.customer_id).single();
    const prev = (customer as any)?.total_purchases ?? 0;
    await (supabase.from("customers") as any).update({
      total_purchases: prev + totalAmount,
      updated_at:      new Date().toISOString(),
    }).eq("id", input.customer_id);
  }

  // Notify on sale completion
  await createNotification({
    business_id: businessId,
    title:       "Sale completed",
    body:        `${saleNumber} — GHS ${totalAmount.toFixed(2)} via ${input.payment_method.replace("_", " ")}`,
    type:        "success",
    link:        `/dashboard/sales/${saleId}`,
  });

  revalidatePath("/dashboard/pos");
  revalidatePath("/dashboard/sales");
  revalidatePath("/dashboard");
  return { data: { id: saleId, sale_number: saleNumber }, error: null, success: true };
}

export async function getSales(
  filters: SaleFilters = {},
  page = 1,
  perPage = 20
): Promise<PaginatedResponse<Sale>> {
  const supabase = await createClient();
  let query = (supabase as any)
    .from("sales")
    .select("*, customers(id, name)", { count: "exact" })
    .order("created_at", { ascending: false });

  if (filters.search)         query = query.ilike("sale_number", `%${filters.search}%`);
  if (filters.status)         query = query.eq("status", filters.status);
  if (filters.payment_method) query = query.eq("payment_method", filters.payment_method);
  if (filters.date_from)      query = query.gte("created_at", filters.date_from);
  if (filters.date_to)        query = query.lte("created_at", filters.date_to);

  const from = (page - 1) * perPage;
  query = query.range(from, from + perPage - 1);

  const { data, count, error } = await query;
  if (error) throw new Error(error.message);

  return {
    data:        data ?? [],
    total:       count ?? 0,
    page,
    per_page:    perPage,
    total_pages: Math.ceil((count ?? 0) / perPage),
  };
}

export async function getSale(id: string) {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("sales")
    .select("*, customers(id, name, email, phone), sale_items(*, products(id, name, sku))")
    .eq("id", id)
    .single();
  if (error) return null;
  return data;
}

export async function voidSale(id: string): Promise<ApiResponse<null>> {
  const supabase = await createClient();

  // Fetch sale details before voiding for the notification
  const { data: sale } = await (supabase as any)
    .from("sales")
    .select("sale_number, total_amount")
    .eq("id", id)
    .single();

  const { data: profile } = await supabase.from("user_profiles").select("business_id").single();

  const { error } = await (supabase.from("sales") as any)
    .update({ status: "cancelled" })
    .eq("id", id);
  if (error) return { data: null, error: error.message, success: false };

  // Notify on void
  if (sale && profile) {
    await createNotification({
      business_id: (profile as any).business_id,
      title:       "Sale voided",
      body:        `${(sale as any).sale_number} has been cancelled`,
      type:        "error",
      link:        `/dashboard/sales/${id}`,
    });
  }

  revalidatePath("/dashboard/sales");
  return { data: null, error: null, success: true };
}
