import Link from "next/link";
import { Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center mb-6">
        <Zap size={26} className="text-white" />
      </div>
      <h1
        className="text-6xl font-bold text-foreground mb-3"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
      >
        404
      </h1>
      <p className="text-xl font-semibold text-foreground mb-2">Page not found</p>
      <p className="text-sm text-muted-foreground mb-8 max-w-sm">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard"
          className="px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all"
        >
          Go to Dashboard
        </Link>
        <Link
          href="/"
          className="px-5 py-2.5 border border-border text-muted-foreground hover:text-foreground text-sm rounded-xl transition-all"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
