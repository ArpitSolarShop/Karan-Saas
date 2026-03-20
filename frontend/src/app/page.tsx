"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, 
  UserPlus, 
  CheckCircle2, 
  Megaphone, 
  PhoneCall, 
  Clock,
  ArrowUpRight,
  TrendingUp,
  Activity,
  ShieldCheck,
  Database,
  Search,
  Plus
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
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge"; // I should create this, or use a span

interface DashboardStats {
  totalLeads: number;
  newLeads: number;
  convertedLeads: number;
  totalCalls: number;
  activeCampaigns: number;
  dueCallbacks: number;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function TimeDisplay() {
  const [time, setTime] = useState<string>("");

  useEffect(() => {
    // Initial set avoiding hydration mismatch
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (!time) return <div className="h-5 w-24 bg-surface-2 animate-pulse rounded" />;

  return <p className="text-sm font-black tabular-nums">{time}</p>;
}

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalLeads: 0, newLeads: 0, convertedLeads: 0,
    totalCalls: 0, activeCampaigns: 0, dueCallbacks: 0,
  });
  const [recentLeads, setRecentLeads] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [leadsRes, campaignsRes, callbacksRes] = await Promise.all([
          fetch(`${API_URL}/leads`).then(r => r.json()),
          fetch(`${API_URL}/campaigns`).then(r => r.json()).catch(() => []),
          fetch(`${API_URL}/callbacks/due`).then(r => r.json()).catch(() => []),
        ]);

        const leads = Array.isArray(leadsRes) ? leadsRes : [];
        const campaigns = Array.isArray(campaignsRes) ? campaignsRes : [];
        const callbacks = Array.isArray(callbacksRes) ? callbacksRes : [];

