import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";

export function CTA() {
  return (
    <section className="py-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-sky-600 to-blue-700 p-12 md:p-16 text-center">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/4" />
            <div className="absolute inset-0 opacity-10"
              style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,0.3) 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
          </div>
          <div className="relative">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/80 text-xs font-medium mb-6">
              <Zap size={12} /> Ready to transform your business?
            </div>
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4 leading-tight"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              Start running your business<br />smarter today
            </h2>
            <p className="text-white/70 text-lg mb-8 max-w-xl mx-auto">
              Join thousands of small businesses using MiniERP. Free forever for starters. No credit card required.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link href="/auth/register"
                className="group inline-flex items-center gap-2 px-7 py-3.5 bg-white text-sky-700 rounded-xl font-semibold hover:bg-white/90 transition-all duration-200 shadow-lg">
                Get started for free
                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link href="/auth/login"
                className="inline-flex items-center gap-2 px-7 py-3.5 border border-white/20 text-white hover:bg-white/10 rounded-xl font-medium transition-all duration-200">
                Sign in to your account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}