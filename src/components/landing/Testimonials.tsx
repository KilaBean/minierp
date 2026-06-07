import { Star } from "lucide-react";

const testimonials = [
  { name: "Sarah Okafor",   role: "Owner, The Coffee Nook",  avatar: "SO", color: "from-amber-500 to-orange-600",  rating: 5, text: "MiniERP completely transformed how I run my café. I used to track everything in spreadsheets — now I have real-time insights into my inventory and sales. It paid for itself in the first month." },
  { name: "James Mensah",   role: "Founder, TechHub Accra",  avatar: "JM", color: "from-indigo-500 to-violet-600", rating: 5, text: "As a tech retailer, inventory was always my biggest headache. MiniERP's low-stock alerts and sales tracking have saved me countless hours. My team loves the POS system." },
  { name: "Amara Diallo",   role: "Manager, Fresh Market",   avatar: "AD", color: "from-emerald-500 to-teal-600",  rating: 5, text: "We serve hundreds of customers daily. MiniERP keeps our operations running smoothly. The customer profiles feature has helped us build loyalty we never had before." },
  { name: "Chen Wei",       role: "Director, ImportLink",    avatar: "CW", color: "from-rose-500 to-pink-600",     rating: 5, text: "The expense tracking and profit reports are exactly what I needed. For the first time, I actually know which products are profitable and which ones are draining my margin." },
  { name: "Fatima Al-Rashidi", role: "CEO, Bloom Boutique",  avatar: "FA", color: "from-purple-500 to-fuchsia-600",rating: 5, text: "I was skeptical about switching from my old system, but the migration was smooth and the support team was incredible. My team was up to speed within a day." },
  { name: "David Osei",     role: "Owner, QuickPrint",       avatar: "DO", color: "from-sky-500 to-blue-600",      rating: 5, text: "The PDF invoice generation alone is worth the subscription. Professional-looking invoices with my branding sent to customers in seconds. Game changer." },
];

export function Testimonials() {
  return (
    <section id="testimonials" className="py-24 px-4 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-violet-500/5 to-transparent pointer-events-none" />
      <div className="max-w-7xl mx-auto relative">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300 text-xs font-medium mb-4">
            <Star size={12} fill="currentColor" />
            Loved by businesses
          </div>
          <h2 className="text-3xl md:text-5xl font-bold text-foreground mb-4"
            style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
            Real businesses,<br />
            <span className="text-gradient">real results</span>
          </h2>
          <p className="text-muted-foreground max-w-xl mx-auto">
            Join thousands of small businesses already using MiniERP to grow smarter.
          </p>
        </div>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {testimonials.map((t) => (
            <div key={t.name}
              className="break-inside-avoid bg-card border border-border rounded-2xl p-6 hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
              <div className="flex gap-0.5 mb-4">
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400" fill="currentColor" />
                ))}
              </div>
              <p className="text-muted-foreground text-sm leading-relaxed mb-5">&ldquo;{t.text}&rdquo;</p>
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${t.color} flex items-center justify-center text-xs font-bold text-white flex-shrink-0`}>
                  {t.avatar}
                </div>
                <div>
                  <div className="text-sm font-semibold text-foreground">{t.name}</div>
                  <div className="text-xs text-muted-foreground">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}