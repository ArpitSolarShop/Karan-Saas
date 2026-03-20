"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, X, User, Phone, FileText } from "lucide-react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

interface SearchResult {
  id: string;
  name?: string;
  firstName?: string;
  phone?: string;
  email?: string;
  status?: string;
}

interface SearchResults {
  leads: SearchResult[];
  contacts: SearchResult[];
  calls: SearchResult[];
  query: string;
}

export function GlobalSearch() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResults | null>(null);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Keyboard shortcut: / to open
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "/" && !e.ctrlKey && !e.metaKey && document.activeElement?.tagName !== "INPUT") {
        e.preventDefault();
        setOpen(true);
        setTimeout(() => inputRef.current?.focus(), 10);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Debounced search
  useEffect(() => {
    if (!query || query.length < 2) { setResults(null); return; }
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/search?q=${encodeURIComponent(query)}&limit=5`);
        setResults(data);
      } catch {}
      finally { setLoading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [query]);

  const totalResults = (results?.leads.length ?? 0) + (results?.contacts.length ?? 0) + (results?.calls.length ?? 0);

  function navigate(path: string) {
    router.push(path);
    setOpen(false);
    setQuery("");
    setResults(null);
  }

  if (!open) {
    return (
      <button
        onClick={() => { setOpen(true); setTimeout(() => inputRef.current?.focus(), 10); }}
        className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-surface-2 border border-border rounded-lg text-[10px] text-text-muted hover:text-foreground transition"
      >
        <Search size={12} /> Search
        <kbd className="ml-1 text-[9px] px-1 bg-surface rounded border border-border">/</kbd>
      </button>
    );
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-20 px-4" onClick={() => setOpen(false)}>
      <div className="w-full max-w-xl bg-surface border border-border rounded-2xl shadow-2xl shadow-black/60" onClick={(e) => e.stopPropagation()}>
        {/* Input */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border">
          {loading ? (
            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin shrink-0" />
          ) : (
            <Search size={16} className="text-text-muted shrink-0" />
          )}
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, contacts, calls…"
            className="flex-1 bg-transparent text-sm text-foreground placeholder:text-text-muted outline-none"
          />
          <button onClick={() => setOpen(false)} className="text-text-muted hover:text-foreground transition">
            <X size={14} />
          </button>
        </div>

        {/* Results */}
        {results && (
          <div className="py-2 max-h-[400px] overflow-y-auto">
            {totalResults === 0 ? (
              <p className="text-xs text-text-muted text-center py-6">No results for "{query}"</p>
            ) : (
              <>
                {results.leads.length > 0 && (
                  <div className="px-3 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-2">Leads</p>
                    {results.leads.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => navigate(`/leads?id=${l.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition text-left"
                      >
                        <div className="h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                          <User size={12} className="text-primary" />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{l.name || l.firstName}</p>
                          <p className="text-[11px] text-text-muted">{l.phone} · {l.status}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
                {results.calls.length > 0 && (
                  <div className="px-3 pb-2">
                    <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted px-2 py-2">Calls</p>
                    {results.calls.map((c) => (
                      <button
                        key={c.id}
                        onClick={() => navigate(`/leads?callId=${c.id}`)}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-surface-2 transition"
                      >
                        <div className="h-7 w-7 rounded-full bg-blue-500/20 flex items-center justify-center shrink-0">
                          <Phone size={12} className="text-blue-400" />
                        </div>
                        <p className="text-sm">{(c as any).transcript?.slice(0, 60) || "Call record"}</p>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}

        {!results && (
          <p className="text-[11px] text-text-muted text-center py-5">Type to search across all CRM data…</p>
        )}
      </div>
    </div>
  );
}
