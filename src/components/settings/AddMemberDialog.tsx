"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserPlus, Loader2, Eye, EyeOff } from "lucide-react";
import { toast } from "sonner";
import { createMember } from "@/lib/actions/settings";

const inputCls = "w-full px-3.5 py-2.5 text-sm bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all";

export function AddMemberDialog() {
  const [open,        setOpen]        = useState(false);
  const [pending,     setPending]     = useState(false);
  const [showPass,    setShowPass]    = useState(false);
  const [error,       setError]       = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setPending(true);

    const fd = new FormData(e.currentTarget);
    const result = await createMember(fd);

    if (!result.success) {
      setError(result.error ?? "Failed to create member");
      setPending(false);
      return;
    }

    toast.success(`Account created for ${fd.get("full_name")}`);
    router.refresh();
    setOpen(false);
    setPending(false);
    (e.target as HTMLFormElement).reset();
  }

  return (
    <>
      <button
        onClick={() => { setOpen(true); setError(""); }}
        className="flex items-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all"
      >
        <UserPlus size={15} /> Add Member
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setOpen(false)} />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl">

            {/* Header */}
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                <UserPlus size={18} className="text-primary" />
              </div>
              <div>
                <h3 className="text-base font-bold text-foreground"
                  style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
                  Add Team Member
                </h3>
                <p className="text-xs text-muted-foreground">
                  They'll log in with these credentials
                </p>
              </div>
            </div>

            {error && (
              <div className="mb-4 px-3.5 py-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full name */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Full Name *</label>
                <input
                  name="full_name"
                  placeholder="Jane Smith"
                  required
                  className={inputCls}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email Address *</label>
                <input
                  name="email"
                  type="email"
                  placeholder="jane@example.com"
                  required
                  className={inputCls}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Password *</label>
                <div className="relative">
                  <input
                    name="password"
                    type={showPass ? "text" : "password"}
                    placeholder="Min. 8 characters"
                    minLength={8}
                    required
                    className={inputCls + " pr-10"}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(!showPass)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Share these credentials with the member directly
                </p>
              </div>

              {/* Role */}
              <div>
                <label className="block text-sm font-medium text-foreground/70 mb-1.5">Role *</label>
                <select name="role" required className={inputCls}>
                  <option value="cashier">Cashier — POS and dashboard only</option>
                  <option value="manager">Manager — Sales, inventory, reports</option>
                  <option value="admin">Admin — Full access including settings</option>
                </select>
              </div>

              {/* Actions */}
              <div className="flex gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-2.5 text-sm border border-border rounded-xl text-muted-foreground hover:text-foreground transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={pending}
                  className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 text-sm bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold transition-all disabled:opacity-60"
                >
                  {pending && <Loader2 size={14} className="animate-spin" />}
                  {pending ? "Creating…" : "Create account"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}