import Link from "next/link";
import { Zap } from "lucide-react";

const footerLinks = {
  Product:   [{ label: "Features", href: "#features" },{ label: "Pricing", href: "#pricing" },{ label: "Changelog", href: "#" },{ label: "Roadmap", href: "#" }],
  Company:   [{ label: "About", href: "#" },{ label: "Blog", href: "#" },{ label: "Careers", href: "#" },{ label: "Contact", href: "#" }],
  Resources: [{ label: "Documentation", href: "#" },{ label: "API Reference", href: "#" },{ label: "Status", href: "#" },{ label: "Support", href: "#" }],
  Legal:     [{ label: "Privacy Policy", href: "#" },{ label: "Terms of Service", href: "#" },{ label: "Cookie Policy", href: "#" },{ label: "Security", href: "#" }],
};

export function Footer() {
  return (
    <footer className="border-t border-border py-16 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center">
                <Zap size={16} className="text-white" />
              </div>
              <span className="text-lg font-bold text-foreground" style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>MiniERP</span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Lightweight business management for small businesses that want to grow.
            </p>
          </div>
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-foreground/60 uppercase tracking-wider mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="border-t border-border pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">© {new Date().getFullYear()} MiniERP. All rights reserved.</p>
          <p className="text-sm text-muted-foreground/50">Built for small businesses worldwide</p>
        </div>
      </div>
    </footer>
  );
}