        setStats({
          totalLeads: leads.length,
          newLeads: leads.filter((l: any) => l.status === 'NEW').length,
          convertedLeads: leads.filter((l: any) => l.status === 'CONVERTED').length,
          totalCalls: 0,
          activeCampaigns: campaigns.filter((c: any) => c.status === 'ACTIVE').length,
          dueCallbacks: callbacks.length,
        });
        setRecentLeads(leads.slice(0, 5));
      } catch (err) { console.error('Dashboard fetch error:', err); }
      setLoading(false);
    };
    fetchData();
  }, []);

  const statCards = [
    { label: 'Total Leads', value: stats.totalLeads, icon: Users, color: 'text-primary' },
    { label: 'New Inbound', value: stats.newLeads, icon: UserPlus, color: 'text-success' },
    { label: 'Conversions', value: stats.convertedLeads, icon: CheckCircle2, color: 'text-primary' },
    { label: 'Active Campaigns', value: stats.activeCampaigns, icon: Megaphone, color: 'text-primary' },
    { label: 'Due Callbacks', value: stats.dueCallbacks, icon: Clock, color: 'text-warning' },
    { label: 'Total Minutes', value: '42k', icon: PhoneCall, color: 'text-primary' },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <main className="p-8 max-w-[1600px] mx-auto space-y-12">
        {/* Modern Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div className="space-y-1">
            <h2 className="text-5xl font-black tracking-tight uppercase italic leading-none">
              Command <span className="text-primary tracking-tighter not-italic">Center</span>
            </h2>
            <div className="flex items-center gap-3">
               <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
               <p className="text-text-muted text-[10px] font-black uppercase tracking-[0.4em]">Neural Network Operational // V3.2</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-black uppercase tracking-widest text-text-muted mb-1">Local Terminal Time</p>
              <TimeDisplay />
            </div>
            <Separator orientation="vertical" className="h-10 bg-border hidden md:block" />
            <Button size="lg" className="bg-primary text-white hover:bg-primary-dark font-black uppercase tracking-widest shadow-lg shadow-primary/20 group">
              <Plus className="mr-2 h-4 w-4 group-hover:rotate-90 transition-transform" /> New Objective
            </Button>
          </div>
        </div>

        {/* Dynamic Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
          {statCards.map((card, i) => (
            <Card key={i} className="bg-surface border-border hover:border-primary/50 transition-all group overflow-hidden relative">
              <div className="absolute -right-2 -bottom-2 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity">
                 <card.icon size={80} />
              </div>
              <CardHeader className="pb-2 space-y-0">
                <div className="flex justify-between items-start">
                  <card.icon size={16} className={card.color} />
                  <span className="text-[9px] uppercase tracking-widest text-text-muted font-black">{card.label}</span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-black tracking-tighter">
                  {loading ? (
                    <div className="h-8 w-16 bg-surface-2 animate-pulse rounded" />
                  ) : (
                    card.value
                  )}
                </div>
                <div className="flex items-center gap-1 mt-1">
                   <TrendingUp size={10} className="text-success" />
                   <span className="text-[9px] font-bold text-success uppercase">+12.4%</span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Core Intelligence Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Real-time Ledger */}
          <Card className="lg:col-span-2 bg-surface border-border overflow-hidden flex flex-col">
            <CardHeader className="border-b border-border bg-surface-2/30 px-6 py-4">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={14} className="text-primary" /> Active Feed Service
                  </CardTitle>
                  <CardDescription className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Inbound lead stream // Priority One</CardDescription>
                </div>
                <Button variant="outline" size="sm" asChild className="h-8 text-[10px] uppercase font-black tracking-widest border-border hover:bg-surface-2">
                   <Link href="/leads">Full Analytics ↗</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <Table>
                <TableHeader className="bg-background/50">
                  <TableRow className="border-border hover:bg-transparent">
                    <TableHead className="px-6 h-10 text-[9px] font-black uppercase tracking-widest text-text-muted">Entity ID</TableHead>
                    <TableHead className="px-6 h-10 text-[9px] font-black uppercase tracking-widest text-text-muted">Comm Link</TableHead>
                    <TableHead className="px-6 h-10 text-[9px] font-black uppercase tracking-widest text-text-muted">Status</TableHead>
                    <TableHead className="px-6 h-10 text-[9px] font-black uppercase tracking-widest text-text-muted text-right">Integrity</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <TableRow key={i} className="border-border opacity-50">
                        <TableCell colSpan={4} className="h-12 bg-surface-2 animate-pulse" />
                      </TableRow>
                    ))
                  ) : recentLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-32 text-center text-text-muted text-xs italic">No Active Intelligence Found</TableCell>
                    </TableRow>
                  ) : (
                    recentLeads.map((lead: any) => (
                      <TableRow key={lead.id} className="border-border hover:bg-primary/[0.02] transition-colors group">
                        <TableCell className="px-6 py-4">
                          <div className="flex items-center gap-3">
                             <Avatar className="h-8 w-8 border border-border">
                               <AvatarImage src={`https://avatar.vercel.sh/${lead.name}.png`} />
                               <AvatarFallback className="text-[10px] font-black bg-surface-2">{(lead.name || "U").charAt(0)}</AvatarFallback>
                             </Avatar>
                             <span className="font-black text-sm tracking-tight">{lead.name || lead.firstName}</span>
                          </div>
                        </TableCell>
                        <TableCell className="px-6 py-4 font-mono text-[10px] text-text-muted">{lead.phone}</TableCell>
                        <TableCell className="px-6 py-4">
                          <span className={cn(
                            "px-2 py-0.5 text-[8px] font-black uppercase tracking-[0.2em] rounded border shadow-sm",
                            lead.status === 'NEW' ? 'bg-primary text-white border-primary' : 
                            lead.status === 'CONVERTED' ? 'bg-success/20 text-success border-success/30' : 
                            'bg-surface-2 text-text-muted border-border'
                          )}>
                            {lead.status}
                          </span>
                        </TableCell>
                        <TableCell className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 group-hover:translate-x-[-4px] transition-transform">
                             <div className="h-1 w-12 bg-border rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[80%]" />
                             </div>
                             <span className="text-[9px] font-black text-primary">80%</span>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

          {/* Infrastructure & Ops */}
          <div className="space-y-6">
            <Card className="bg-surface border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Objective Directives</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {[
                  { label: 'Import Leads', href: '/leads', icon: Database },
                  { label: 'Hyper-Campaigns', href: '/campaigns', icon: Megaphone },
                  { label: 'Neural Intelligence', href: '/analytics', icon: TrendingUp },
                  { label: 'Team Protocols', href: '/settings', icon: ShieldCheck },
                ].map((action, i) => (
                  <Button 
                    key={i} 
                    variant="ghost" 
                    asChild 
                    className="w-full justify-start h-12 hover:bg-primary/[0.05] hover:text-primary border border-transparent hover:border-primary/20 transition-all p-3 group"
                  >
                    <Link href={action.href}>
                      <action.icon size={16} className="mr-3 opacity-40 group-hover:opacity-100 transition-opacity" />
                      <span className="text-[10px] font-black uppercase tracking-widest">{action.label}</span>
                      <ArrowUpRight size={14} className="ml-auto opacity-0 group-hover:opacity-100 transition-all" />
                    </Link>
                  </Button>
                ))}
              </CardContent>
            </Card>

            <Card className="bg-surface-2/30 border-border">
              <CardHeader className="pb-4">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] text-text-muted">Infrastructure Status</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { name: 'Alpha API Cluster', status: 'SYNCHRONIZED', color: 'bg-primary' },
                  { name: 'Relational Node 01', status: 'STABLE', color: 'bg-success' },
                  { name: 'Socket stream', status: 'ACTIVE', color: 'bg-success animate-pulse' },
                  { name: 'Neural inference', status: 'IDLE', color: 'bg-text-muted' },
                ].map((svc, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <span className="text-[9px] uppercase font-black tracking-widest text-text-muted group-hover:text-foreground transition-colors">{svc.name}</span>
                    <div className="flex items-center gap-2">
                      <div className={cn("h-1 w-1 rounded-full", svc.color)} />
                      <span className="text-[8px] font-mono text-text-muted italic uppercase tracking-tighter">{svc.status}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
