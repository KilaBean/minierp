"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { XCircle, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { voidSale } from "@/lib/actions/sales";

export function VoidSaleButton({ saleId }: { saleId: string }) {
  const [pending, setPending] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const router = useRouter();

  async function handleVoid() {
    setPending(true);
    const result = await voidSale(saleId);
    if (!result.success) { toast.error(result.error ?? "Failed to void sale"); setPending(false); return; }
    toast.success("Sale voided");
    router.refresh();
    setConfirm(false);
    setPending(false);
  }

  if (confirm) return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-muted-foreground">Void this sale?</span>
      <button onClick={() => setConfirm(false)} className="px-3 py-1.5 text-xs border border-border rounded-lg text-muted-foreground hover:text-foreground transition-all">Cancel</button>
      <button onClick={handleVoid} disabled={pending}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium transition-all disabled:opacity-60">
        {pending ? <Loader2 size={11} className="animate-spin" /> : <XCircle size={11} />}
        {pending ? "Voiding…" : "Confirm void"}
      </button>
    </div>
  );

  return (
    <button onClick={() => setConfirm(true)}
      className="flex items-center gap-2 px-4 py-2 text-sm border border-red-500/30 text-red-500 hover:bg-red-500/10 rounded-xl transition-all">
      <XCircle size={15} /> Void Sale
    </button>
  );
}
