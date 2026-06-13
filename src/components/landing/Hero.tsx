"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp, ShoppingCart, Package, CheckCircle, BarChart3 } from "lucide-react";

const floatingCards = [
  { icon: TrendingUp,   label: "Revenue",     value: "$24,530", change: "+12.5%", pos: "top-24 -left-4 lg:left-0",   delay: "0ms"   },
  { icon: ShoppingCart, label: "Sales Today", value: "142",     change: "+8 orders", pos: "top-48 -right-4 lg:-right-8", delay: "150ms" },
  { icon: Package,      label: "Low Stock",   value: "5 items", change: "Needs attention", pos: "bottom-24 -left-4 lg:-left-8", delay: "300ms" },
];

export function Hero() {
  return (
    <section className="relative pt-28 pb-20 md:pt-36 md:pb-32 px-4 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[600px] bg-sky-600/10 rounded-full blur-[100px]" />
        <div className="absolute top-40 right-0 w-[400px] h-[400px] bg-violet-600/10 rounded-full blur-[80px]" />
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.015]"
          style={{ backgroundImage: "linear-gradient(currentColor 1px,transparent 1px),linear-gradient(90deg,currentColor 1px,transparent 1px)", backgroundSize: "40px 40px" }} />
      </div>

      <div className="max-w-7xl mx-auto relative">
        <div className="text-center max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-medium mb-8 animate-fade-in">
            <span className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
            Built for small businesses — Start free today
          </div>

          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-foreground mb-6 leading-tight animate-fade-in"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif", animationDelay: "100ms", opacity: 0, animationFillMode: "forwards" }}>
            Run your business{" "}
            <span className="text-gradient">smarter,</span>
            <br />not harder
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in"
            style={{ animationDelay: "200ms", opacity: 0, animationFillMode: "forwards" }}>
            MiniERP is an all-in-one business management platform. Track inventory, process sales, manage customers, and analyse performance — all in one place.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-16 animate-fade-in"
            style={{ animationDelay: "300ms", opacity: 0, animationFillMode: "forwards" }}>
            <Link href="/auth/register"
              className="group inline-flex items-center gap-2 px-6 py-3.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-semibold transition-all duration-200 shadow-lg shadow-sky-900/20 hover:-translate-y-0.5">
              Get started for free
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link href="#preview"
              className="inline-flex items-center gap-2 px-6 py-3.5 border border-border hover:border-foreground/20 text-muted-foreground hover:text-foreground rounded-xl font-medium transition-all duration-200">
              See how it works
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-sm text-muted-foreground animate-fade-in"
            style={{ animationDelay: "400ms", opacity: 0, animationFillMode: "forwards" }}>
            {["No credit card required","14-day free trial","Cancel anytime"].map((item) => (
              <span key={item} className="flex items-center gap-1.5">
                <CheckCircle size={14} className="text-emerald-500" />{item}
              </span>
            ))}
          </div>
        </div>

        {/* Dashboard mockup */}
        <div className="relative mt-16 md:mt-20 animate-fade-in"
          style={{ animationDelay: "500ms", opacity: 0, animationFillMode: "forwards" }}>
          {/* Floating cards */}
          {floatingCards.map((card) => (
            <div key={card.label} className={`absolute z-10 ${card.pos} hidden lg:block`}>
              <div className="bg-card border border-border rounded-xl p-3 w-48 shadow-lg animate-float"
                style={{ animationDelay: card.delay }}>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/15 flex items-center justify-center">
                    <card.icon size={14} className="text-sky-500" />
                  </div>
                  <span className="text-xs text-muted-foreground">{card.label}</span>
                </div>
                <div className="text-lg font-bold text-foreground">{card.value}</div>
                <div className="text-xs text-emerald-500 mt-0.5">{card.change}</div>
              </div>
            </div>
          ))}

          {/* Browser mockup */}
          <div className="relative mx-auto max-w-5xl">
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-background z-10 pointer-events-none" />
            <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-2xl">
              <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                  <div className="w-3 h-3 rounded-full bg-border" />
                </div>
                <div className="flex-1 mx-4 h-5 rounded-md bg-muted text-muted-foreground text-xs flex items-center px-2">
                  app.minierp.io/dashboard
                </div>
              </div>
              <div className="flex h-[360px] md:h-[480px]">
                {/* Sidebar */}
                <div className="w-14 md:w-56 bg-muted/30 border-r border-border flex flex-col p-3 gap-1">
                  <div className="flex items-center gap-2 px-2 py-2 mb-3">
                    <div className="w-6 h-6 rounded bg-sky-600 flex-shrink-0" />
                    <span className="hidden md:block text-xs font-semibold text-foreground truncate">MiniERP</span>
                  </div>
                  {[
                    { icon: BarChart3,   label: "Dashboard", active: true  },
                    { icon: Package,     label: "Inventory", active: false },
                    { icon: ShoppingCart,label: "POS",       active: false },
                  ].map((item) => (
                    <div key={item.label} className={`flex items-center gap-2 px-2 py-2 rounded-lg ${item.active ? "bg-sky-600/15 text-sky-600 dark:text-sky-300" : "text-muted-foreground"}`}>
                      <item.icon size={15} />
                      <span className="hidden md:block text-xs truncate">{item.label}</span>
                    </div>
                  ))}
                </div>
                {/* Main */}
                <div className="flex-1 p-4 md:p-6 overflow-hidden">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                    {[
                      { label: "Revenue",  value: "$24,530", color: "text-emerald-500" },
                      { label: "Expenses", value: "$8,210",  color: "text-red-500"     },
                      { label: "Profit",   value: "$16,320", color: "text-sky-500"  },
                      { label: "Sales",    value: "342",     color: "text-amber-500"   },
                    ].map((s) => (
                      <div key={s.label} className="bg-background rounded-xl p-3 border border-border">
                        <div className="text-muted-foreground text-xs mb-1">{s.label}</div>
                        <div className={`text-sm md:text-base font-bold ${s.color}`}>{s.value}</div>
                      </div>
                    ))}
                  </div>
                  <div className="bg-background rounded-xl border border-border p-4 h-36 md:h-48 flex items-end gap-1.5">
                    {[40,65,45,80,55,70,90,60,75,85,70,95].map((h, i) => (
                      <div key={i} className="flex-1 rounded-t-sm"
                        style={{ height: `${h}%`, background: i === 11 ? "rgb(99,102,241)" : `rgba(99,102,241,${0.2 + i * 0.02})` }} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}