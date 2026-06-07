"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, ArrowLeft, Mail } from "lucide-react";
import { toast } from "sonner";
import { forgotPassword } from "@/lib/actions/auth";
import { forgotPasswordSchema, ForgotPasswordFormData } from "@/lib/validations";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all";

export default function ForgotPasswordPage() {
  const [isPending, setIsPending] = useState(false);
  const [sent,      setSent]      = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  async function onSubmit(data: ForgotPasswordFormData) {
    setIsPending(true);
    try {
      const fd = new FormData();
      fd.set("email", data.email);
      const result = await forgotPassword(fd);
      if (!result.success) { toast.error(result.error || "Something went wrong"); return; }
      setSent(true);
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsPending(false); }
  }

  if (sent) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center mx-auto mb-6">
          <Mail size={28} className="text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Check your email
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          We&apos;ve sent you a password reset link. Click it to create a new password.
        </p>
        <Link href="/auth/login"
          className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 transition-colors">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <Link href="/auth/login"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
          <ArrowLeft size={14} /> Back to sign in
        </Link>
        <h1 className="text-2xl font-bold text-foreground mb-2"
          style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Reset your password
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your email and we&apos;ll send you a reset link.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">
            Email address
          </label>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            autoComplete="email"
            className={inputCls}
          />
          {errors.email && (
            <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>
          )}
        </div>

        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Sending…" : "Send reset link"}
        </button>
      </form>
    </div>
  );
}