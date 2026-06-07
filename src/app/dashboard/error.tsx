"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="w-14 h-14 rounded-2xl bg-destructive/10 flex items-center justify-center mb-5">
        <AlertTriangle size={26} className="text-destructive" />
      </div>
      <h2
        className="text-xl font-bold text-foreground mb-2"
        style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}
      >
        Something went wrong
      </h2>
      <p className="text-sm text-muted-foreground mb-6 max-w-sm">
        {error.message || "An unexpected error occurred. Please try again."}
      </p>
      <button
        onClick={reset}
        className="flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-semibold rounded-xl transition-all"
      >
        <RefreshCw size={15} />
        Try again
      </button>
    </div>
  );
}
