import { notFound } from "next/navigation";
import { getProduct } from "@/lib/actions/products";
import { getCategories } from "@/lib/actions/categories";
import { ProductForm } from "@/components/inventory/ProductForm";
import Link from "next/link";
import { History } from "lucide-react";

interface Props { params: Promise<{ id: string }> }

export default async function EditProductPage({ params }: Props) {
  const { id }     = await params;
  const [product, categories] = await Promise.all([getProduct(id), getCategories()]);
  if (!product) notFound();

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex justify-end mb-2">
        <Link href={`/dashboard/inventory/${id}/stock`}
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <History size={14} /> View stock history
        </Link>
      </div>
      <ProductForm product={product} categories={categories} />
    </div>
  );
}
