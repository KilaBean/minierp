"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Tag } from "lucide-react";
import { toast } from "sonner";
import { createCategory, updateCategory } from "@/lib/actions/categories";
import { Category } from "@/types";

interface Props { category?: Category | null; onClose: () => void; }

export function CategoryDialog({ category, onClose }: Props) {
  const isEdit = !!category;
  const [name, setName]               = useState(category?.name ?? "");
  const [description, setDescription] = useState(category?.description ?? "");
  const [pending, setPending]         = useState(false);
  const router = useRouter();

  async function handleSubmit() {
    if (!name.trim()) { toast.error("Category name is required"); return; }
    setPending(true);
    try {
      const fd = new FormData();
      fd.set("name", name.trim());
      fd.set("description", description.trim());
      const result = isEdit ? await updateCategory(category!.id, fd) : await createCategory(fd);
      if (!result.success) { toast.error(result.error ?? "Failed"); return; }
      toast.success(isEdit ? "Category updated" : "Category created");
      router.refresh();
      onClose();
    } finally { setPending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Tag size={18} className="text-primary" />
          </div>
          <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {isEdit ? "Edit Category" : "New Category"}
          </h3>
        </div>
        <div className="space-y-4 mb-5">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Name *</label>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Beverages"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Description <span className="text-muted-foreground font-normal">(optional)</span>
            </label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2}
              placeholder="Optional description…"
              className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} disabled={pending}
            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all disabled:opacity-60">
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? "Saving…" : isEdit ? "Save changes" : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
}
