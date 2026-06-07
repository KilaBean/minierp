"use client";

import { useState, useEffect } from "react";
import { Plus, Pencil, Trash2, Tag, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { getCategories, deleteCategory } from "@/lib/actions/categories";
import { CategoryDialog } from "@/components/inventory/CategoryDialog";
import { Category } from "@/types";

export function CategoriesClient() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Category | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    const data = await getCategories();
    setCategories(data);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteCategory(id);
    if (!result.success) toast.error(result.error ?? "Failed to delete");
    else { toast.success("Category deleted"); await load(); }
    setDeletingId(null);
  }

  function handleClose() {
    setDialogOpen(false);
    setEditing(null);
    load();
  }

  return (
    <>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all"
        >
          <Plus size={15} /> Add Category
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        {loading ? (
          <div className="py-16 flex justify-center">
            <Loader2 size={24} className="animate-spin text-muted-foreground" />
          </div>
        ) : categories.length === 0 ? (
          <div className="py-16 text-center">
            <Tag size={28} className="text-muted-foreground/30 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No categories yet</p>
          </div>
        ) : (
          categories.map((cat, i) => (
            <div key={cat.id}
              className={`flex items-center gap-4 px-5 py-4 hover:bg-muted/30 transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
              <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <Tag size={15} className="text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-foreground">{cat.name}</div>
                {cat.description && (
                  <div className="text-xs text-muted-foreground truncate">{cat.description}</div>
                )}
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => { setEditing(cat); setDialogOpen(true); }}
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
          ))
        )}
      </div>

      {/* Mount only when open — CategoryDialog has no 'open' prop */}
      {dialogOpen && (
        <CategoryDialog category={editing} onClose={handleClose} />
      )}
    </>
  );
}