"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Loader2, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { createCustomer } from "@/lib/actions/customers";

export function NewCustomerDialog() {
  const [open, setOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    const fd = new FormData(e.currentTarget);
    const result = await createCustomer(fd);
    if (!result.success) { toast.error(result.error ?? "Failed"); setPending(false); return; }
    toast.success("Customer created");
    router.refresh();
    setOpen(false);
    setPending(false);
  }

  const inputCls = "w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

  return (
    <>
      <button onClick={() => setOpen(true)}
        className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all">
        <Plus size={15} /> Add Customer
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlus size={18} className="text-primary" />
              </div>
              <h3 className="text-base font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>New Customer</h3>
            </div>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Name *</label>
                <input name="name" placeholder="Full name" required className={inputCls} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Email</label>
                  <input name="email" type="email" placeholder="email@example.com" className={inputCls} /></div>
                <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Phone</label>
                  <input name="phone" placeholder="+1 234 567 8900" className={inputCls} /></div>
              </div>
              <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Address</label>
                <input name="address" placeholder="Street address" className={inputCls} /></div>
              <div><label className="block text-sm font-medium text-foreground/70 mb-1.5">Notes</label>
                <textarea name="notes" rows={2} placeholder="Optional notes…" className={inputCls + " resize-none"} /></div>
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setOpen(false)} className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all">Cancel</button>
                <button type="submit" disabled={pending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-medium transition-all disabled:opacity-60">
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  {pending ? "Creating…" : "Create customer"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
