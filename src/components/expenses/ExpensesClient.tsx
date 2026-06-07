"use client";

import { useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Plus, Pencil, Trash2, Search, X, Loader2, Receipt, ChevronLeft, ChevronRight } from "lucide-react";
import { toast } from "sonner";
import { createExpense, updateExpense, deleteExpense, createExpenseCategory } from "@/lib/actions/expenses";
import { formatCurrency, formatDate, debounce } from "@/lib/utils/index";
import { cn } from "@/lib/utils";
import { useCallback } from "react";

interface ExpenseCategory { id: string; name: string; color: string | null; }
interface Expense {
  id: string; title: string; amount: number; date: string;
  notes: string | null; category_id: string | null;
  expense_categories: ExpenseCategory | null;
}

interface Props {
  initialData: Expense[]; total: number; totalPages: number;
  page: number; categories: ExpenseCategory[]; currency?: string;
}

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

function ExpenseDialog({ expense, categories, onClose }: { expense?: Expense | null; categories: ExpenseCategory[]; onClose: () => void }) {
  const [pending, setPending] = useState(false);
  const [newCat,  setNewCat]  = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = expense ? await updateExpense(expense.id, fd) : await createExpense(fd);
    if (!result.success) { toast.error(result.error ?? "Failed"); setPending(false); return; }
    toast.success(expense ? "Expense updated" : "Expense added");
    router.refresh(); onClose();
    setPending(false);
  }

  async function handleAddCategory() {
    if (!newCat.trim()) return;
    await createExpenseCategory(newCat.trim());
    setNewCat(""); router.refresh();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-rose-500/10 flex items-center justify-center">
            <Receipt size={18} className="text-rose-500" />
          </div>
          <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            {expense ? "Edit Expense" : "Add Expense"}
          </h3>
        </div>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Title *</label>
            <input name="title" defaultValue={expense?.title} placeholder="e.g. Office rent" required className={inputCls} /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Amount *</label>
              <input name="amount" type="number" step="0.01" min="0.01" defaultValue={expense?.amount} placeholder="0.00" required className={inputCls} /></div>
            <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Date *</label>
              <input name="date" type="date" defaultValue={expense?.date ?? new Date().toISOString().split("T")[0]} required className={inputCls} /></div>
          </div>
          <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Category</label>
            <select name="category_id" defaultValue={expense?.category_id ?? ""} className={inputCls}>
              <option value="">No category</option>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div className="flex gap-2 mt-1.5">
              <input value={newCat} onChange={(e) => setNewCat(e.target.value)} placeholder="New category…"
                className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              <button type="button" onClick={handleAddCategory} disabled={!newCat.trim()}
                className="px-3 py-1.5 text-xs bg-primary/15 text-primary rounded-lg disabled:opacity-40 transition-all">Add</button>
            </div>
          </div>
          <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Notes</label>
            <textarea name="notes" rows={2} defaultValue={expense?.notes ?? ""} placeholder="Optional notes…"
              className={inputCls + " resize-none"} /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">Cancel</button>
            <button type="submit" disabled={pending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium disabled:opacity-60 transition-all">
              {pending && <Loader2 size={14} className="animate-spin" />}
              {pending ? "Saving…" : expense ? "Save changes" : "Add expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ExpensesClient({ initialData, total, totalPages, page, categories, currency = "USD" }: Props) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing,    setEditing]    = useState<Expense | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search,     setSearch]     = useState("");
  const router   = useRouter();
  const pathname = usePathname();
  const params   = useSearchParams();

  const push = useCallback((k: string, v: string) => {
    const sp = new URLSearchParams(params.toString());
    if (v) sp.set(k, v); else sp.delete(k); sp.delete("page");
    router.push(`${pathname}?${sp.toString()}`);
  }, [params, pathname, router]);

  const debouncedSearch = useCallback(debounce((v: string) => push("search", v), 350), [push]);

  async function handleDelete(id: string) {
    setDeletingId(id);
    const result = await deleteExpense(id);
    if (!result.success) toast.error(result.error ?? "Failed");
    else { toast.success("Expense deleted"); router.refresh(); }
    setDeletingId(null);
  }

  const totalAmount = initialData.reduce((s, e) => s + Number(e.amount), 0);

  return (
    <div className="max-w-7xl mx-auto space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>Expenses</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{total} expenses · {formatCurrency(totalAmount, currency)} shown</p>
        </div>
        <button onClick={() => { setEditing(null); setDialogOpen(true); }}
          className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all">
          <Plus size={15} /> Add Expense
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => { setSearch(e.target.value); debouncedSearch(e.target.value); }}
            placeholder="Search expenses…"
            className="w-full pl-9 pr-4 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
        </div>
        <select value={params.get("category_id") ?? ""} onChange={(e) => push("category_id", e.target.value)}
          className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all">
          <option value="">All categories</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input type="date" value={params.get("date_from") ?? ""} onChange={(e) => push("date_from", e.target.value)}
          className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        <input type="date" value={params.get("date_to") ?? ""} onChange={(e) => push("date_to", e.target.value)}
          className="px-3 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all" />
        {(params.get("search") || params.get("category_id") || params.get("date_from")) && (
          <button onClick={() => { setSearch(""); router.push(pathname); }}
            className="flex items-center gap-1.5 px-3 py-2.5 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <X size={14} /> Clear
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead><tr className="border-b border-border">
              {["Title","Category","Amount","Date","Notes",""].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {initialData.length === 0 ? (
                <tr><td colSpan={6} className="px-4 py-16 text-center">
                  <Receipt size={28} className="mx-auto mb-3 text-muted-foreground/30" />
                  <p className="text-sm text-muted-foreground">No expenses yet</p>
                </td></tr>
              ) : initialData.map((exp) => (
                <tr key={exp.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-foreground">{exp.title}</td>
                  <td className="px-4 py-3">
                    {exp.expense_categories ? (
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: `${exp.expense_categories.color ?? "#6366f1"}20`, color: exp.expense_categories.color ?? "#6366f1" }}>
                        {exp.expense_categories.name}
                      </span>
                    ) : <span className="text-sm text-muted-foreground">—</span>}
                  </td>
                  <td className="px-4 py-3 text-sm font-semibold text-rose-500">{formatCurrency(Number(exp.amount), currency)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{formatDate(exp.date)}</td>
                  <td className="px-4 py-3 text-sm text-muted-foreground max-w-[180px] truncate">{exp.notes ?? "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => { setEditing(exp); setDialogOpen(true); }}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all">
                        <Pencil size={14} />
                      </button>
                      <button onClick={() => handleDelete(exp.id)} disabled={deletingId === exp.id}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-red-500 hover:bg-red-500/10 transition-all disabled:opacity-40">
                        {deletingId === exp.id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border">
            <span className="text-xs text-muted-foreground">{total} expenses</span>
            <div className="flex items-center gap-2">
              <button onClick={() => { const sp = new URLSearchParams(params.toString()); sp.set("page", String(page-1)); router.push(`${pathname}?${sp.toString()}`); }} disabled={page <= 1}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"><ChevronLeft size={15} /></button>
              <span className="text-xs text-muted-foreground px-2">{page} / {totalPages}</span>
              <button onClick={() => { const sp = new URLSearchParams(params.toString()); sp.set("page", String(page+1)); router.push(`${pathname}?${sp.toString()}`); }} disabled={page >= totalPages}
                className="p-1.5 rounded-lg border border-border text-muted-foreground hover:text-foreground disabled:opacity-30 transition-all"><ChevronRight size={15} /></button>
            </div>
          </div>
        )}
      </div>

      {dialogOpen && (
        <ExpenseDialog
          expense={editing}
          categories={categories}
          onClose={() => { setDialogOpen(false); setEditing(null); }}
        />
      )}
    </div>
  );
}
