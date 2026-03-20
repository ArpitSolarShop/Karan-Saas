"use client";

import { useState, useEffect } from "react";
import { 
  Book, 
  Search, 
  Plus, 
  FileText, 
  ExternalLink, 
  Folder,
  ChevronRight,
  TrendingUp,
  LayoutGrid,
  List
} from "lucide-react";
import { format } from "date-fns";

export default function KnowledgePage() {
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    fetchArticles();
  }, []);

  const fetchArticles = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/knowledge`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      setArticles(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch articles", err);
      setArticles([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredArticles = articles.filter(a => 
    a.title?.toLowerCase().includes(search.toLowerCase()) || 
    a.category?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <div className="px-8 py-8 border-b border-border bg-surface-2/30 backdrop-blur-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl animate-pulse" />
        
        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Book className="text-primary" size={20} />
              </div>
              <span className="text-primary text-xs font-bold tracking-[0.2em] uppercase">Knowledge Hub</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Article Library
            </h1>
            <p className="text-muted-foreground mt-2 text-sm max-w-lg leading-relaxed">
              Create and manage documentation, help guides, and internal wikis for your team and customers.
            </p>
          </div>
          <div className="flex items-center gap-3">
             <div className="flex bg-surface border border-border rounded-xl p-1 shrink-0 shadow-inner">
               <button 
                 onClick={() => setView("grid")}
                 className={`p-2 rounded-lg transition-all ${view === "grid" ? "bg-surface-2 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
               >
                 <LayoutGrid size={18} />
               </button>
               <button 
                 onClick={() => setView("list")}
                 className={`p-2 rounded-lg transition-all ${view === "list" ? "bg-surface-2 text-primary shadow-sm" : "text-muted-foreground hover:text-white"}`}
               >
                 <List size={18} />
               </button>
             </div>
             <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
               <Plus size={20} strokeWidth={3} />
               Create Article
             </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-10 relative max-w-2xl group">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search className="text-muted-foreground group-focus-within:text-primary transition-colors" size={20} />
          </div>
          <input
            type="text"
            placeholder="Search by title, category, or keywords..."
            className="w-full bg-surface/50 border-2 border-border rounded-2xl pl-12 pr-4 py-4 focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all text-base placeholder:text-muted-foreground/50 shadow-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar bg-background">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-surface border border-border rounded-3xl p-6 space-y-4 animate-pulse">
                <div className="w-12 h-12 bg-surface-2 rounded-2xl" />
                <div className="h-6 bg-surface-2 rounded-full w-3/4" />
                <div className="space-y-2">
                  <div className="h-4 bg-surface-2 rounded-full w-full" />
                  <div className="h-4 bg-surface-2 rounded-full w-5/6" />
                </div>
              </div>
            ))}
          </div>
        ) : filteredArticles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 bg-surface/20 border-2 border-dashed border-border rounded-[40px]">
            <div className="w-24 h-24 bg-surface border border-border rounded-[32px] flex items-center justify-center mb-8 shadow-2xl rotate-6">
              <FileText size={48} className="text-muted-foreground/30" strokeWidth={1} />
            </div>
            <h3 className="text-2xl font-black text-white tracking-tight">No articles found</h3>
            <p className="text-muted-foreground mt-3 max-w-sm text-center text-sm leading-relaxed">
              Start by creating your first help document or guide to build your organizational knowledge.
            </p>
            <button className="mt-8 text-primary font-bold hover:underline flex items-center gap-2 px-6 py-2 bg-primary/5 rounded-full border border-primary/20">
              Check out sample templates <ChevronRight size={16} />
            </button>
          </div>
        ) : view === "grid" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article) => (
              <div 
                key={article.id}
                className="group relative bg-surface border border-border rounded-[32px] p-7 pt-10 hover:border-primary/40 transition-all cursor-pointer hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)] hover:-translate-y-2"
              >
                <div className="absolute top-6 left-7 px-3 py-1 rounded-full bg-primary/10 border border-primary/20 text-[10px] font-black text-primary uppercase tracking-widest flex items-center gap-1.5">
                   <TrendingUp size={10} />
                   Popular
                </div>
                
                <div className="mb-6 p-4 bg-surface-2 rounded-2xl w-fit group-hover:bg-primary/10 transition-colors">
                  <FileText className="text-muted-foreground group-hover:text-primary transition-colors" size={28} />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-3 group-hover:text-primary transition-colors leading-tight">
                  {article.title}
                </h3>
                
                <p className="text-muted-foreground text-sm line-clamp-3 mb-6 leading-relaxed">
                  {article.content.replace(/<[^>]*>/g, '').slice(0, 120)}...
                </p>

                <div className="flex items-center justify-between pt-6 border-t border-border/50">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-surface-2 border border-border flex items-center justify-center text-[10px] font-bold">
                      {article.author?.firstName?.[0] || "A"}
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {article.category}
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-primary font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                    View <ChevronRight size={14} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
             {filteredArticles.map((article) => (
               <div 
                key={article.id}
                className="group flex items-center justify-between bg-surface border border-border rounded-2xl p-5 hover:border-primary/40 transition-all cursor-pointer"
               >
                 <div className="flex items-center gap-5">
                   <div className="p-3 bg-surface-2 rounded-xl group-hover:bg-primary/10 transition-colors">
                     <FileText size={20} className="text-muted-foreground group-hover:text-primary" />
                   </div>
                   <div>
                     <h4 className="font-bold text-white group-hover:text-primary transition-colors">{article.title}</h4>
                     <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                       <span className="flex items-center gap-1"><Folder size={12} /> {article.category}</span>
                       <span>•</span>
                       <span>Updated {format(new Date(article.updatedAt), 'MMM d, yyyy')}</span>
                     </div>
                   </div>
                 </div>
                 <div className="flex items-center gap-4 text-muted-foreground group-hover:text-primary transition-colors">
                    <span className="text-xs font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity">Open Article</span>
                    <ExternalLink size={18} />
                 </div>
               </div>
             ))}
          </div>
        )}
      </div>
    </div>
  );
}
