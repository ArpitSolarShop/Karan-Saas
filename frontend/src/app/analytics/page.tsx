"use client";

import { useEffect, useState, useCallback } from "react";
import { 
  BarChart3, 
  PieChart, 
  TrendingUp, 
  Target, 
  Zap, 
  Users, 
  MousePointer2,
  Activity,
  ArrowUpRight,
  ChevronDown,
  Terminal,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function AnalyticsPage() {
  const [leads, setLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchLeads = useCallback(() => {
    fetch(`${API_URL}/leads`)
      .then(r => r.json())
      .then(d => { setLeads(Array.isArray(d) ? d : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchLeads(); }, [fetchLeads]);

  // Push-based refresh — no polling needed
  useRealtimeSocket({
    leadUpdated: fetchLeads,
    leadCreated: fetchLeads,
    sheetUpdated: fetchLeads,
  });

  const statusCounts = leads.reduce((acc: any, l: any) => { acc[l.status] = (acc[l.status] || 0) + 1; return acc; }, {});
  const sourceCounts = leads.reduce((acc: any, l: any) => { const s = l.source || 'Unknown'; acc[s] = (acc[s] || 0) + 1; return acc; }, {});
  const totalLeads = leads.length;

  const barColors: Record<string, string> = {
    NEW: 'bg-primary', 
    CONTACTED: 'bg-primary/60', 
    INTERESTED: 'bg-primary/80', 
    FOLLOW_UP: 'bg-primary/40',
    NEGOTIATION: 'bg-primary/90', 
    CONVERTED: 'bg-success shadow-[0_0_15px_rgba(16,185,129,0.3)]', 
    LOST: 'bg-surface-2', 
    DNC: 'bg-destructive/30 border border-destructive/20 text-destructive',
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white pb-20">
      <main className="p-8 max-w-[1400px] mx-auto space-y-12">
        {/* Analytics Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-2">
                <BarChart3 size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Data Intelligence</span>
             </div>
             <h2 className="text-5xl font-black tracking-tighter uppercase italic">
               Neural <span className="not-italic text-primary">Metrics</span>
             </h2>
          </div>
          <div className="flex items-center gap-3">
             <Button variant="outline" className="border-border bg-surface-2 h-10 text-[10px] font-black uppercase tracking-widest">
                Export Schema ↗
             </Button>
             <Button className="bg-primary text-white h-10 text-[10px] font-black uppercase tracking-widest px-6 shadow-lg shadow-primary/20">
                Refresh Matrix
             </Button>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-24 space-y-4">
             <Activity size={40} className="mx-auto text-primary animate-pulse" />
             <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.4em]">Aggregating Intelligence Nodes...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Left Column: Funnel & Sources */}
            <div className="xl:col-span-2 space-y-8">
               {/* Multi-Stage Funnel */}
               <Card className="bg-surface border-border overflow-hidden">
                  <CardHeader className="bg-surface-2/30 border-b border-border p-6">
                    <div className="flex justify-between items-center">
                       <div>
                          <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                             <Target size={14} className="text-primary" /> Lead Status Funnel
                          </CardTitle>
                          <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Stage-based pipeline velocity visualization</CardDescription>
                       </div>
                       <Badge variant="outline" className="bg-primary/10 text-primary border-primary/20 font-black text-[9px] uppercase tracking-tighter">Real-time</Badge> 
                    </div>
                  </CardHeader>
                  <CardContent className="p-8 space-y-8">
                    {Object.entries(statusCounts).sort(([,a]: any,[,b]: any) => b - a).map(([status, count]: any) => (
                      <div key={status} className="group space-y-2">
                        <div className="flex justify-between items-end px-1">
                           <span className="text-[10px] font-black text-text-muted uppercase tracking-[0.2em] group-hover:text-foreground transition-colors">{status}</span>
                           <span className="text-sm font-black italic tracking-tighter">{(count as number).toLocaleString()}</span>
                        </div>
                        <div className="h-4 bg-surface-2 rounded-full relative overflow-hidden group-hover:ring-1 group-hover:ring-primary/30 transition-all">
                          <div 
                            className={cn("h-full transition-all duration-1000 ease-out rounded-full", barColors[status] || 'bg-primary/20')}
                            style={{ width: `${(count / totalLeads) * 100}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
               </Card>

               {/* Acquisition Matrix */}
               <Card className="bg-surface border-border overflow-hidden">
                  <CardHeader className="bg-surface-2/30 border-b border-border p-6">
                      <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                         <PieChart size={14} className="text-primary" /> Acquisition Sources
                      </CardTitle>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="grid grid-cols-1 md:grid-cols-2 divide-x divide-y divide-border">
                       {Object.entries(sourceCounts).map(([source, count]: any) => (
                         <div key={source} className="p-6 flex justify-between items-center hover:bg-primary/[0.02] transition-colors group">
                           <div className="flex items-center gap-4">
                              <div className="h-1.5 w-1.5 rounded-full bg-primary/40 group-hover:bg-primary transition-colors" />
                              <span className="text-xs font-black uppercase tracking-tight text-text-muted group-hover:text-foreground">{source}</span>
                           </div>
                           <span className="text-sm font-mono font-black text-foreground">{count}</span>
                         </div>
                       ))}
                    </div>
                  </CardContent>
               </Card>
            </div>

            {/* Right Column: KPIs & System Stats */}
            <div className="space-y-8">
               {/* Premium KPI Box */}
               <Card className="bg-primary border-primary shadow-2xl shadow-primary/20 overflow-hidden relative">
                  <div className="absolute top-0 right-0 p-4 opacity-10">
                     <TrendingUp size={100} className="text-white" />
                  </div>
                  <CardHeader className="pb-4 relative z-10">
                    <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-white/60">Core Performance</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-6 relative z-10">
                    {[
                      { label: 'Registry Size', value: totalLeads },
                      { label: 'Conversion Rate', value: totalLeads > 0 ? ((statusCounts['CONVERTED'] || 0) / totalLeads * 100).toFixed(1) + '%' : '0%' },
                      { label: 'Active Pipeline', value: (statusCounts['INTERESTED'] || 0) + (statusCounts['NEGOTIATION'] || 0) + (statusCounts['FOLLOW_UP'] || 0) },
                    ].map((kpi, i) => (
                      <div key={i} className="flex justify-between items-end border-b border-white/10 pb-4 last:border-0 last:pb-0">
                        <span className="text-[10px] font-black uppercase tracking-widest text-white/50">{kpi.label}</span>
                        <div className="text-right">
                           <span className="text-4xl font-black tracking-tighter text-white leading-none block">{kpi.value}</span>
                           <span className="text-[9px] font-bold text-white/40 uppercase tracking-tighter flex items-center justify-end gap-1">
                              <ArrowUpRight size={10}/> Global Node
                           </span>
                        </div>
                      </div>
                    ))}
                  </CardContent>
               </Card>

               {/* Secondary Metrics */}
               <Card className="bg-surface border-border">
                  <CardHeader className="pb-4">
                    <CardTitle className="text-[10px] font-black uppercase tracking-[0.2em] text-text-muted">Attrition & Risk</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                     {[
                       { label: 'Lost Opportunity', value: statusCounts['LOST'] || 0, color: 'text-text-muted' },
                       { label: 'DNC Restricted', value: statusCounts['DNC'] || 0, color: 'text-destructive' },
                       { label: 'Engagement Lag', value: '4.2s', color: 'text-warning' },
                     ].map((m, i) => (
                       <div key={i} className="flex items-center justify-between p-3 bg-surface-2 rounded-lg border border-border/50">
                          <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">{m.label}</span>
                          <span className={cn("text-xs font-black italic", m.color)}>{m.value}</span>
                       </div>
                     ))}
                  </CardContent>
               </Card>

               {/* Analytics Intelligence Agent */}
               <Card className="bg-surface-2/30 border-border border-dashed">
                  <CardContent className="p-6 space-y-4">
                     <div className="flex items-center gap-3">
                        <div className="h-2 w-2 rounded-full bg-primary animate-ping" />
                        <span className="text-[9px] font-black uppercase tracking-[0.3em] text-primary">AI Insight Node</span>
                     </div>
                     <p className="text-[11px] font-medium leading-relaxed italic text-text-muted">
                       "Pattern analysis detects a 14% increase in 'INTERESTED' transitions within the 'Web-Lead' acquisition source. Recommend accelerating 'NEGOTIATION' wave protocols."
                     </p>
                     <div className="flex items-center justify-between pt-2">
                        <div className="flex items-center gap-2">
                           <Terminal size={10} className="text-text-muted"/>
                           <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Inference Latency: 4ms</span>
                        </div>
                        <ChevronDown size={14} className="text-text-muted cursor-pointer hover:text-white transition-colors" />
                     </div>
                  </CardContent>
               </Card>
            </div>
          </div>
        )}

        {/* Footer Status Section */}
        <footer className="pt-12 border-t border-border flex flex-col md:flex-row justify-between items-center gap-6 opacity-60">
           <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                 <Database size={12} className="text-primary"/>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">Cluster-Alpha Registry</span>
              </div>
              <Separator orientation="vertical" className="h-4 bg-border" />
              <div className="flex items-center gap-2">
                 <MousePointer2 size={12} className="text-text-muted"/>
                 <span className="text-[9px] font-black uppercase tracking-[0.2em]">Tracking Active Sessions</span>
              </div>
           </div>
           <div className="text-[9px] font-black uppercase tracking-[0.4em] text-text-muted italic">
              Empowering Logic // Silicon Valley Night // V.3.2.0
           </div>
        </footer>
      </main>
    </div>
  );
}
