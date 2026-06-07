"use client";

import { useState, useEffect, useRef } from "react";
import { User, Search, X, Plus, Loader2 } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";
import { searchCustomers, createCustomer } from "@/lib/actions/customers";
import { Customer } from "@/types";
import { cn } from "@/lib/utils";

export function CustomerSearch({ currency }: { currency?: string }) {
  const { customer_id, customer_name, setCustomer } = useCartStore();
  const [query,    setQuery]    = useState("");
  const [results,  setResults]  = useState<Customer[]>([]);
  const [open,     setOpen]     = useState(false);
  const [loading,  setLoading]  = useState(false);
  const [creating, setCreating] = useState(false);
  const [newName,  setNewName]  = useState("");
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleSearch(q: string) {
    setQuery(q);
    if (!q.trim()) { setResults([]); return; }
    setLoading(true);
    const data = await searchCustomers(q);
    setResults(data);
    setLoading(false);
    setOpen(true);
  }

  async function handleQuickCreate() {
    if (!newName.trim()) return;
    setCreating(true);
    const fd = new FormData();
    fd.set("name", newName.trim());
    const result = await createCustomer(fd);
    if (result.success && result.data) {
      setCustomer(result.data.id, result.data.name);
      setQuery(""); setResults([]); setOpen(false); setNewName("");
    }
    setCreating(false);
  }

  if (customer_id) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 border border-primary/20 rounded-xl">
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
          <User size={12} className="text-primary-foreground" />
        </div>
        <span className="text-sm font-medium text-foreground flex-1 truncate">{customer_name}</span>
        <button onClick={() => setCustomer(null, null)} className="text-muted-foreground hover:text-foreground transition-colors">
          <X size={14} />
        </button>
      </div>
    );
  }

  return (
    <div ref={ref} className="relative">
      <div className="relative">
        <User size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          value={query}
          onChange={(e) => handleSearch(e.target.value)}
          onFocus={() => query && setOpen(true)}
          placeholder="Search customer (optional)…"
          className="w-full pl-8 pr-4 py-2 text-sm bg-background border border-border rounded-xl
            text-foreground placeholder:text-muted-foreground
            focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all"
        />
        {loading && <Loader2 size={13} className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-muted-foreground" />}
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-popover border border-border rounded-xl shadow-xl z-50 overflow-hidden">
          {results.length > 0 && results.map((c) => (
            <button key={c.id} onClick={() => { setCustomer(c.id, c.name); setQuery(""); setOpen(false); }}
              className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-accent transition-colors text-left">
              <div className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center flex-shrink-0 text-xs font-bold text-primary">
                {c.name[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-foreground truncate">{c.name}</div>
                {c.phone && <div className="text-xs text-muted-foreground">{c.phone}</div>}
              </div>
            </button>
          ))}

          {/* Quick create */}
          <div className="border-t border-border p-2">
            <div className="flex gap-2">
              <input value={newName} onChange={(e) => setNewName(e.target.value)}
                placeholder={`Create "${query}"…`}
                className="flex-1 px-2.5 py-1.5 text-xs bg-background border border-border rounded-lg text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30" />
              <button onClick={handleQuickCreate} disabled={!newName.trim() || creating}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-primary text-primary-foreground rounded-lg disabled:opacity-50 transition-all">
                {creating ? <Loader2 size={11} className="animate-spin" /> : <Plus size={11} />}
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
