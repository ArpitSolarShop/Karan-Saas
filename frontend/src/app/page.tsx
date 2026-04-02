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
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for modular widgets
    const timer = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(timer);
  }, []);

  const kpiWidgets = [
    { label: 'Active Pipeline', value: '$2.4M', icon: BarChart3, color: 'text-primary' },
    { label: 'Total Leads', value: '1,490', icon: Users, color: 'text-success' },
    { label: 'Win Rate', value: '28.4%', icon: CheckCircle2, color: 'text-primary' },
    { label: 'Avg Sale Cycle', value: '14 Days', icon: Clock, color: 'text-warning' },
  ];

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
          
          {/* KPI Row (Span 12 -> 3 columns each on XL) */}
          {kpiWidgets.map((kpi, i) => (
            <Card key={i} className="xl:col-span-3 bg-surface border-border hover:border-primary/50 transition-all group overflow-hidden relative shadow-sm">
              <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab hover:bg-surface-2 p-1 rounded">
                 <GripHorizontal size={14} className="text-text-muted" />
              </div>
              <div className="absolute -right-6 -bottom-6 opacity-[0.02] group-hover:opacity-[0.06] transition-opacity pointer-events-none">
                 <kpi.icon size={120} />
              </div>
              <CardHeader className="pb-2 space-y-0 relative z-10 w-full pt-6 px-6">
                <div className="flex justify-between items-start w-full">
                  <div className="flex items-center gap-2">
                    <div className={cn("p-2 rounded-lg bg-surface-2", kpi.color.replace('text-', 'bg-').replace('primary', 'primary/10').replace('success', 'green-500/10').replace('warning', 'yellow-500/10'))}>
                       <kpi.icon size={18} className={kpi.color} />
                    </div>
                    <span className="text-[11px] uppercase tracking-widest text-muted-foreground font-bold">{kpi.label}</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-6 pt-4 relative z-10">
                <div className="text-4xl font-black tracking-tighter">
                  {loading ? <div className="h-10 w-24 bg-surface-2 animate-pulse rounded" /> : kpi.value}
                </div>
                {!loading && (
                   <div className="flex items-center gap-1.5 mt-3">
                     <TrendingUp size={12} className="text-success" />
                     <span className="text-xs font-bold text-success capitalize border border-success/20 bg-success/10 px-2 py-0.5 rounded shadow-sm">+12% vs last month</span>
                   </div>
                )}
              </CardContent>
            </Card>
          ))}

          {/* Large Chart Widget (Span 8) */}
          <Card className="xl:col-span-8 xl:row-span-2 bg-background border-border shadow-md overflow-hidden flex flex-col relative group">
            <div className="absolute right-4 top-4 hover:bg-surface-2 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-muted-foreground" />
            </div>
            <CardHeader className="border-b border-border bg-surface-2/20 px-6 py-5 z-10">
              <div className="flex justify-between items-center pr-8">
                <div>
                  <CardTitle className="text-sm font-bold uppercase tracking-widest flex items-center gap-2">
                    <Activity size={16} className="text-primary" /> Revenue Trajectory
                  </CardTitle>
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="border-primary/20 text-primary bg-primary/5">Year to Date</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0 flex-1 flex flex-col relative min-h-[300px] z-10">
              {loading ? (
                <div className="w-full h-full bg-surface-2/50 animate-pulse flex items-center justify-center">
                  <Activity className="h-12 w-12 text-muted-foreground/30 animate-pulse" />
                </div>
              ) : (
                <div className="w-full h-[400px] bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-surface/10 relative overflow-hidden flex items-end">
                  {/* CSS SVG Mock Chart */}
                  <svg className="w-full h-full pt-10" preserveAspectRatio="none" viewBox="0 0 100 100">
                    <defs>
                      <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>
                    <path d="M0,100 L0,70 Q10,50 20,60 T40,40 T60,50 T80,20 L100,30 L100,100 Z" fill="url(#chartGradient)" />
                    <path d="M0,70 Q10,50 20,60 T40,40 T60,50 T80,20 L100,30" fill="none" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round" />
                    
                    {/* Data Points */}
                    <circle cx="20" cy="60" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1" />
                    <circle cx="40" cy="40" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1" />
                    <circle cx="60" cy="50" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1" />
                    <circle cx="80" cy="20" r="1.5" fill="hsl(var(--background))" stroke="hsl(var(--primary))" strokeWidth="1" />
                  </svg>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action List Widget (Span 4) */}
          <Card className="xl:col-span-4 xl:row-span-2 bg-surface border-border flex flex-col relative group">
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
