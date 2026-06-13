"use client";

import { useState } from "react";
import Link from "next/link";
import { Check, Zap } from "lucide-react";
import { cn } from "@/lib/utils";

const plans = [
  { name: "Starter",  monthly: 0,  annually: 0,  description: "Perfect for solopreneurs just getting started.", highlighted: false, badge: null,           cta: "Start free",           href: "/auth/register",
    features: ["Up to 100 products","Up to 50 sales/month","Basic inventory tracking","Customer management","1 user","PDF receipts"] },
  { name: "Growth",   monthly: 29, annually: 23, description: "For growing businesses that need more power.",  highlighted: true,  badge: "Most popular",    cta: "Start 14-day trial",   href: "/auth/register?plan=growth",
    features: ["Unlimited products","Unlimited sales","Advanced inventory","Customer profiles + history","Up to 5 users","PDF invoices","Expense tracking","Reports & analytics","Low stock alerts","Priority support"] },
  { name: "Business", monthly: 79, annually: 63, description: "For established businesses with complex needs.", highlighted: false, badge: null,           cta: "Contact sales",        href: "/auth/register?plan=business",
    features: ["Everything in Growth","Unlimited users","Multi-location support","Advanced reporting","API access","Custom branding","Dedicated account manager","SLA guarantee"] },
];

export function Pricing() {
  const [annual, setAnnual] = useState(true);

  return (
    <section id="pricing" className="py-24 px-4 relative">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-medium mb-4">
            <Zap size={12} />Simple pricing
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Pricing that grows <span className="text-gradient">with you</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto mb-8">
            Start free. No credit card required. Upgrade when you&apos;re ready.
          </p>
          <div className="inline-flex items-center gap-3 p-1 rounded-xl border border-border bg-muted/50">
            <button onClick={() => setAnnual(false)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all", !annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              Monthly
            </button>
            <button onClick={() => setAnnual(true)}
              className={cn("px-4 py-1.5 rounded-lg text-sm font-medium transition-all flex items-center gap-1.5", annual ? "bg-background text-foreground shadow-sm" : "text-muted-foreground hover:text-foreground")}>
              Annual
              <span className={cn("text-xs px-1.5 py-0.5 rounded-full font-semibold", annual ? "bg-emerald-600 text-white" : "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400")}>
                Save 20%
              </span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-5">
          {plans.map((plan) => (
            <div key={plan.name}
              className={cn("relative rounded-2xl p-6", plan.highlighted ? "bg-sky-600/10 border-2 border-sky-500/50" : "bg-card border border-border")}>
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-sky-600 text-white text-xs font-medium">
                  {plan.badge}
                </div>
              )}
              <div className="mb-5">
                <h3 className="text-lg font-bold text-foreground mb-1" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>{plan.name}</h3>
                <p className="text-sm text-muted-foreground">{plan.description}</p>
              </div>
              <div className="mb-6">
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-bold text-foreground">${annual ? plan.annually : plan.monthly}</span>
                  {(annual ? plan.annually : plan.monthly) > 0 && <span className="text-muted-foreground text-sm">/mo</span>}
                </div>
                {annual && plan.monthly > 0 && (
                  <div className="text-xs text-muted-foreground mt-0.5">Billed annually (${(annual ? plan.annually : plan.monthly) * 12}/yr)</div>
                )}
              </div>
              <Link href={plan.href}
                className={cn("block text-center py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 mb-6",
                  plan.highlighted ? "bg-sky-600 hover:bg-sky-500 text-white" : "bg-muted hover:bg-muted/80 text-foreground")}>
                {plan.cta}
              </Link>
              <div className="space-y-2.5">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-start gap-2">
                    <Check size={14} className="text-emerald-500 mt-0.5 flex-shrink-0" />
                    <span className="text-sm text-muted-foreground">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}