"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { deleteProduct } from "@/lib/actions/products";

interface Props {
  productId: string | null;
  productName?: string;
  onClose: () => void;
}

export function DeleteProductDialog({ productId, productName, onClose }: Props) {
  const [pending, setPending] = useState(false);
  const router = useRouter();

  if (!productId) return null;

  async function handleDelete() {
    setPending(true);
    try {
      const result = await deleteProduct(productId!);
      if (!result.success) { toast.error(result.error ?? "Failed to delete"); return; }
      toast.success("Product deleted");
      router.refresh();
      onClose();
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-red-500/15 flex items-center justify-center mx-auto mb-4">
          <Trash2 size={22} className="text-red-500" />
        </div>
        <h3 className="text-base font-bold text-foreground text-center mb-2"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Delete Product
        </h3>
        <p className="text-sm text-muted-foreground text-center mb-6">
          {productName
            ? <>Are you sure you want to delete <strong className="text-foreground">{productName}</strong>? </>
            : "Are you sure you want to delete this product? "}
          This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={pending}
            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
            Cancel
          </button>
          <button onClick={handleDelete} disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-red-600 hover:bg-red-500 text-white rounded-xl font-medium transition-all disabled:opacity-60">
            {pending ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
            {pending ? "Deleting…" : "Delete"}
          </button>
        </div>
      </div>
    </div>
  );
}
