"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { signUp } from "@/lib/actions/auth";
import { registerSchema, RegisterFormData } from "@/lib/validations";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all";

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending,    setIsPending]    = useState(false);
  const [done,         setDone]         = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  async function onSubmit(data: RegisterFormData) {
    setIsPending(true);
    try {
      const fd = new FormData();
      Object.entries(data).forEach(([k, v]) => fd.set(k, v));
      const result = await signUp(fd);
      if (!result.success) { toast.error(result.error || "Registration failed"); return; }
      setDone(true);
    } catch { toast.error("An unexpected error occurred"); }
    finally { setIsPending(false); }
  }

  if (done) {
    return (
      <div className="text-center">
        <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Account created!
        </h2>
        <p className="text-muted-foreground text-sm mb-6">
          Check your email to verify your account, then sign in to get started.
        </p>
        <button onClick={() => router.push("/auth/login")}
          className="w-full py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-semibold text-sm transition-all">
          Go to sign in
        </button>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Create your account
        </h1>
        <p className="text-muted-foreground text-sm">Set up MiniERP for your business in minutes. Free forever.</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Full name</label>
          <input {...register("full_name")} type="text" placeholder="Jane Smith" autoComplete="name" className={inputCls} />
          {errors.full_name && <p className="mt-1.5 text-xs text-destructive">{errors.full_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Business name</label>
          <input {...register("business_name")} type="text" placeholder="My Business Ltd" className={inputCls} />
          {errors.business_name && <p className="mt-1.5 text-xs text-destructive">{errors.business_name.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email address</label>
          <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} />
          {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Password</label>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="Min. 8 chars, 1 uppercase, 1 number" autoComplete="new-password" className={inputCls + " pr-10"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Confirm password</label>
          <input {...register("confirm_password")} type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="new-password" className={inputCls} />
          {errors.confirm_password && <p className="mt-1.5 text-xs text-destructive">{errors.confirm_password.message}</p>}
        </div>

        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Creating account…" : "Create free account"}
        </button>

        <p className="text-xs text-muted-foreground text-center">
          By creating an account, you agree to our{" "}
          <Link href="#" className="text-foreground/60 underline">Terms</Link>
          {" "}and{" "}
          <Link href="#" className="text-foreground/60 underline">Privacy Policy</Link>.
        </p>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/auth/login" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}