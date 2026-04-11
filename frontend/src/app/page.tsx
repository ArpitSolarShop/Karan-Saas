"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, CheckCircle2, Megaphone, PhoneCall, Clock,
  ArrowUpRight, TrendingUp, Activity, ShieldCheck, Database, Focus,
  GripHorizontal, BarChart3, PieChart, PanelLeftOpen, Maximize2
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { LiveMetricsHub } from "@/components/dashboard/LiveMetricsHub";
import { AIForecast } from "@/components/dashboard/AIForecast";
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from "recharts";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

function TimeDisplay() {
  const [time, setTime] = useState<string>("");
  useEffect(() => {
    setTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);
  if (!time) return <div className="h-5 w-24 bg-surface-2 animate-pulse rounded" />;
  return <p className="text-sm font-black tabular-nums">{time}</p>;
}

export default function DashboardModular() {
  const [volumeData, setVolumeData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChartData() {
       try {
         const token = localStorage.getItem('crm_token');
         const res = await fetch(`${API_URL}/reports/daily-call-volume?days=14`, {
            headers: { 'Authorization': `Bearer ${token}` }
         });
         const json = await res.json();
         setVolumeData(json);
       } catch (err) {
         console.error("Volume fetch fail", err);
       } finally {
         setLoading(false);
       }
    }
    fetchChartData();
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground font-sans selection:bg-primary selection:text-white">
      <main className="p-8 max-w-[1800px] mx-auto space-y-8">
        {/* Header Action Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 rounded-xl border border-border bg-surface/30 p-6 backdrop-blur-sm">
          <div className="space-y-1">
            <h2 className="text-4xl font-black tracking-tight flex items-center gap-3">
              <Focus className="h-8 w-8 text-primary" /> Core Dashboard
            </h2>
            <div className="flex items-center gap-3 mt-2">
               <span className="h-2 w-2 rounded-full bg-success animate-pulse shadow-[0_0_10px_rgba(0,255,0,0.5)]" />
               <p className="text-text-muted text-[11px] font-bold uppercase tracking-widest">Workspace Online // Multi-Tenant System</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right hidden md:block">
              <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-1">Local Time</p>
              <TimeDisplay />
            </div>
            <Separator orientation="vertical" className="h-10 bg-border hidden md:block" />
            <Button variant="outline" className="border-border hover:bg-surface-2 font-bold uppercase tracking-widest text-xs hidden sm:flex">
              <PanelLeftOpen className="mr-2 h-4 w-4" /> Edit Layout
            </Button>
          </div>
        </div>

        {/* MODULAR WIDGET GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-12 gap-6 auto-rows-[minmax(180px,auto)]">
          
          {/* Large Chart Widget (Span 8) */}
          <Card className="xl:col-span-8 xl:row-span-2 bg-background border-border shadow-md overflow-hidden flex flex-col relative group">
            <div className="absolute right-4 top-4 hover:bg-surface-2 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-muted-foreground" />
            </div>
            <CardHeader className="border-b border-border bg-surface-2/20 px-6 py-5 z-10">
              <div className="flex justify-between items-center pr-8">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-primary" /> Daily Call Volume Trends
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">14 Day Trace</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 flex flex-col relative min-h-[350px] z-10">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Activity className="h-12 w-12 text-muted-foreground/30 animate-pulse" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                      tickFormatter={(val) => val.split('-').slice(1).join('/')}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: 'hsl(var(--muted-foreground))', fontSize: 10}}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: 'hsl(var(--surface))', border: '1px solid hsl(var(--border))', borderRadius: '8px', fontSize: '12px'}}
                      itemStyle={{fontWeight: 'bold'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          {/* AI INTELLIGENCE PULSE CARD (Span 4) */}
          <div className="xl:col-span-4 flex flex-col gap-6">
             <AIForecast />
          </div>

          {/* Action List Widget (Span 4 -> but moved to separate row logic) */}
          <Card className="xl:col-span-8 bg-surface border-border flex flex-col relative group">
            <div className="absolute right-4 top-4 hover:bg-surface-2 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-muted-foreground" />
            </div>
            <CardHeader className="pb-4 pt-5 px-6 border-b border-border/50">
              <CardTitle className="text-sm font-bold uppercase tracking-widest text-foreground flex items-center gap-2">
                 <ShieldCheck size={16} className="text-warning" /> Action Items
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 flex-1 overflow-hidden">
               <div className="divide-y divide-border/50 h-full overflow-y-auto">
                 {loading ? (
                    Array(5).fill(0).map((_, i) => (
                      <div key={i} className="p-4 flex gap-3 h-20 bg-surface-2/20 animate-pulse border-b border-border/50" />
                    ))
                 ) : (
                    [
                      { t: 'Review GlobalCorp Contract', desc: 'Overdue by 2 days', time: '10:30 AM', priority: 'High' },
                      { t: 'Call with Sarah Jenkins', desc: 'Discuss Q3 Proposal', time: '2:00 PM', priority: 'Medium' },
                      { t: 'Approve Invoice INV-302', desc: 'Net 30 Pending', time: 'Pending', priority: 'Low' },
                      { t: 'Sync Product Catalog', desc: 'Erp integration check', time: 'Daily', priority: 'Medium' },
                      { t: 'Update Security Policy', desc: 'Annual review required', time: 'Soon', priority: 'Low' },
                    ].map((task, i) => (
                      <div key={i} className="p-4 flex items-start gap-3 hover:bg-primary/[0.02] cursor-pointer transition-colors group/row">
                        <div className={`mt-0.5 h-3 w-3 rounded-full border-2 ${task.priority === 'High' ? 'border-red-500 bg-red-500/20' : task.priority === 'Medium' ? 'border-warning bg-warning/20' : 'border-border bg-surface-2'}`} />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-foreground truncate group-hover/row:text-primary transition-colors">{task.t}</p>
                          <p className="text-xs text-muted-foreground truncate">{task.desc}</p>
                        </div>
                        <span className="text-[10px] font-bold text-muted-foreground bg-surface-2 px-2 py-0.5 rounded uppercase tracking-widest">{task.time}</span>
                      </div>
                    ))
                 )}
               </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
