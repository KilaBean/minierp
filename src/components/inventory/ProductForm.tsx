"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2, Save, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { productSchema, ProductFormData } from "@/lib/validations";
import { createProduct, updateProduct } from "@/lib/actions/products";
import { Category, Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props {
  product?: Product;
  categories: Category[];
}

export function ProductForm({ product, categories }: Props) {
  const router    = useRouter();
  const [pending, setPending] = useState(false);
  const isEdit = !!product;

  const { register, handleSubmit, formState: { errors }, watch } = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name:                product?.name ?? "",
      sku:                 product?.sku ?? "",
      description:         product?.description ?? "",
      category_id:         product?.category_id ?? "",
      price:               product?.price ?? 0,
      cost_price:          product?.cost_price ?? 0,
      quantity:            product?.quantity ?? 0,
      low_stock_threshold: product?.low_stock_threshold ?? 5,
      is_active:           product?.is_active ?? true,
    },
  });

  async function onSubmit(data: ProductFormData) {
    setPending(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.set(k, String(v ?? "")));
      fd.set("is_active", String(data.is_active));

      const result = isEdit
        ? await updateProduct(product!.id, fd)
        : await createProduct(fd);

      if (!result.success) { toast.error(result.error ?? "Failed"); return; }

      toast.success(isEdit ? "Product updated" : "Product created");
      router.push("/dashboard/inventory");
    } finally {
      setPending(false);
    }
  }

  const isActive = watch("is_active");
  const price     = watch("price") ?? 0;
  const costPrice = watch("cost_price") ?? 0;
  const margin    = price > 0 ? (((price - costPrice) / price) * 100).toFixed(1) : "0";

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back */}
      <Link href="/dashboard/inventory"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors">
        <ArrowLeft size={15} /> Back to inventory
      </Link>

      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {isEdit ? "Edit Product" : "New Product"}
          </h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {isEdit ? "Update product details and pricing" : "Add a new product to your inventory"}
          </p>
        </div>
        {/* Active toggle */}
        <label className="flex items-center gap-2 cursor-pointer">
          <div className={cn(
            "relative w-10 h-5 rounded-full transition-colors",
            isActive ? "bg-primary" : "bg-muted"
          )}>
            <input type="checkbox" {...register("is_active")} className="sr-only" />
            <span className={cn(
              "absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform",
              isActive ? "translate-x-5" : "translate-x-0.5"
            )} />
          </div>
          <span className="text-sm text-muted-foreground">{isActive ? "Active" : "Inactive"}</span>
        </label>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
        {/* Basic info */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Basic Information</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Product Name *" error={errors.name?.message}>
              <input {...register("name")} placeholder="e.g. Coffee Beans 1kg" className={inputCls} />
            </Field>
            <Field label="SKU / Barcode" error={errors.sku?.message}>
              <input {...register("sku")} placeholder="e.g. CB-001" className={inputCls} />
            </Field>
          </div>
          <Field label="Description" error={errors.description?.message}>
            <textarea {...register("description")} rows={3} placeholder="Optional product description…"
              className={cn(inputCls, "resize-none")} />
          </Field>
          <Field label="Category" error={errors.category_id?.message}>
            <select {...register("category_id")} className={inputCls}>
              <option value="">No category</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </Field>
        </div>

        {/* Pricing */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-foreground">Pricing</h3>
            {Number(price) > 0 && (
              <span className="text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                {margin}% margin
              </span>
            )}
          </div>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Selling Price *" error={errors.price?.message}>
              <input {...register("price")} type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} />
            </Field>
            <Field label="Cost Price" error={errors.cost_price?.message}>
              <input {...register("cost_price")} type="number" step="0.01" min="0" placeholder="0.00" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Stock */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <h3 className="text-sm font-semibold text-foreground">Stock Management</h3>
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label={isEdit ? "Current Quantity" : "Initial Quantity"} error={errors.quantity?.message}>
              <input {...register("quantity")} type="number" min="0" placeholder="0" className={inputCls}
                readOnly={isEdit} disabled={isEdit} />
              {isEdit && <p className="text-xs text-muted-foreground mt-1">Use the stock adjust button to change quantity</p>}
            </Field>
            <Field label="Low Stock Alert Threshold" error={errors.low_stock_threshold?.message}>
              <input {...register("low_stock_threshold")} type="number" min="0" placeholder="5" className={inputCls} />
            </Field>
          </div>
        </div>

        {/* Submit */}
        <div className="flex items-center justify-end gap-3">
          <Link href="/dashboard/inventory"
            className="px-5 py-2.5 text-sm text-muted-foreground hover:text-foreground border border-border rounded-xl transition-all">
            Cancel
          </Link>
          <button type="submit" disabled={pending}
            className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all disabled:opacity-60">
            {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create product"}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm font-medium text-foreground/70 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-xs text-destructive mt-1">{error}</p>}
    </div>
  );
}

const inputCls = `w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl
  text-foreground placeholder:text-muted-foreground
  focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all
  disabled:opacity-50 disabled:cursor-not-allowed`;
