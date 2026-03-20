"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Megaphone, 
  Plus, 
  Calendar, 
  Settings, 
  BarChart3, 
  Play, 
  Pause, 
  RotateCcw, 
  Archive,
  ChevronRight,
  Clock,
  Globe,
  Users,
  Terminal,
  Activity,
  Zap,
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
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Campaign {
  id: string;
  name: string;
  description?: string;
  type: string;
  dialerMode: string;
  status: string;
  startDate: string;
  endDate?: string;
  callingStartTime: string;
  callingEndTime: string;
  timezone: string;
  maxAttemptsPerLead: number;
  _count?: { leads: number; calls: number; campaignAgents: number };
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: '', description: '', type: 'OUTBOUND', dialerMode: 'PREVIEW', startDate: '' });

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_URL}/campaigns`);
      const data = await res.json();
      setCampaigns(Array.isArray(data) ? data : []);
    } catch (err) { console.error(err); }
    setLoading(false);
  };

  const createCampaign = async () => {
    try {
      await fetch(`${API_URL}/campaigns`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, createdById: 'system' }),
      });
      setShowCreate(false);
      setForm({ name: '', description: '', type: 'OUTBOUND', dialerMode: 'PREVIEW', startDate: '' });
      fetchCampaigns();
    } catch (err) { console.error(err); }
  };

  const updateStatus = async (id: string, status: string) => {
    try {
      await fetch(`${API_URL}/campaigns/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      fetchCampaigns();
    } catch (err) { console.error(err); }
  };

  const statusTags: Record<string, { color: string, icon: any }> = {
    DRAFT: { color: 'bg-surface-2 text-text-muted border-border', icon: Settings },
    ACTIVE: { color: 'bg-primary/20 text-primary border-primary/30', icon: Play },
    PAUSED: { color: 'bg-warning/20 text-warning border-warning/30', icon: Pause },
    COMPLETED: { color: 'bg-success/20 text-success border-success/30', icon: Archive },
    ARCHIVED: { color: 'bg-surface-2 opacity-50 text-text-muted border-border', icon: Archive },
  };

  const cloneCampaign = async (id: string) => {
    try {
      await fetch(`${API_URL}/campaigns/${id}/clone`, { method: 'POST' });
      fetchCampaigns();
    } catch (err) { console.error(err); }
  };

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <main className="p-8 max-w-[1400px] mx-auto space-y-12">
        {/* Futuristic Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
          <div className="space-y-1">
             <div className="flex items-center gap-2 mb-2">
                <Megaphone size={18} className="text-primary" />
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Marketing Protocols</span>
             </div>
             <h2 className="text-5xl font-black tracking-tighter uppercase italic">
               Campaign <span className="not-italic text-primary">Engines</span>
             </h2>
          </div>
          <Button 
            onClick={() => setShowCreate(!showCreate)} 
            size="lg"
            className={cn(
              "font-black uppercase tracking-widest px-8 transition-all shadow-lg",
              showCreate ? "bg-surface-2 text-foreground hover:bg-surface-2/80" : "bg-primary text-white hover:bg-primary-dark shadow-primary/20"
            )}
          >
            {showCreate ? 'Dismiss Terminal' : 'Initialize Campaign'}
          </Button>
        </div>

        {/* Global Strategy Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
           {[
             { label: 'Active Channels', value: campaigns.filter(c => c.status === 'ACTIVE').length, icon: Activity },
             { label: 'Neural Delivery', value: '98.2%', icon: Zap },
             { label: 'Inbound Flow', value: '1.2k/hr', icon: BarChart3 },
             { label: 'Total Objects', value: campaigns.length, icon: Database },
           ].map((m, i) => (
             <div key={i} className="bg-surface-2/30 border border-border p-4 rounded-xl flex items-center gap-4">
                <div className="h-10 w-10 rounded-lg bg-surface flex items-center justify-center border border-border">
                   <m.icon size={18} className="text-primary" />
                </div>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest text-text-muted">{m.label}</p>
                  <p className="text-xl font-black tabular-nums">{m.value}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Deployment Interface */}
        {showCreate && (
          <Card className="bg-surface border-primary/30 shadow-2xl shadow-primary/10 animate-in slide-in-from-top-4 duration-500 overflow-hidden">
            <CardHeader className="bg-surface-2/50 border-b border-border">
               <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Strategy Configuration</CardTitle>
               <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Define the parameters for your next outbound or inbound wave</CardDescription>
            </CardHeader>
            <CardContent className="p-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Campaign Designation</label>
                    <Input className="bg-surface-2 border-border focus:ring-primary h-12 text-sm font-bold uppercase tracking-tight" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} placeholder="E.g. NEURAL-WAVE-01" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Objective Type</label>
                    <Select value={form.type} onValueChange={v => setForm({ ...form, type: v })}>
                      <SelectTrigger className="h-12 bg-surface-2 border-border font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border">
                        <SelectItem value="OUTBOUND">Outbound Protocol</SelectItem>
                        <SelectItem value="INBOUND">Inbound Protocol</SelectItem>
                        <SelectItem value="BLENDED">Blended Matrix</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Dialer Engine</label>
                    <Select value={form.dialerMode} onValueChange={v => setForm({ ...form, dialerMode: v })}>
                      <SelectTrigger className="h-12 bg-surface-2 border-border font-bold">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-surface border-border">
                        <SelectItem value="PREVIEW">Preview Mode</SelectItem>
                        <SelectItem value="PROGRESSIVE">Progressive Sync</SelectItem>
                        <SelectItem value="PREDICTIVE">Predictive Proxy</SelectItem>
                        <SelectItem value="POWER">Power Mode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="space-y-4">
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Deployment Window</label>
                      <Input type="date" className="bg-surface-2 border-border h-12 font-mono" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] font-black uppercase tracking-widest text-text-muted">Strategy Brief</label>
                      <textarea className="w-full bg-surface-2 border border-border rounded-lg p-3 text-xs font-medium min-h-[148px] focus:outline-none focus:ring-1 focus:ring-primary h-12 resize-none placeholder:text-text-muted" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Summarize the core targets and desired outcomes..." />
                   </div>
                </div>
              </div>
              <Separator className="my-8 bg-border" />
              <div className="flex gap-4">
                <Button onClick={createCampaign} size="lg" className="bg-primary text-white hover:bg-primary-dark font-black uppercase tracking-[0.2em] px-8">Initialize Strategy</Button>
                <Button variant="ghost" onClick={() => setShowCreate(false)} className="text-[10px] uppercase tracking-widest font-black text-text-muted hover:text-foreground">Abort Protocol</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Active Registry */}
        {loading ? (
          <div className="text-center py-24 space-y-4">
            <Activity size={40} className="mx-auto text-primary animate-pulse" />
            <p className="text-text-muted font-mono text-[10px] uppercase tracking-[0.4em]">Synchronizing Campaign Registry...</p>
          </div>
        ) : campaigns.length === 0 ? (
          <Card className="p-24 bg-surface border-border border-dashed text-center">
            <Megaphone size={60} className="mx-auto text-text-muted mb-6 opacity-20" />
            <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.3em]">No Active Campaign Nodes Detected</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {campaigns.map(c => {
              const TagInfo = statusTags[c.status] || statusTags.DRAFT;
              return (
                <Card key={c.id} className="bg-surface border-border group hover:border-primary/50 transition-all duration-500 overflow-hidden">
                  <div className="flex flex-col md:flex-row">
                     {/* Left Sidebar Status */}
                     <div className={cn("w-1 md:w-2 shrink-0 transition-colors", c.status === 'ACTIVE' ? 'bg-primary' : 'bg-surface-2')} />
                     
                     <div className="flex-grow p-8">
                        <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8">
                           <div>
                              <div className="flex items-center gap-3 mb-2">
                                 <span className={cn("px-2 py-0.5 text-[8px] font-black uppercase tracking-widest rounded border flex items-center gap-1.5", TagInfo.color)}>
                                    <TagInfo.icon size={10} /> {c.status}
                                 </span>
                                 <span className="text-text-muted font-mono text-[10px] uppercase tracking-tighter">ID: {c.id.slice(0,8)}</span>
                              </div>
                              <h3 className="text-2xl font-black tracking-tighter uppercase italic group-hover:text-primary transition-colors">{c.name}</h3>
                              <p className="text-xs text-text-muted max-w-xl mt-2 leading-relaxed">{c.description || "System default description loaded for this campaign node."}</p>
                           </div>
                           <div className="grid grid-cols-2 gap-x-8 gap-y-4 shrink-0">
                               {[
                                 { label: 'Leads', value: c._count?.leads || 0, sub: 'Total' },
                                 { label: 'Connects', value: c._count?.calls || 0, sub: 'Success' },
                               ].map((stat, i) => (
                                 <div key={i} className="text-right">
                                    <p className="text-[9px] font-black uppercase tracking-widest text-text-muted mb-1">{stat.label}</p>
                                    <p className="text-2xl font-black tabular-nums">{stat.value}</p>
                                    <p className="text-[8px] font-bold text-text-muted uppercase tracking-tighter">{stat.sub}</p>
                                 </div>
                               ))}
                           </div>
                        </div>

                        <Separator className="bg-border mb-8" />

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                           {[
                             { label: 'Deployment', value: new Date(c.startDate).toLocaleDateString(), icon: Calendar },
                             { label: 'Strategy', value: c.type, icon: Zap },
                             { label: 'Engine', value: c.dialerMode, icon: Terminal },
                             { label: 'Window', value: `${c.callingStartTime}—${c.callingEndTime}`, icon: Clock },
                             { label: 'Agents', value: c._count?.campaignAgents || 0, icon: Users },
                             { label: 'Region', value: c.timezone, icon: Globe },
                           ].map((item, i) => (
                             <div key={i} className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded bg-surface-2 flex items-center justify-center border border-border shrink-0">
                                   <item.icon size={14} className="text-text-muted" />
                                </div>
                                <div>
                                   <p className="text-[8px] font-black uppercase tracking-widest text-text-muted">{item.label}</p>
                                   <p className="text-[10px] font-bold uppercase tracking-tight">{item.value}</p>
                                </div>
                             </div>
                           ))}
                        </div>

                        <div className="flex flex-wrap gap-3">
                           {c.status === 'DRAFT' && (
                             <Button onClick={() => updateStatus(c.id, 'ACTIVE')} className="bg-primary text-white hover:bg-primary-dark font-black uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-primary/20">
                               <Play size={14} className="mr-2" /> Start Objective
                             </Button>
                           )}
                           {c.status === 'ACTIVE' && (
                             <Button variant="outline" onClick={() => updateStatus(c.id, 'PAUSED')} className="border-warning text-warning hover:bg-warning/10 font-black uppercase text-[10px] tracking-widest px-6 h-10">
                               <Pause size={14} className="mr-2" /> Suspend Link
                             </Button>
                           )}
                           {c.status === 'PAUSED' && (
                             <Button onClick={() => updateStatus(c.id, 'ACTIVE')} className="bg-primary text-white hover:bg-primary-dark font-black uppercase text-[10px] tracking-widest px-6 h-10 shadow-lg shadow-primary/20">
                               <RotateCcw size={14} className="mr-2" /> Re-Engage
                             </Button>
                           )}
                           {(c.status === 'ACTIVE' || c.status === 'PAUSED') && (
                             <Button variant="outline" onClick={() => updateStatus(c.id, 'COMPLETED')} className="border-border text-text-muted hover:text-foreground hover:border-foreground font-black uppercase text-[10px] tracking-widest px-6 h-10 group">
                               Finalize Data <ChevronRight size={14} className="ml-2 group-hover:translate-x-1 transition-transform" />
                             </Button>
                           )}
                           <Button variant="ghost" onClick={() => cloneCampaign(c.id)} className="text-[10px] font-black uppercase tracking-widest px-6 text-text-muted hover:text-primary h-10 border border-border bg-surface-2">
                             <Plus size={14} className="mr-2" /> Clone Node
                           </Button>
                           <Button variant="ghost" onClick={() => updateStatus(c.id, 'ARCHIVED')} className="text-[10px] font-black uppercase tracking-widest px-6 text-text-muted hover:text-destructive h-10">
                             <Archive size={14} className="mr-2" /> Archive Node
                           </Button>
                        </div>
                     </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
