"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Package, Plus, Minus, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { adjustStock } from "@/lib/actions/products";
import { Product } from "@/types";
import { cn } from "@/lib/utils";

interface Props { product: Product | null; onClose: () => void; }
type AdjustType = "in" | "out" | "adjustment";

const types: { value: AdjustType; label: string; icon: React.ElementType; color: string }[] = [
  { value: "in",         label: "Add stock",    icon: Plus,      color: "text-emerald-500" },
  { value: "out",        label: "Remove stock", icon: Minus,     color: "text-red-500"     },
  { value: "adjustment", label: "Set quantity", icon: RefreshCw, color: "text-sky-500"  },
];

export function StockAdjustDialog({ product, onClose }: Props) {
  const [type,    setType]    = useState<AdjustType>("in");
  const [qty,     setQty]     = useState("");
  const [notes,   setNotes]   = useState("");
  const [pending, setPending] = useState(false);
  const router = useRouter();

  if (!product) return null;

  const quantity = parseInt(qty) || 0;
  const current  = product.quantity;
  const preview  = type === "in" ? current + quantity : type === "out" ? Math.max(0, current - quantity) : quantity;

  async function handleSubmit() {
    if (!qty || quantity <= 0) { toast.error("Enter a valid quantity"); return; }
    setPending(true);
    try {
      const result = await adjustStock(product!.id, quantity, type, notes || undefined);
      if (!result.success) { toast.error(result.error ?? "Failed"); return; }
      toast.success("Stock updated");
      router.refresh();
      onClose();
    } finally { setPending(false); }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center">
            <Package size={18} className="text-muted-foreground" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              Adjust Stock
            </h3>
            <p className="text-xs text-muted-foreground">{product.name} · Current: {current}</p>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 mb-4">
          {types.map((t) => (
            <button key={t.value} onClick={() => setType(t.value)}
              className={cn("flex flex-col items-center gap-1.5 py-3 rounded-xl border text-xs font-medium transition-all",
                type === t.value ? "bg-primary/10 border-primary/40 text-primary" : "border-border text-muted-foreground hover:text-foreground"
              )}>
              <t.icon size={16} className={type === t.value ? "text-primary" : t.color} />
              {t.label}
            </button>
          ))}
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            {type === "adjustment" ? "Set quantity to" : "Quantity"}
          </label>
          <input type="number" min="0" value={qty} onChange={(e) => setQty(e.target.value)}
            placeholder="0"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
        </div>

        {qty && quantity > 0 && (
          <div className="flex items-center justify-between px-4 py-3 bg-muted/50 rounded-xl mb-4 text-sm">
            <span className="text-muted-foreground">New quantity</span>
            <span className={cn("font-bold", preview === 0 ? "text-red-500" : preview <= product.low_stock_threshold ? "text-amber-500" : "text-foreground")}>
              {current} → {preview}
            </span>
          </div>
        )}

        <div className="mb-5">
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            Notes <span className="text-muted-foreground font-normal">(optional)</span>
          </label>
          <input type="text" value={notes} onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Restocked from supplier"
            className="w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all" />
        </div>

        <div className="flex gap-3">
          <button onClick={onClose} disabled={pending}
            className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">
            Cancel
          </button>
          <button onClick={handleSubmit} disabled={pending}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all disabled:opacity-60">
            {pending && <Loader2 size={14} className="animate-spin" />}
            {pending ? "Saving…" : "Update stock"}
          </button>
        </div>
      </div>
    </div>
  );
}
