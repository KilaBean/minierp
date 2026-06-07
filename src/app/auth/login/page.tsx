"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2, WifiOff } from "lucide-react";
import { toast } from "sonner";
import { signIn } from "@/lib/actions/auth";
import { loginSchema, LoginFormData } from "@/lib/validations";

const inputCls = "w-full px-4 py-3 bg-background border border-border rounded-xl text-foreground placeholder:text-muted-foreground text-sm focus:outline-none focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all";

const TIMEOUT_MS = 12000;

export default function LoginPage({ searchParams }: { searchParams?: Promise<{ error?: string }> }) {
  const params     = searchParams ? use(searchParams) : {};
  const serverDown = (params as any)?.error === "server_unavailable";

  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isPending,    setIsPending]    = useState(false);
  const [isOffline,    setIsOffline]    = useState(serverDown);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  async function onSubmit(data: LoginFormData) {
    setIsPending(true);
    setIsOffline(false);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error("timeout")), TIMEOUT_MS)
    );
    try {
      const fd = new FormData();
      fd.set("email", data.email);
      fd.set("password", data.password);
      const result = await Promise.race([signIn(fd), timeoutPromise]);
      if (!result.success) {
        if (result.error?.includes("Unable to reach") || result.error?.includes("fetch failed")) { setIsOffline(true); return; }
        toast.error(result.error || "Failed to sign in");
        return;
      }
      toast.success("Welcome back!");
      router.push("/dashboard");
      router.refresh();
    } catch (err: any) {
      if (err?.message === "timeout" || err?.message?.includes("fetch")) setIsOffline(true);
      else toast.error("An unexpected error occurred");
    } finally { setIsPending(false); }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground mb-2" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">Sign in to your MiniERP account to continue.</p>
      </div>

      {isOffline && (
        <div className="mb-5 flex items-start gap-3 px-4 py-3 bg-amber-500/10 border border-amber-500/30 rounded-xl">
          <WifiOff size={16} className="text-amber-500 mt-0.5 flex-shrink-0" />
          <div>
            <p className="text-sm font-medium text-amber-600 dark:text-amber-400">Server is waking up</p>
            <p className="text-xs text-amber-600/70 dark:text-amber-400/70 mt-0.5">
              The database is resuming from sleep. Wait 1–2 minutes then try again.
            </p>
            <button onClick={() => setIsOffline(false)} className="mt-2 text-xs text-amber-600 dark:text-amber-400 underline">
              Try again
            </button>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-foreground/70 mb-1.5">Email address</label>
          <input {...register("email")} type="email" placeholder="you@example.com" autoComplete="email" className={inputCls} />
          {errors.email && <p className="mt-1.5 text-xs text-destructive">{errors.email.message}</p>}
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-medium text-foreground/70">Password</label>
            <Link href="/auth/forgot-password" className="text-xs text-primary hover:text-primary/80 transition-colors">
              Forgot password?
            </Link>
          </div>
          <div className="relative">
            <input {...register("password")} type={showPassword ? "text" : "password"} placeholder="••••••••" autoComplete="current-password" className={inputCls + " pr-10"} />
            <button type="button" onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
              {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
          {errors.password && <p className="mt-1.5 text-xs text-destructive">{errors.password.message}</p>}
        </div>

        <button type="submit" disabled={isPending}
          className="w-full py-3 bg-primary hover:bg-primary/90 disabled:opacity-60 disabled:cursor-not-allowed text-primary-foreground rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 mt-2">
          {isPending && <Loader2 size={16} className="animate-spin" />}
          {isPending ? "Signing in…" : "Sign in"}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/auth/register" className="text-primary hover:text-primary/80 font-medium transition-colors">
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}