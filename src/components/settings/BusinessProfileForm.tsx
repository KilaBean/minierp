"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Save, Building2 } from "lucide-react";
import { toast } from "sonner";
import { businessSettingsSchema, BusinessSettingsFormData } from "@/lib/validations";
import { updateBusinessSettings } from "@/lib/actions/settings";
import { useAuthStore } from "@/store/useAuthStore";

const CURRENCIES = [
  { code: "GHS", label: "GHS — Ghanaian Cedi" },
  { code: "USD", label: "USD — US Dollar" },
  { code: "EUR", label: "EUR — Euro" },
  { code: "GBP", label: "GBP — British Pound" },
  { code: "NGN", label: "NGN — Nigerian Naira" },
  { code: "KES", label: "KES — Kenyan Shilling" },
  { code: "ZAR", label: "ZAR — South African Rand" },
  { code: "JPY", label: "JPY — Japanese Yen" },
  { code: "CAD", label: "CAD — Canadian Dollar" },
  { code: "AUD", label: "AUD — Australian Dollar" },
];

interface Business {
  name: string; email: string | null; phone: string | null;
  address: string | null; currency: string; tax_rate: number;
}

export function BusinessProfileForm({ business }: { business: Business }) {
  const [pending, setPending] = useState(false);
  const router  = useRouter();
  const setUser = useAuthStore((s) => s.setUser);
  const user    = useAuthStore((s) => s.user);

  const { register, handleSubmit, formState: { errors } } = useForm<BusinessSettingsFormData>({
    resolver: zodResolver(businessSettingsSchema),
    defaultValues: {
      name:     business.name,
      email:    business.email    ?? "",
      phone:    business.phone    ?? "",
      address:  business.address  ?? "",
      currency: business.currency ?? "GHS",
      tax_rate: business.tax_rate ?? 0,
    },
  });

  async function onSubmit(data: BusinessSettingsFormData) {
    setPending(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.set(k, String(v ?? "")));
      const result = await updateBusinessSettings(fd);
      if (!result.success) { toast.error(result.error ?? "Failed to save"); return; }
      toast.success("Business settings saved");
      if (user) setUser({ ...user, business_name: data.name, business_currency: data.currency });
      router.refresh();
    } finally { setPending(false); }
  }

  const inputCls = "w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Building2 size={17} className="text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Business Profile</h3>
            <p className="text-xs text-muted-foreground">How your business appears on invoices and receipts</p>
          </div>
        </div>

        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Business Name *</label>
            <input {...register("name")} placeholder="My Business Ltd" className={inputCls} />
            {errors.name && <p className="text-xs text-destructive mt-1">{errors.name.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email</label>
            <input {...register("email")} type="email" placeholder="business@example.com" className={inputCls} />
            {errors.email && <p className="text-xs text-destructive mt-1">{errors.email.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Phone</label>
            <input {...register("phone")} placeholder="+1 234 567 8900" className={inputCls} />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Address</label>
            <input {...register("address")} placeholder="123 Main St, City" className={inputCls} />
          </div>
        </div>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="mb-2">
          <h3 className="text-sm font-semibold text-foreground">Financial Settings</h3>
          <p className="text-xs text-muted-foreground">Currency and tax configuration</p>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">Currency *</label>
            <select {...register("currency")} className={inputCls}>
              {CURRENCIES.map((c) => (
                <option key={c.code} value={c.code}>{c.label}</option>
              ))}
            </select>
            {errors.currency && <p className="text-xs text-destructive mt-1">{errors.currency.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground/70 mb-1.5">
              Tax Rate (%) <span className="text-muted-foreground font-normal">— applied at checkout</span>
            </label>
            <input {...register("tax_rate")} type="number" step="0.01" min="0" max="100" placeholder="0" className={inputCls} />
            {errors.tax_rate && <p className="text-xs text-destructive mt-1">{errors.tax_rate.message}</p>}
          </div>
        </div>
      </div>

      <div className="flex justify-end">
        <button type="submit" disabled={pending}
          className="flex items-center gap-2 px-6 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all disabled:opacity-60 shadow-sm">
          {pending ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
          {pending ? "Saving…" : "Save settings"}
        </button>
      </div>
    </form>
  );
}
