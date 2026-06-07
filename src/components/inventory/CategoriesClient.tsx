"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import { deleteCategory } from "@/lib/actions/categories";
import { CategoryDialog } from "./CategoryDialog";
import { Category } from "@/types";

export function CategoriesClient({ categories }: { categories: Category[] }) {
  const router   = useRouter();
  const [open, setOpen]       = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function handleDelete(id: string) {
    setDeletingId(id);
    try {
      const result = await deleteCategory(id);
      if (!result.success) { toast.error(result.error ?? "Failed to delete"); return; }
      toast.success("Category deleted");
      router.refresh();
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <>
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {/* Toolbar */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <span className="text-sm text-muted-foreground">
            {categories.length} categor{categories.length !== 1 ? "ies" : "y"}
          </span>
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="flex items-center gap-2 px-4 py-2 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all"
          >
            <Plus size={14} /> New Category
          </button>
        </div>

        {/* List */}
        {categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag size={32} className="mx-auto mb-3 text-muted-foreground/30" />
            <p className="text-sm text-muted-foreground">No categories yet</p>
            <button
              onClick={() => setOpen(true)}
              className="mt-3 text-sm text-primary hover:text-primary/80 transition-colors"
            >
              Create your first category
            </button>
          </div>
        ) : (
          <div>
            {categories.map((cat, i) => (
              <div
                key={cat.id}
                className="flex items-center gap-4 px-5 py-4 border-b border-border last:border-0 hover:bg-muted/30 transition-colors"
              >
                <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Tag size={15} className="text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-foreground">{cat.name}</p>
                  {cat.description && (
                    <p className="text-xs text-muted-foreground truncate">{cat.description}</p>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => { setEditing(cat); setOpen(true); }}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(cat.id)}
                    disabled={deletingId === cat.id}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40"
                  >
                    {deletingId === cat.id
                      ? <Loader2 size={14} className="animate-spin" />
                      : <Trash2 size={14} />
                    }
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <CategoryDialog
        open={open}
        category={editing}
        onClose={() => { setOpen(false); setEditing(null); }}
      />
    </>
  );
}
