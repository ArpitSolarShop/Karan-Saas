"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Download, BarChart2, PieChart, PhoneMissed, TrendingUp, RefreshCw } from "lucide-react";
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, LineChart, Line,
  PieChart as RechartsPie, Pie, Cell, Legend, CartesianGrid
} from "recharts";

const TABS = [
  { id: "overview", label: "Overview", icon: BarChart2 },
  { id: "disposition", label: "Disposition", icon: PieChart },
  { id: "hourly", label: "Hourly", icon: TrendingUp },
  { id: "missed", label: "Missed Calls", icon: PhoneMissed },
  { id: "agents", label: "Agents", icon: BarChart2 },
];

const PIE_COLORS = ["#7c3aed", "#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#06b6d4"];

function MetricCard({ label, value, sub, color = "text-foreground" }: { label: string; value: any; sub?: string; color?: string }) {
  return (
    <div className="bg-surface border border-border rounded-2xl p-4">
      <p className="text-[10px] uppercase tracking-widest text-text-muted font-black mb-1">{label}</p>
      <p className={cn("text-3xl font-black tabular-nums", color)}>{value ?? "—"}</p>
      {sub && <p className="text-[11px] text-text-muted mt-0.5">{sub}</p>}
    </div>
  );
}

export default function ReportsPage() {
  const [tab, setTab] = useState("overview");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  const query = `?from=${dateFrom}&to=${dateTo}`;

  const { data: funnel } = useSWR("/reports/lead-funnel", fetcher);
  const { data: daily = [] } = useSWR(`/reports/daily-call-volume${query}`, fetcher);
  const { data: disposition = [] } = useSWR(`/reports/disposition${query}`, fetcher);
  const { data: hourly = [] } = useSWR(`/reports/hourly${query}`, fetcher);
  const { data: missed } = useSWR(`/reports/missed-calls${query}`, fetcher);
  const { data: agents = [] } = useSWR(`/reports/agent-performance${query}`, fetcher);

  function download(path: string, filename: string) {
    const token = localStorage.getItem("crm_token");
    fetch(`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"}${path}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.blob())
      .then(blob => {
        const url = URL.createObjectURL(blob);
        Object.assign(document.createElement("a"), { href: url, download: filename }).click();
        URL.revokeObjectURL(url);
      });
  }

  const totalCalls = (daily as any[]).reduce((s, d) => s + (d.total || 0), 0);
  const completedCalls = (daily as any[]).reduce((s, d) => s + (d.completed || 0), 0);
  const funnelData = funnel ? Object.entries(funnel.funnel || {}).map(([name, value]) => ({ name, value })) : [];

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Reports <span className="text-primary not-italic">& Analytics</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">Real-time insights across calls, dispositions, and agent performance</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs" />
          <span className="text-text-muted text-xs">to</span>
          <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} className="bg-surface border border-border rounded-lg px-3 py-1.5 text-xs" />
          <button
            onClick={() => download(`/reports/export/calls${query}`, "calls.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs hover:border-primary/30 transition"
          >
            <Download size={12} /> Export Calls
          </button>
          <button
            onClick={() => download(`/leads/export`, "leads.csv")}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/10 border border-primary/20 text-primary rounded-lg text-xs hover:bg-primary/20 transition"
          >
            <Download size={12} /> Export Leads
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-surface-2/50 p-1 rounded-xl border border-border w-fit flex-wrap">
        {TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all",
              tab === t.id ? "bg-primary text-white" : "text-text-muted hover:text-foreground"
            )}
          >
            <t.icon size={11} /> {t.label}
          </button>
        ))}
      </div>

      {/* Overview */}
      {tab === "overview" && (
        <div className="space-y-6">
          {/* KPI cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <MetricCard label="Total Calls" value={totalCalls} color="text-primary" />
            <MetricCard label="Answered" value={completedCalls} sub={`${totalCalls ? ((completedCalls / totalCalls) * 100).toFixed(0) : 0}% answer rate`} color="text-green-400" />
            <MetricCard label="Missed / Failed" value={missed?.total ?? "—"} color="text-red-400" />
            <MetricCard label="Total Leads" value={funnel?.total ?? "—"} />
          </div>

          {/* Daily call volume chart */}
          <div className="bg-surface border border-border rounded-2xl p-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-4">Daily Call Volume (30 days)</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={daily as any[]}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#888" }} tickFormatter={d => d?.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: "#888" }} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Total" />
                <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Answered" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Lead funnel */}
          <div className="bg-surface border border-border rounded-2xl p-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-4">Lead Funnel</h3>
            <ResponsiveContainer width="100%" height={180}>
              <BarChart data={funnelData} layout="vertical">
                <XAxis type="number" tick={{ fontSize: 10, fill: "#888" }} />
                <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#888" }} width={100} />
                <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 8, fontSize: 11 }} />
                <Bar dataKey="value" fill="#7c3aed" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Disposition chart */}
      {tab === "disposition" && (
        <div className="space-y-6">
          <div className="bg-surface border border-border rounded-2xl p-6">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-4">Disposition Breakdown</h3>
            {(disposition as any[]).length === 0 ? (
              <p className="text-text-muted text-sm text-center py-12">No disposition data available</p>
            ) : (
              <div className="flex flex-col md:flex-row gap-6 items-center">
                <ResponsiveContainer width="100%" height={280}>
                  <RechartsPie>
                    <Pie 
                      data={disposition as any[]} 
                      dataKey="count" 
                      nameKey="name" 
                      cx="50%" 
                      cy="50%" 
                      outerRadius={110} 
                      label={(props: any) => `${props.name} ${((props.percent || 0) * 100).toFixed(0)}%`} 
                      labelLine
                    >
                      {(disposition as any[]).map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 8, fontSize: 11 }} />
                    <Legend />
                  </RechartsPie>
                </ResponsiveContainer>
                <div className="w-full md:w-64 space-y-2">
                  {(disposition as any[]).map((d: any, i: number) => (
                    <div key={d.code} className="flex items-center justify-between px-3 py-2 rounded-xl bg-surface-2/50 border border-border/50">
                      <div className="flex items-center gap-2">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                        <span className="text-xs">{d.name}</span>
                      </div>
                      <span className="text-sm font-black tabular-nums">{d.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Hourly breakdown */}
      {tab === "hourly" && (
        <div className="bg-surface border border-border rounded-2xl p-6">
          <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-4">Calls by Hour of Day</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={hourly as any[]}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="hour" tick={{ fontSize: 10, fill: "#888" }} tickFormatter={h => `${h}:00`} />
              <YAxis tick={{ fontSize: 10, fill: "#888" }} />
              <Tooltip contentStyle={{ background: "#1a1a2e", border: "1px solid #2a2a4e", borderRadius: 8, fontSize: 11 }} labelFormatter={h => `${h}:00`} />
              <Bar dataKey="total" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Total Calls" />
              <Bar dataKey="completed" fill="#10b981" radius={[4, 4, 0, 0]} name="Answered" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-[10px] text-text-muted mt-3 text-center">Use this to schedule peak calling hours for maximum answer rates</p>
        </div>
      )}

      {/* Missed calls */}
      {tab === "missed" && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-2xl font-black text-red-400">{missed?.total ?? 0}</p>
              <p className="text-xs text-text-muted">missed / failed / busy calls</p>
            </div>
            <button onClick={() => download(`/reports/export/calls${query}&status=NO_ANSWER`, "missed-calls.csv")} className="flex items-center gap-1.5 px-3 py-1.5 bg-surface border border-border rounded-lg text-xs hover:border-primary/30 transition">
              <Download size={12} /> Export
            </button>
          </div>
          <div className="rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-surface-2/50 border-b border-border">
                <tr>
                  {["Lead", "Phone", "Agent", "Status", "Time"].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {(missed?.calls || []).slice(0, 100).map((c: any) => (
                  <tr key={c.id} className="border-b border-border/30 hover:bg-surface-2/20 transition-colors">
                    <td className="px-4 py-3 text-xs">{c.lead?.name || c.lead?.firstName || "—"}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted font-mono">{c.lead?.phone}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{c.agent?.firstName}</td>
                    <td className="px-4 py-3">
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-red-500/10 text-red-400 border border-red-500/20">{c.status}</span>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{new Date(c.createdAt).toLocaleString("en-IN", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" })}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Agent performance */}
      {tab === "agents" && (
        <div className="rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-surface-2/50 border-b border-border">
              <tr>
                {["Agent", "Total Calls", "Answered", "Answer Rate", "Avg Talk Time", "Leads", "Converted", "Conv Rate"].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {(agents as any[]).map(a => (
                <tr key={a.agent.id} className="border-b border-border/30 hover:bg-surface-2/20 transition-colors">
                  <td className="px-4 py-3 font-medium text-xs">{a.agent.name}</td>
                  <td className="px-4 py-3 text-xs tabular-nums">{a.metrics.totalCalls}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-green-400">{a.metrics.completedCalls}</td>
                  <td className="px-4 py-3 text-xs">{a.metrics.answerRate}</td>
                  <td className="px-4 py-3 text-xs text-text-muted">{Math.floor(a.metrics.avgTalkTime / 60)}m {a.metrics.avgTalkTime % 60}s</td>
                  <td className="px-4 py-3 text-xs tabular-nums">{a.metrics.assignedLeads}</td>
                  <td className="px-4 py-3 text-xs tabular-nums text-primary">{a.metrics.convertedLeads}</td>
                  <td className="px-4 py-3 text-xs">{a.metrics.conversionRate}</td>
                </tr>
              ))}
              {agents.length === 0 && (
                <tr><td colSpan={8} className="text-center py-12 text-text-muted text-sm">No agent data</td></tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
