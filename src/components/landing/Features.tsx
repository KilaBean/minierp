import { Package, ShoppingCart, Users, Receipt, BarChart3, Shield, Zap, Globe } from "lucide-react";

const features = [
  { icon: Package,      title: "Inventory Management",  description: "Track stock levels in real-time. Get low stock alerts before you run out. Manage categories effortlessly.", color: "from-blue-500 to-cyan-500",      bg: "bg-blue-500/10",    border: "border-blue-500/20"    },
  { icon: ShoppingCart, title: "POS & Sales System",    description: "Process sales with a lightning-fast point-of-sale interface. Apply discounts and accept multiple payment methods.", color: "from-sky-500 to-blue-500", bg: "bg-sky-500/10",  border: "border-sky-500/20"  },
  { icon: Users,        title: "Customer Management",   description: "Build rich customer profiles. Track purchase history, preferences, and contact info.", color: "from-violet-500 to-purple-500", bg: "bg-violet-500/10",  border: "border-violet-500/20"  },
  { icon: Receipt,      title: "Expense Tracking",      description: "Log business expenses with ease. Categorise spending and see exactly where your money goes.", color: "from-rose-500 to-pink-500",     bg: "bg-rose-500/10",    border: "border-rose-500/20"    },
  { icon: BarChart3,    title: "Reports & Analytics",   description: "Beautiful dashboards with real-time insights. Track revenue trends, top products, and profit margins.", color: "from-amber-500 to-orange-500",  bg: "bg-amber-500/10",   border: "border-amber-500/20"   },
  { icon: Shield,       title: "Role-Based Access",     description: "Control who sees what with Admin, Manager, and Cashier roles. Your data stays secure.", color: "from-emerald-500 to-teal-500",  bg: "bg-emerald-500/10", border: "border-emerald-500/20" },
  { icon: Zap,          title: "PDF Invoices",          description: "Generate professional PDF invoices and receipts in one click. Print or share with customers instantly.", color: "from-sky-500 to-blue-500",      bg: "bg-sky-500/10",     border: "border-sky-500/20"     },
  { icon: Globe,        title: "Multi-Business",        description: "Running multiple businesses? Each gets its own isolated workspace, users, and data.", color: "from-fuchsia-500 to-pink-500",  bg: "bg-fuchsia-500/10", border: "border-fuchsia-500/20" },
];

export function Features() {
  return (
    <section id="features" className="py-24 px-4 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-sky-500/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-sky-500/30 bg-sky-500/10 text-sky-600 dark:text-sky-300 text-xs font-medium mb-4">
            Everything you need
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            All-in-one business<br />
            <span className="text-gradient">management platform</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Stop juggling multiple apps. MiniERP brings every part of your business into a single, unified workspace.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((feature) => (
            <div key={feature.title}
              className={`group relative p-6 rounded-2xl border ${feature.border} ${feature.bg} hover:shadow-md transition-all duration-300 hover:-translate-y-1`}>
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${feature.color} p-0.5 mb-4`}>
                <div className="w-full h-full rounded-[10px] bg-background flex items-center justify-center">
                  <feature.icon size={18} className="text-foreground" />
                </div>
              </div>
              <h3 className="text-base font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}