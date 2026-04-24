"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  Users, UserPlus, CheckCircle2, Megaphone, PhoneCall, Clock,
  ArrowUpRight, TrendingUp, Activity, ShieldCheck, Database, Focus,
  GripHorizontal, BarChart3, PieChart, PanelLeftOpen, Maximize2,
  LayoutDashboard, BrainCircuit, Settings, Bell, Plus, ChevronRight, MoreHorizontal, Sparkles
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
    <>

        {/* Hero Section */}
        <section className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.8)]"></span>
                <span className="text-[0.65rem] font-bold text-emerald-600 uppercase tracking-wider">Workspace Online</span>
              </div>
            </div>
            <h1 className="text-4xl font-extrabold tracking-tight text-[#111827]">Core Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-lg text-[0.75rem] font-semibold text-slate-700 hover:bg-slate-50 transition-colors">
              <PanelLeftOpen size={16} />
              Edit Layout
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg text-[0.75rem] font-semibold hover:opacity-90 transition-opacity shadow-sm">
              <Plus size={16} />
              New Entry
            </button>
          </div>
        </section>

        {/* Bento Grid Layout */}
        <div className="grid grid-cols-12 gap-6">
          
          {/* Daily Call Volume Trends (Wide) */}
          <div className="col-span-12 lg:col-span-8 bg-white border border-slate-200 rounded-xl p-6 shadow-sm flex flex-col relative group">
            <div className="absolute right-4 top-4 hover:bg-slate-100 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-between mb-8 z-10">
              <div>
                <h3 className="text-sm font-semibold text-[#111827] tracking-tight">Daily Call Volume Trends</h3>
                <p className="text-[0.75rem] text-slate-500">Real-time engagement velocity metrics</p>
              </div>
              <div className="flex items-center gap-2 mr-8">
                <span className="text-[0.75rem] font-semibold text-emerald-600">+12.4%</span>
                <TrendingUp size={16} className="text-emerald-600" />
              </div>
            </div>
            <div className="h-64 w-full relative z-10">
              {loading ? (
                <div className="w-full h-full flex items-center justify-center">
                  <Activity className="h-12 w-12 text-slate-300 animate-pulse" />
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={volumeData}>
                    <defs>
                      <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 10}}
                      tickFormatter={(val) => val ? val.split('-').slice(1).join('/') : ''}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{fill: '#6B7280', fontSize: 10}}
                    />
                    <Tooltip 
                      contentStyle={{backgroundColor: '#FFFFFF', border: '1px solid #E5E7EB', borderRadius: '8px', fontSize: '12px'}}
                      itemStyle={{fontWeight: 'bold', color: '#4F46E5'}}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="total" 
                      stroke="#4F46E5" 
                      strokeWidth={3}
                      fillOpacity={1} 
                      fill="url(#colorTotal)" 
                      animationDuration={1500}
                    />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* AI Intelligence Pulse (Wrapper for existing AIForecast) */}
          <div className="col-span-12 lg:col-span-4 bg-gradient-to-br from-indigo-600 to-indigo-800 rounded-xl p-6 text-white shadow-lg relative group">
             <div className="absolute right-4 top-4 hover:bg-white/10 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-white" />
            </div>
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <BrainCircuit size={120} />
            </div>
            <div className="relative z-10 flex flex-col h-full">
              <div className="flex items-center gap-2 mb-6">
                <Sparkles size={18} />
                <h3 className="text-sm font-semibold tracking-[-0.02em]">AI Intelligence Pulse</h3>
              </div>
              <div className="mb-auto">
                 <AIForecast />
              </div>
              <button className="mt-6 w-full py-2 bg-white/10 hover:bg-white/20 transition-colors border border-white/20 rounded-lg text-[0.75rem] font-semibold">
                  View Deep Insights
              </button>
            </div>
          </div>

          {/* Action Items */}
          <div className="col-span-12 md:col-span-6 lg:col-span-4 bg-white border border-slate-200 rounded-xl p-6 shadow-sm group relative">
             <div className="absolute right-4 top-4 hover:bg-slate-100 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm font-semibold text-[#111827] tracking-tight">Action Items</h3>
              <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 text-[0.65rem] font-bold">5 PENDING</span>
            </div>
            <div className="space-y-3 h-64 overflow-y-auto pr-2">
              {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <div key={i} className="p-4 flex gap-3 h-16 bg-slate-50 animate-pulse rounded-lg" />
                  ))
              ) : (
                [
                  { t: 'Review GlobalCorp Contract', desc: 'Overdue by 2 days', time: '10:30 AM', priority: 'High' },
                  { t: 'Call with Sarah Jenkins', desc: 'Discuss Q3 Proposal', time: '2:00 PM', priority: 'Medium' },
                  { t: 'Approve Invoice INV-302', desc: 'Net 30 Pending', time: 'Pending', priority: 'Low' },
                  { t: 'Sync Product Catalog', desc: 'Erp integration check', time: 'Daily', priority: 'Medium' },
                  { t: 'Update Security Policy', desc: 'Annual review required', time: 'Soon', priority: 'Low' },
                ].map((task, i) => (
                  <div key={i} className="flex items-center gap-4 p-3 hover:bg-slate-50 transition-colors rounded-lg group/item cursor-pointer border border-transparent hover:border-slate-100">
                    <div className={`w-1.5 h-10 rounded-full ${task.priority === 'High' ? 'bg-red-500' : task.priority === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                    <div className="flex-1">
                      <p className="text-[0.75rem] font-semibold text-[#111827] group-hover/item:text-indigo-600 transition-colors">{task.t}</p>
                      <p className="text-[0.65rem] text-slate-500">{task.time} • {task.priority} Priority</p>
                    </div>
                    <ChevronRight size={16} className="text-slate-300 opacity-0 group-hover/item:opacity-100 transition-opacity" />
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Recent Deals (Asymmetric layout item) */}
          <div className="col-span-12 md:col-span-6 lg:col-span-8 bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col group relative">
             <div className="absolute right-4 top-4 hover:bg-slate-100 p-1 rounded z-20 cursor-grab opacity-50 group-hover:opacity-100">
               <GripHorizontal size={16} className="text-slate-400" />
            </div>
            <div className="p-6 border-b border-slate-100">
              <div className="flex items-center justify-between pr-8">
                <h3 className="text-sm font-semibold text-[#111827] tracking-tight">Recent Lead Conversions</h3>
                <button className="text-[0.75rem] font-bold text-indigo-600 hover:underline">See Pipeline</button>
              </div>
            </div>
            <div className="flex-1 overflow-x-auto">
              <table className="w-full text-left text-[0.75rem]">
                <thead>
                  <tr className="text-slate-500 bg-slate-50/50">
                    <th className="px-6 py-3 font-semibold">CLIENT</th>
                    <th className="px-6 py-3 font-semibold">STAGE</th>
                    <th className="px-6 py-3 font-semibold">VALUE</th>
                    <th className="px-6 py-3 font-semibold text-right">ACTION</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-500">V</div>
                        <div>
                          <p className="font-semibold text-[#111827]">Vanguard Group</p>
                          <p className="text-[0.65rem] text-slate-500">vanguard.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-indigo-50 text-indigo-600 font-semibold text-[0.6rem] uppercase tracking-wider">Negotiation</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#111827]">$124,500.00</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-500">L</div>
                        <div>
                          <p className="font-semibold text-[#111827]">Lumitech AI</p>
                          <p className="text-[0.65rem] text-slate-500">lumitech.io</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-emerald-50 text-emerald-600 font-semibold text-[0.6rem] uppercase tracking-wider">Closed Won</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#111827]">$42,000.00</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-50/80 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center font-bold text-slate-500">S</div>
                        <div>
                          <p className="font-semibold text-[#111827]">Solaris Systems</p>
                          <p className="text-[0.65rem] text-slate-500">solaris.systems</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded bg-amber-50 text-amber-600 font-semibold text-[0.6rem] uppercase tracking-wider">Proposal</span>
                    </td>
                    <td className="px-6 py-4 font-bold text-[#111827]">$215,800.00</td>
                    <td className="px-6 py-4 text-right">
                      <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
    </>
  );
}
