"use client";

import { useState, useEffect } from "react";
import useSWR from "swr";
import api, { fetcher } from "@/lib/api";
import { 
  Users, 
  Phone, 
  Activity, 
  Clock, 
  BarChart3, 
  ShieldCheck, 
  TrendingUp, 
  Terminal, 
  Cpu, 
  Database,
  Search,
  LayoutDashboard,
  ClipboardList,
  Star,
  Coffee,
  AlertTriangle,
  Radio,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";

const tenantId = typeof window !== "undefined" ? localStorage.getItem("crm_tenantId") || "" : "";

export default function SupervisorConsole() {
  const [activeTab, setActiveTab] = useState("wallboard");
  const { data: live, mutate: reloadWallboard } = useSWR(`/agent-management/wallboard/live?tenantId=${tenantId}`, fetcher, { refreshInterval: 5000 });
  const { data: cdrStats } = useSWR(`/telephony/cdr/stats?tenantId=${tenantId}`, fetcher);

  const statusColors: Record<string, string> = { 
    AVAILABLE: "text-success border-success/30 bg-success/10", 
    ON_CALL: "text-primary border-primary/30 bg-primary/10", 
    WRAP_UP: "text-warning border-warning/30 bg-warning/10", 
    BREAK: "text-destructive border-destructive/30 bg-destructive/10", 
    OFFLINE: "text-text-muted border-border bg-surface-2" 
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans overflow-hidden">
      {/* Top Banner // Global System Status */}
      <header className="h-16 bg-surface border-b border-border flex items-center justify-between px-8 shrink-0 z-50">
        <div className="flex items-center space-x-10">
           <div>
             <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-3">
               <ShieldCheck size={22} className="text-primary"/> Command Center
             </h1>
             <p className="text-[9px] font-mono text-text-muted uppercase tracking-[0.3em] mt-1.5 flex items-center gap-2">
                <Radio size={10} className="text-success animate-pulse"/> Floor Operations // Level 4
             </p>
           </div>
           
           <div className="hidden md:flex gap-8 pl-10 border-l border-border h-10 items-center">
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Active Links</span>
                 <span className="text-sm font-black text-foreground">{live?.agents?.total ?? 0} Agents</span>
              </div>
              <div className="flex flex-col">
                 <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Current SLA</span>
                 <span className="text-sm font-black text-success">98.4%</span>
              </div>
           </div>
        </div>

        <div className="flex items-center space-x-4">
           <div className="flex items-center bg-surface-2 border border-border rounded-lg px-4 h-10 gap-3 group focus-within:ring-1 focus-within:ring-primary transition-all">
              <Search size={14} className="text-text-muted group-focus-within:text-primary" />
              <input 
                type="text" 
                placeholder="PROBE AGENT ID..." 
                className="bg-transparent text-[10px] font-mono uppercase tracking-widest outline-none w-48 placeholder:text-text-muted"
              />
           </div>
           <Button className="bg-primary hover:bg-primary-dark text-white text-[10px] font-black uppercase tracking-widest h-10 px-6 shadow-lg shadow-primary/20">
              <Database size={14} className="mr-2"/> System Audit
           </Button>
        </div>
      </header>

      {/* Main Hub */}
      <main className="flex flex-1 overflow-hidden">
        {/* Navigation Sidebar */}
        <aside className="w-64 bg-surface border-r border-border flex flex-col shrink-0">
           <div className="p-6">
              <h3 className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                 <Cpu size={12}/> Module Selection
              </h3>
              <nav className="space-y-2">
                 {[
                   { id: "wallboard", label: "Live Wallboard", icon: LayoutDashboard },
                   { id: "quality", label: "Quality Control", icon: ClipboardList },
                   { id: "csat", label: "Agent Ratings", icon: Star },
                   { id: "pauses", label: "Pause Monitor", icon: Coffee },
                   { id: "incidents", label: "System Alerts", icon: AlertTriangle },
                 ].map(item => (
                   <button 
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[11px] font-black uppercase tracking-widest transition-all",
                      activeTab === item.id ? "bg-primary text-white shadow-lg shadow-primary/20" : "text-text-muted hover:bg-surface-2 hover:text-foreground"
                    )}
                   >
                     <item.icon size={16}/> {item.label}
                   </button>
                 ))}
              </nav>
           </div>
           
           <div className="mt-auto p-6 bg-surface-2/30 border-t border-border">
              <h4 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Floor Summary</h4>
              <div className="space-y-4">
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] items-center flex gap-2 font-bold"><div className="h-2 w-2 rounded-full bg-success"/> Available</span>
                    <span className="text-xs font-mono font-black text-foreground">{live?.agents?.available ?? 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] items-center flex gap-2 font-bold"><div className="h-2 w-2 rounded-full bg-primary animate-pulse"/> On Call</span>
                    <span className="text-xs font-mono font-black text-foreground">{live?.agents?.onCall ?? 0}</span>
                 </div>
                 <div className="flex justify-between items-center">
                    <span className="text-[10px] items-center flex gap-2 font-bold"><div className="h-2 w-2 rounded-full bg-destructive"/> Break</span>
                    <span className="text-xs font-mono font-black text-foreground">{live?.agents?.onBreak ?? 0}</span>
                 </div>
              </div>
           </div>
        </aside>

        {/* Content Area */}
        <section className="flex-1 bg-background relative overflow-hidden flex flex-col">
           {/* Terminal Watermark */}
           <div className="absolute inset-0 opacity-[0.02] pointer-events-none p-12 overflow-hidden flex flex-col font-mono text-[10px] select-none">
              {Array.from({length: 30}).map((_, i) => (
                <div key={i}>0x{i.toString(16).padStart(4, '0')} MONITORING_THREAD_{i}_STABLE... UPTIME_100%</div>
              ))}
           </div>

           <div className="flex-1 p-10 z-10 overflow-hidden flex flex-col">
              {activeTab === "wallboard" && (
                <ScrollArea className="flex-1 pr-4">
                   <div className="space-y-10">
                      {/* High-Impact Stat Strip */}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                         {[
                           { label: "Floor Throughput", value: live?.calls?.today ?? 0, icon: Phone, color: "primary" },
                           { label: "Answer Efficiency", value: `${live?.calls?.answerRate ?? 0}%`, icon: TrendingUp, color: "success" },
                           { label: "Avg Handle Time", value: "3:42", icon: Clock, color: "warning" },
                           { label: "Live Queue", value: "14", icon: Activity, color: "destructive" },
                         ].map((stat, i) => (
                           <Card key={i} className="bg-surface border-border p-6 rounded-2xl shadow-xl hover:border-primary/30 transition-all group overflow-hidden relative">
                              <div className={cn("absolute top-0 right-0 p-4 opacity-[0.05] group-hover:opacity-10 transition-opacity", `text-${stat.color}`)}>
                                 <stat.icon size={60}/>
                              </div>
                              <p className="text-[9px] font-black text-text-muted uppercase tracking-[0.2em] mb-3">{stat.label}</p>
                              <div className="flex items-end gap-2">
                                 <span className="text-3xl font-black text-foreground tracking-tighter">{stat.value}</span>
                                 <div className="mb-2 h-1 w-8 bg-border rounded-full overflow-hidden">
                                    <div className={cn("h-full", `bg-${stat.color}`)} style={{ width: '70%' }}/>
                                 </div>
                              </div>
                           </Card>
                         ))}
                      </div>

                      {/* Live Agent Terminal */}
                      <div>
                         <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                               <Terminal size={18} className="text-primary"/>
                               <h3 className="text-[11px] font-black text-foreground uppercase tracking-[0.2em]">Floor Session Matrix</h3>
                            </div>
                            <Button variant="outline" size="sm" onClick={() => reloadWallboard()} className="text-[8px] font-black border-border h-7">
                               SYNC NODES
                            </Button>
                         </div>

                         <div className="bg-surface border border-border rounded-2xl shadow-2xl overflow-hidden">
                            <table className="w-full">
                               <thead className="bg-surface-2/50 border-b border-border">
                                  <tr>
                                     {["Node Agent", "Status Protocol", "Active Extension", "Session Time", "Handled", "Disposition Score"].map(h => (
                                       <th key={h} className="text-left py-4 px-6 text-[9px] font-black text-text-muted uppercase tracking-widest">{h}</th>
                                     ))}
                                  </tr>
                               </thead>
                               <tbody className="divide-y divide-border">
                                  {(live?.activeSessions || []).map((s: any) => (
                                    <tr key={s.id} className="hover:bg-surface-2/30 transition-colors group">
                                       <td className="py-4 px-6">
                                          <div className="flex items-center gap-3">
                                             <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-[10px] font-black text-primary group-hover:scale-110 transition-transform">
                                                {s.agent.firstName[0]}{s.agent.lastName[0]}
                                             </div>
                                             <div>
                                                <p className="text-xs font-black text-foreground">{s.agent.firstName} {s.agent.lastName}</p>
                                                <p className="text-[8px] font-mono text-text-muted">A-ID // 0x{s.id.substring(0,4)}</p>
                                             </div>
                                          </div>
                                       </td>
                                       <td className="py-4 px-6">
                                          <Badge className={cn("px-2 py-0.5 text-[9px] font-black tracking-widest border", statusColors[s.agent.agentStatus] || statusColors.OFFLINE)}>
                                             {s.agent.agentStatus}
                                          </Badge>
                                       </td>
                                       <td className="py-4 px-6 text-xs font-mono font-bold text-foreground">{s.agent.extension || "UNLINKED"}</td>
                                       <td className="py-4 px-6 text-[10px] font-mono text-text-muted uppercase tracking-tighter">{new Date(s.loginAt).toLocaleTimeString()}</td>
                                       <td className="py-4 px-6 text-xs font-black text-foreground">{s.callsHandled}</td>
                                       <td className="py-4 px-6">
                                          <div className="flex items-center gap-3">
                                             <div className="flex-1 h-1.5 w-24 bg-border rounded-full overflow-hidden">
                                                <div className="h-full bg-success" style={{ width: '88%' }}/>
                                             </div>
                                             <span className="text-[10px] font-black text-success">88%</span>
                                          </div>
                                       </td>
                                    </tr>
                                  ))}
                                  {(!live?.activeSessions || live.activeSessions.length === 0) && (
                                    <tr>
                                       <td colSpan={6} className="py-20 text-center">
                                          <div className="flex flex-col items-center gap-4">
                                             <Database size={40} className="text-text-muted opacity-20"/>
                                             <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">NO ACTIVE SESSIONS ON FLOOR</p>
                                          </div>
                                       </td>
                                    </tr>
                                  )}
                               </tbody>
                            </table>
                         </div>
                      </div>
                   </div>
                </ScrollArea>
              )}

              {activeTab === "quality" && (
                <div className="flex-1 flex flex-col">
                   <div className="flex items-center justify-between mb-8">
                      <div className="flex items-center gap-3">
                         <BarChart3 size={20} className="text-primary"/>
                         <h3 className="text-lg font-black text-foreground uppercase tracking-tight">Audit Matrix</h3>
                      </div>
                      <Button className="bg-primary text-white text-[10px] font-black uppercase tracking-widest h-10 px-6">
                        + New Form Template
                      </Button>
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {Array.from({length: 3}).map((_, i) => (
                        <Card key={i} className="bg-surface border-border p-6 rounded-2xl hover:border-primary transition-all">
                           <div className="flex justify-between items-start mb-6">
                              <div className="h-10 w-10 rounded-xl bg-surface-2 border border-border flex items-center justify-center">
                                 <ClipboardList size={20} className="text-text-muted"/>
                              </div>
                              <Badge className="bg-success/20 text-success border-success/30 font-black">ACTIVE</Badge>
                           </div>
                           <h4 className="text-sm font-black text-foreground mb-1">Standard Sales Audit v{i+1}.0</h4>
                           <p className="text-[11px] text-text-muted uppercase font-bold tracking-tighter mb-6">Primary quality benchmark for telecalling floor.</p>
                           <div className="flex justify-between items-center text-[10px] font-black uppercase">
                              <span className="text-text-muted">Target Score: <span className="text-foreground">85/100</span></span>
                              <Button variant="link" className="text-primary p-0 h-auto font-black text-[10px]">RECONFIGURE</Button>
                           </div>
                        </Card>
                      ))}
                   </div>
                </div>
              )}

              {/* Other tabs can be added here following same aesthetic */}
              {activeTab !== "wallboard" && activeTab !== "quality" && (
                <div className="flex-1 flex items-center justify-center flex-col gap-4">
                   <div className="h-20 w-20 rounded-full border-2 border-border border-dashed flex items-center justify-center animate-spin duration-10000">
                      <Cpu size={32} className="text-text-muted"/>
                   </div>
                   <p className="text-[10px] font-black text-text-muted uppercase tracking-[0.3em]">Module Encryption Loading...</p>
                </div>
              )}
           </div>

           {/* Floor Footer */}
           <footer className="h-14 bg-surface border-t border-border flex items-center px-8 shrink-0 justify-between">
              <div className="flex items-center gap-10">
                 <div className="flex items-center gap-3">
                    <div className="h-2 w-2 rounded-full bg-success"/>
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Global Link: Online</span>
                 </div>
                 <div className="flex items-center gap-3">
                    <span className="text-[9px] font-black text-text-muted uppercase tracking-widest">Core Latency: <span className="text-foreground">14ms</span></span>
                 </div>
              </div>
              <div className="text-[9px] font-mono text-text-muted uppercase tracking-[0.1em]">
                 Proprietary Kernel v4.2.0-STABLE // {new Date().toLocaleDateString()}
              </div>
           </footer>
        </section>
      </main>
    </div>
  );
}
