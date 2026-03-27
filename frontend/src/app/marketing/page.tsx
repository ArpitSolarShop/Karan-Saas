"use client";

import { useState, useEffect } from "react";
import { 
  Zap, 
  Layers, 
  Send, 
  Clock, 
  Plus, 
  Globe, 
  Users, 
  BarChart3,
  ChevronRight,
  Monitor,
  MousePointer2,
  Mail,
  MoreVertical,
  Activity
} from "lucide-react";

interface MarketingStep {
  type: 'EMAIL' | 'SMS' | 'WAIT';
  durationMs?: number;
  content?: string;
}

interface MarketingJourney {
  id: string;
  name: string;
  isActive: boolean;
  trigger: string;
  steps: MarketingStep[];
}

export default function MarketingPage() {
  const [activeTab, setActiveTab] = useState<"journeys" | "pages">("journeys");
  const [journeys, setJourneys] = useState<MarketingJourney[]>([]);
  const [pages, setPages] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const fetchData = async () => {
    try {
      const endpoint = activeTab === "journeys" ? "marketing/journeys" : "marketing/pages";
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/${endpoint}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (activeTab === "journeys") setJourneys(Array.isArray(data) ? data : []);
      else setPages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to fetch marketing data", err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-screen bg-background overflow-hidden font-sans">
      {/* Header */}
      <div className="px-8 pt-8 pb-4 border-b border-border bg-surface-2/30">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-primary/20 rounded-lg">
                <Zap className="text-primary" size={20} fill="currentColor" />
              </div>
              <span className="text-primary text-xs font-black tracking-widest uppercase">Marketing Engine</span>
            </div>
            <h1 className="text-4xl font-black text-white tracking-tighter">
              Automation Center
            </h1>
          </div>
          <button className="flex items-center gap-2 px-6 py-3 bg-primary text-black font-black rounded-xl hover:opacity-90 transition-all shadow-xl shadow-primary/20 hover:scale-[1.02] active:scale-[0.98]">
            <Plus size={20} strokeWidth={3} />
            {activeTab === "journeys" ? "New Journey" : "Design Page"}
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="flex gap-8 mt-10">
          <button 
            onClick={() => setActiveTab("journeys")}
            className={`pb-4 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === "journeys" ? "text-primary px-2" : "text-muted-foreground hover:text-white"}`}
          >
            Journeys
            {activeTab === "journeys" && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse" />}
          </button>
          <button 
            onClick={() => setActiveTab("pages")}
            className={`pb-4 text-sm font-black tracking-widest uppercase transition-all relative ${activeTab === "pages" ? "text-primary px-2" : "text-muted-foreground hover:text-white"}`}
          >
            Landing Pages
            {activeTab === "pages" && <div className="absolute bottom-0 left-0 w-full h-1 bg-primary rounded-full shadow-[0_0_10px_rgba(var(--primary),0.5)] animate-pulse" />}
          </button>
        </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto px-8 py-10 custom-scrollbar bg-background">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-64">
            <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-primary mb-4" />
            <p className="text-muted-foreground font-mono text-xs uppercase tracking-widest">Waking up the engine...</p>
          </div>
        ) : activeTab === "journeys" ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {journeys.length === 0 ? (
              <div className="col-span-full py-20 bg-surface/30 border border-dashed border-border rounded-[40px] flex flex-col items-center justify-center">
                 <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative rotate-12">
                   <Layers className="text-muted-foreground/30" size={40} />
                   <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary/20 border border-primary/40 rounded-full flex items-center justify-center">
                     <Plus size={14} className="text-primary" />
                   </div>
                 </div>
                 <h3 className="text-xl font-bold text-white">No active journeys</h3>
                 <p className="text-muted-foreground mt-2 text-sm">Automate your first drip campaign or lead sequence.</p>
              </div>
            ) : (
              journeys.map((j) => (
                <div key={j.id} className="group bg-surface border border-border rounded-[32px] p-8 hover:border-primary/50 transition-all cursor-pointer relative overflow-hidden">
                   <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Zap size={80} fill="currentColor" />
                   </div>
                   
                   <div className={`w-3 h-3 rounded-full mb-6 ${j.isActive ? 'bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]' : 'bg-slate-600'}`} />
                   
                   <h3 className="text-xl font-black text-white mb-2 group-hover:text-primary transition-colors uppercase tracking-tight">{j.name}</h3>
                   <div className="flex items-center gap-2 text-xs text-muted-foreground font-bold uppercase tracking-widest mb-8">
                     <Activity size={12} className="text-primary" />
                     <span>{j.trigger}</span>
                   </div>

                   <div className="space-y-4 mb-8">
                      {(j.steps || []).slice(0, 3).map((step: MarketingStep, idx: number) => (
                        <div key={idx} className="flex items-center gap-3">
                           <div className="w-8 h-8 rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0">
                              {step.type === 'EMAIL' ? <Mail size={14} /> : step.type === 'WAIT' ? <Clock size={14} /> : <ChevronRight size={14} />}
                           </div>
                           <div className="flex-1 h-[2px] bg-border/50" />
                        </div>
                      ))}
                   </div>

                   <div className="flex items-center justify-between pt-6 border-t border-border/50">
                      <div className="flex items-center gap-4">
                        <div className="flex flex-col">
                           <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">Enrolled</span>
                           <span className="text-sm font-bold text-white">2.4k</span>
                        </div>
                        <div className="flex flex-col">
                           <span className="text-[10px] text-muted-foreground font-black uppercase tracking-widest">CTR</span>
                           <span className="text-sm font-bold text-white">18%</span>
                        </div>
                      </div>
                      <button className="p-3 bg-surface-2 rounded-2xl hover:bg-primary/10 group-active:scale-90 transition-all">
                        <ChevronRight className="text-muted-foreground group-hover:text-primary" size={20} />
                      </button>
                   </div>
                </div>
              ))
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {pages.length === 0 ? (
              <div className="col-span-full py-20 bg-surface/30 border border-dashed border-border rounded-[40px] flex flex-col items-center justify-center">
                 <div className="w-20 h-20 bg-surface-2 rounded-3xl flex items-center justify-center mb-6 shadow-2xl relative -rotate-6">
                   <Globe className="text-muted-foreground/30" size={40} />
                 </div>
                 <h3 className="text-xl font-bold text-white">No landing pages</h3>
                 <p className="text-muted-foreground mt-2 text-sm text-center max-w-xs">Create custom high-conversion pages to capture leads directly into your CRM.</p>
              </div>
            ) : (
              pages.map((p) => (
                <div key={p.id} className="group bg-surface border border-border rounded-[32px] overflow-hidden hover:border-primary/50 transition-all cursor-pointer">
                   {/* Preview Mockup */}
                   <div className="h-48 bg-surface-2 relative overflow-hidden p-4">
                      <div className="flex items-center justify-between mb-4">
                         <div className="flex gap-1.5">
                            <div className="w-2 h-2 rounded-full bg-red-500/50" />
                            <div className="w-2 h-2 rounded-full bg-yellow-500/50" />
                            <div className="w-2 h-2 rounded-full bg-green-500/50" />
                         </div>
                         <div className="bg-surface rounded-md px-3 py-1 text-[8px] text-muted-foreground border border-border">
                            {process.env.NEXT_PUBLIC_API_URL?.replace('/api/v1', '')}/p/{p.slug}
                         </div>
                      </div>
                      <div className="w-full h-full bg-background rounded-t-xl border-t border-l border-r border-border p-4">
                         <div className="h-2 w-20 bg-primary/10 rounded mb-2" />
                         <div className="h-2 w-32 bg-muted-foreground/5 rounded mb-4" />
                         <div className="grid grid-cols-2 gap-2">
                           <div className="h-8 bg-surface-2 rounded-lg" />
                           <div className="h-8 bg-primary/5 rounded-lg border border-primary/20" />
                         </div>
                      </div>
                      
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                         <button className="flex items-center gap-2 px-4 py-2 bg-white text-black text-xs font-bold rounded-full">
                           <Monitor size={14} /> View Live
                         </button>
                      </div>
                   </div>

                   <div className="p-8">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-xl font-black text-white group-hover:text-primary transition-colors">{p.name}</h3>
                        <MoreVertical size={18} className="text-muted-foreground hover:text-white" />
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-6">
                        <div className="flex items-center gap-1.5"><MousePointer2 size={12} className="text-primary" /> 1.2k Views</div>
                        <div className="flex items-center gap-1.5"><Users size={12} className="text-primary" /> 84 Leads</div>
                      </div>

                      <div className="flex items-center justify-between pt-6 border-t border-border/50">
                        <div className={`px-3 py-1 rounded-full text-[10px] font-black border uppercase tracking-widest ${p.isPublished ? 'text-green-400 border-green-400/20 bg-green-400/5' : 'text-slate-400 border-border bg-surface-2'}`}>
                          {p.isPublished ? 'Live' : 'Draft'}
                        </div>
                        <button className="flex items-center gap-1.5 text-xs text-primary font-black hover:underline uppercase tracking-widest">
                          Analytics <BarChart3 size={14} />
                        </button>
                      </div>
                   </div>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}
