import Link from "next/link";
import { Zap } from "lucide-react";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden border-r border-border">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-20 w-72 h-72 bg-sky-600/10 rounded-full blur-[80px]" />
          <div className="absolute bottom-20 right-20 w-48 h-48 bg-violet-600/10 rounded-full blur-[60px]" />
          <div className="absolute inset-0 opacity-[0.03]"
            style={{ backgroundImage: "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Zap size={18} className="text-white" />
            </div>
            <span className="text-xl font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              MiniERP
            </span>
          </Link>
        </div>

        <div className="relative">
          <blockquote className="space-y-4">
            <p className="text-2xl font-bold text-foreground leading-snug" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              &ldquo;MiniERP gave us full visibility into our operations. We went from guessing to knowing.&rdquo;
            </p>
            <footer className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-400 to-orange-600 flex items-center justify-center text-sm font-bold text-white">
                PT
              </div>
              <div>
                <div className="text-sm font-semibold text-foreground">Philip Tandoh</div>
                <div className="text-xs text-muted-foreground">Founder</div>
              </div>
            </footer>
          </blockquote>
        </div>

        <div className="relative flex gap-3 flex-wrap">
          {["Inventory tracking","POS system","Analytics","PDF invoices"].map((f) => (
            <span key={f} className="px-3 py-1.5 rounded-full text-xs bg-muted border border-border text-muted-foreground">
              {f}
            </span>
          ))}
        </div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">
        {/* Mobile logo */}
        <div className="lg:hidden mb-8">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              MiniERP
            </span>
          </Link>
        </div>

        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}