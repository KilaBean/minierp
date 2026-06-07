import { getCategories } from "@/lib/actions/categories";
import { ProductForm } from "@/components/inventory/ProductForm";

export default async function NewProductPage() {
  const categories = await getCategories();
  return (
    <div className="max-w-7xl mx-auto">
      <ProductForm categories={categories} />
    </div>
  );
}
