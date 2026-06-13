"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Zap, Sun, Moon } from "lucide-react";
import { useTheme } from "next-themes";

export function Navbar() {
  const [isScrolled,   setIsScrolled]   = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [mounted,      setMounted]      = useState(false);
  const { theme, setTheme } = useTheme();

  useEffect(() => { setMounted(true); }, []);
  useEffect(() => {
    const onScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const isDark = theme === "dark";

  const navLinks = [
    { label: "Features",     href: "#features"     },
    { label: "Preview",      href: "#preview"      },
    { label: "Pricing",      href: "#pricing"      },
    { label: "Testimonials", href: "#testimonials" },
  ];

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isScrolled ? "bg-background/90 backdrop-blur-md border-b border-border" : "bg-transparent"
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
              <Zap size={16} className="text-white" />
            </div>
            <span className="text-lg font-bold text-foreground"
              style={{ fontFamily: "Bricolage Grotesque, sans-serif" }}>
              MiniERP
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a key={link.label} href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors">
                {link.label}
              </a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-accent transition-all"
            >
              {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
            </button>
            <Link href="/auth/login"
              className="text-sm text-muted-foreground hover:text-foreground transition-colors px-4 py-2">
              Sign in
            </Link>
            <Link href="/auth/register"
              className="text-sm bg-sky-600 hover:bg-sky-500 text-white px-4 py-2 rounded-lg transition-colors font-medium">
              Start free
            </Link>
          </div>

          {/* Mobile */}
          <div className="md:hidden flex items-center gap-1">
            <button
              onClick={() => setTheme(isDark ? "light" : "dark")}
              title={mounted ? (isDark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
              className="p-2 rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              {mounted ? (isDark ? <Sun size={16} /> : <Moon size={16} />) : <Sun size={16} />}
            </button>
            <button onClick={() => setIsMobileOpen(!isMobileOpen)}
              className="p-2 text-muted-foreground hover:text-foreground">
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {isMobileOpen && (
        <div className="md:hidden bg-background/95 backdrop-blur-md border-b border-border px-4 py-4 space-y-3">
          {navLinks.map((link) => (
            <a key={link.label} href={link.href} onClick={() => setIsMobileOpen(false)}
              className="block text-sm text-muted-foreground hover:text-foreground py-2 transition-colors">
              {link.label}
            </a>
          ))}
          <div className="pt-3 border-t border-border flex flex-col gap-2">
            <Link href="/auth/login" className="text-sm text-muted-foreground text-center py-2">Sign in</Link>
            <Link href="/auth/register" className="text-sm bg-sky-600 text-white text-center py-2 rounded-lg font-medium">Start free</Link>
          </div>
        </div>
      )}
    </nav>
  );
}