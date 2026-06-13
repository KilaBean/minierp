"use client";

import { useState } from "react";
import { BarChart3, Package, ShoppingCart, Users, TrendingUp, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: BarChart3   },
  { id: "inventory", label: "Inventory", icon: Package     },
  { id: "pos",       label: "POS",       icon: ShoppingCart},
  { id: "customers", label: "Customers", icon: Users       },
];

function DashboardMockup() {
  return (
    <div className="p-5">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-5">
        {[
          { label: "Revenue",  val: "$24,530", color: "text-emerald-500" },
          { label: "Expenses", val: "$8,210",  color: "text-red-500"     },
          { label: "Profit",   val: "$16,320", color: "text-sky-500"  },
          { label: "Orders",   val: "342",     color: "text-amber-500"   },
        ].map((s) => (
          <div key={s.label} className="bg-background rounded-xl p-3 border border-border">
            <div className="text-muted-foreground text-xs mb-1">{s.label}</div>
            <div className={`text-foreground font-bold text-sm md:text-base ${s.color}`}>{s.val}</div>
          </div>
        ))}
      </div>
      <div className="grid md:grid-cols-3 gap-3">
        <div className="md:col-span-2 bg-background rounded-xl border border-border p-4">
          <div className="text-xs text-muted-foreground mb-3">Revenue (30 days)</div>
          <div className="flex items-end gap-1 h-28">
            {[35,55,40,70,50,80,65,90,60,75,85,70,95,80,100].map((h, i) => (
              <div key={i} className="flex-1 rounded-t-sm"
                style={{ height: `${h}%`, background: `rgba(99,102,241,${0.15 + i * 0.03})` }} />
            ))}
          </div>
        </div>
        <div className="bg-background rounded-xl border border-border p-4">
          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-1">
            <AlertTriangle size={11} className="text-amber-500" /> Low Stock
          </div>
          <div className="space-y-2">
            {["Coffee Beans","Milk (2L)","Sugar (5kg)"].map((item) => (
              <div key={item} className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground truncate">{item}</span>
                <span className="text-amber-500 ml-2 flex-shrink-0">Low</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function InventoryMockup() {
  return (
    <div className="p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="h-6 w-40 bg-muted rounded" />
        <div className="h-7 w-24 bg-sky-600/60 rounded-lg text-xs text-white/60 flex items-center justify-center">+ Add Product</div>
      </div>
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        <div className="flex text-xs text-muted-foreground px-4 py-2 border-b border-border">
          <span className="flex-1">Product</span><span className="w-20 text-right">Stock</span><span className="w-24 text-right">Price</span><span className="w-20 text-right">Status</span>
        </div>
        {[
          { name: "Coffee Beans 1kg", sku: "CB-001", stock: 3,   price: "$24.99", low: true  },
          { name: "Green Tea",        sku: "GT-002", stock: 48,  price: "$12.50", low: false },
          { name: "Milk 2L",          sku: "ML-003", stock: 5,   price: "$3.99",  low: true  },
          { name: "Espresso Pods",    sku: "EP-004", stock: 120, price: "$18.00", low: false },
        ].map((p) => (
          <div key={p.sku} className="flex items-center px-4 py-3 border-b border-border last:border-0 text-xs hover:bg-muted/20 transition-colors">
            <div className="flex-1"><div className="text-foreground">{p.name}</div><div className="text-muted-foreground">{p.sku}</div></div>
            <div className={cn("w-20 text-right font-medium", p.low ? "text-amber-500" : "text-muted-foreground")}>{p.stock}</div>
            <div className="w-24 text-right text-muted-foreground">{p.price}</div>
            <div className="w-20 text-right">
              <span className={cn("px-1.5 py-0.5 rounded text-xs", p.low ? "bg-amber-500/15 text-amber-600 dark:text-amber-400" : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400")}>
                {p.low ? "Low" : "In Stock"}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function POSMockup() {
  return (
    <div className="p-5 grid md:grid-cols-2 gap-4">
      <div>
        <div className="text-xs text-muted-foreground mb-3">Products</div>
        <div className="grid grid-cols-2 gap-2">
          {[{ name: "Coffee", price: "$4.50" },{ name: "Tea", price: "$3.00" },{ name: "Muffin", price: "$3.50" },{ name: "Sandwich", price: "$7.00" }].map((p) => (
            <div key={p.name} className="bg-background border border-border rounded-xl p-3 cursor-pointer hover:border-sky-500/40 transition-colors">
              <div className="w-8 h-8 rounded-lg bg-sky-500/10 mb-2" />
              <div className="text-xs text-foreground">{p.name}</div>
              <div className="text-xs text-sky-500 font-medium">{p.price}</div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-background rounded-xl border border-border p-4">
        <div className="text-xs text-muted-foreground mb-3">Current Order</div>
        <div className="space-y-2 mb-4">
          {[{ name: "Coffee x2", price: "$9.00" },{ name: "Muffin x1", price: "$3.50" }].map((i) => (
            <div key={i.name} className="flex justify-between text-xs text-muted-foreground">
              <span>{i.name}</span><span>{i.price}</span>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-3 mb-4">
          <div className="flex justify-between text-sm font-bold text-foreground"><span>Total</span><span>$12.50</span></div>
        </div>
        <div className="bg-sky-600 rounded-xl py-2.5 text-xs text-white text-center font-medium">Charge $12.50</div>
      </div>
    </div>
  );
}

function CustomersMockup() {
  return (
    <div className="p-5">
      <div className="grid grid-cols-3 gap-3 mb-4">
        {[{ label: "Total", val: "1,240" },{ label: "New (30d)", val: "48" },{ label: "Returning", val: "73%" }].map((s) => (
          <div key={s.label} className="bg-background rounded-xl p-3 border border-border text-center">
            <div className="text-foreground font-bold">{s.val}</div>
            <div className="text-xs text-muted-foreground mt-0.5">{s.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-background rounded-xl border border-border overflow-hidden">
        {["Sarah K.","James O.","Amara D.","Chen W."].map((name, i) => (
          <div key={name} className="flex items-center gap-3 px-4 py-3 border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
            <div className="w-7 h-7 rounded-full bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center text-xs text-white font-bold flex-shrink-0">
              {name[0]}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-xs text-foreground">{name}</div>
              <div className="text-xs text-muted-foreground">{[12,8,24,5][i]} purchases</div>
            </div>
            <div className="text-xs text-sky-500">${[420,310,890,150][i]}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

const mockups: Record<string, React.FC> = {
  dashboard: DashboardMockup,
  inventory: InventoryMockup,
  pos:       POSMockup,
  customers: CustomersMockup,
};

export function DashboardPreview() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const ActiveMockup = mockups[activeTab];

  return (
    <section id="preview" className="py-24 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-600 dark:text-violet-300 text-xs font-medium mb-4">
            <TrendingUp size={12} /> Product preview
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            See it in action
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Explore the interface before signing up. Intuitive enough to get started in minutes.
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 mb-6 flex-wrap">
          {tabs.map((tab) => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={cn("flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200",
                activeTab === tab.id ? "bg-sky-600 text-white" : "text-muted-foreground hover:text-foreground hover:bg-accent")}>
              <tab.icon size={14} />{tab.label}
            </button>
          ))}
        </div>

        <div className="rounded-2xl border border-border bg-card overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-border bg-muted/30">
            <div className="flex gap-1.5">
              <div className="w-3 h-3 rounded-full bg-red-400/50" />
              <div className="w-3 h-3 rounded-full bg-amber-400/50" />
              <div className="w-3 h-3 rounded-full bg-emerald-400/50" />
            </div>
            <div className="flex-1 mx-4 h-5 rounded-md bg-muted text-muted-foreground text-xs flex items-center px-2">
              app.minierp.io/{activeTab}
            </div>
          </div>
          <ActiveMockup />
        </div>
      </div>
    </section>
  );
}