"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import { useAgentStore, AgentPresence } from "@/stores/useAgentStore";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  Activity, Shield, Phone, Zap, AlertTriangle, Radio, Users,
  Headphones, Mic, PhoneOff, Eye
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { CampaignDialerControl } from "@/components/telecalling/CampaignDialerControl";

const STATUS_COLOR: Record<string, string> = {
  AVAILABLE:  "bg-green-500/20 text-green-400 border-green-500/20",
  ON_CALL:    "bg-primary/20 text-primary border-primary/20",
  WRAP_UP:    "bg-yellow-500/20 text-yellow-400 border-yellow-500/20",
  BREAK:      "bg-orange-500/20 text-orange-400 border-orange-500/20",
  OFFLINE:    "bg-surface-2 text-text-muted border-border",
};

function AgentLiveRow({ agent }: { agent: AgentPresence }) {
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  async function supervisorAction(action: "whisper" | "barge" | "hangup") {
    if (!agent.currentLeadId) return;
    setActionLoading(action);
    try {
      // We need the callUUID — stored in agent presence as callSid (set by useRealtimeState)
      const callUUID = (agent as any).callSid || agent.id;
      if (action === "hangup") {
        await api.post("/telephony/hangup", { callUUID });
      } else if (action === "whisper") {
        await api.post("/telephony/whisper", { callUUID, supervisorExtension: "supervisor" });
      } else if (action === "barge") {
        await api.post("/telephony/barge", { callUUID, supervisorExtension: "supervisor" });
      }
    } catch (err) {
      console.error(`[Supervisor] ${action} failed:`, err);
    } finally {
      setActionLoading(null);
    }
  }

  const onCall = agent.status === "ON_CALL";
  const initials = agent.name
    ? agent.name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2)
    : agent.id.slice(0, 2).toUpperCase();

  // Duration since call started
  const callDuration = agent.callStartedAt
    ? Math.floor((Date.now() - new Date(agent.callStartedAt).getTime()) / 1000)
    : 0;
  const mins = String(Math.floor(callDuration / 60)).padStart(2, "0");
  const secs = String(callDuration % 60).padStart(2, "0");

  return (
    <tr className={cn(
      "border-b border-border/50 transition-colors",
      onCall ? "bg-primary/[0.02] hover:bg-primary/[0.04]" : "hover:bg-surface-2/30"
    )}>
      {/* Agent */}
      <td className="px-4 py-3">
        <div className="flex items-center gap-3">
          <div className="h-7 w-7 rounded-full bg-primary/20 border border-primary/20 flex items-center justify-center shrink-0">
            <span className="text-primary text-[10px] font-black">{initials}</span>
          </div>
          <div>
            <p className="text-xs font-bold">{agent.name || `Agent #${agent.id.slice(0, 6)}`}</p>
            {agent.extension && <p className="text-[10px] text-text-muted">Ext. {agent.extension}</p>}
          </div>
        </div>
      </td>

      {/* Status */}
      <td className="px-4 py-3">
        <span className={cn(
          "text-[9px] font-black px-2 py-0.5 uppercase rounded border tracking-widest",
          STATUS_COLOR[agent.status] ?? STATUS_COLOR.OFFLINE
        )}>
          {agent.status.replace("_", " ")}
        </span>
      </td>

      {/* Current Lead */}
      <td className="px-4 py-3">
        {agent.currentLeadName ? (
          <div>
            <p className="text-xs font-medium truncate max-w-[120px]">{agent.currentLeadName}</p>
          </div>
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </td>

      {/* Duration */}
      <td className="px-4 py-3">
        {onCall ? (
          <span className="text-xs font-mono text-primary animate-pulse">{mins}:{secs}</span>
        ) : (
          <span className="text-[11px] text-text-muted">—</span>
        )}
      </td>

      {/* Supervisor Actions */}
      <td className="px-4 py-3">
        {onCall ? (
          <div className="flex items-center gap-1.5">
            <button
              disabled={!!actionLoading}
              onClick={() => supervisorAction("whisper")}
              title="Whisper — speak to agent only"
              className="p-1.5 rounded-md bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/20 text-blue-400 transition disabled:opacity-50"
            >
              {actionLoading === "whisper"
                ? <div className="w-3 h-3 border border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
                : <Headphones size={12} />}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={() => supervisorAction("barge")}
              title="Barge — join call as 3-way"
              className="p-1.5 rounded-md bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 text-yellow-400 transition disabled:opacity-50"
            >
              {actionLoading === "barge"
                ? <div className="w-3 h-3 border border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" />
                : <Mic size={12} />}
            </button>
            <button
              disabled={!!actionLoading}
              onClick={() => supervisorAction("hangup")}
              title="Force hangup"
              className="p-1.5 rounded-md bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 transition disabled:opacity-50"
            >
              {actionLoading === "hangup"
                ? <div className="w-3 h-3 border border-red-400/30 border-t-red-400 rounded-full animate-spin" />
                : <PhoneOff size={12} />}
            </button>
          </div>
        ) : (
          <span className="text-[11px] text-text-muted">No active call</span>
        )}
      </td>
    </tr>
  );
}

export default function SupervisorDashboard() {
  const { data: agentPerformance } = useSWR("/reports/agent-performance", fetcher);
  const { data: leadFunnel } = useSWR("/reports/lead-funnel", fetcher);
  const { agentsOnline, setAgentsOnline, updateAgentPresence, removeAgent } = useAgentStore();
  const [activeTab, setActiveTab] = useState<"agents" | "dialer">("agents");

  // Subscribe to real-time events
  useRealtimeSocket({
    agentStatusChanged:  (data: any) => { updateAgentPresence({ id: data.agentId, name: data.name ?? "", status: data.status, currentLeadId: data.leadId, currentLeadName: data.leadName, callStartedAt: data.callStartedAt }); mutate("/reports/agent-performance"); },
    callStarted:         (data: any) => { updateAgentPresence({ id: data.agentId, name: data.agentName ?? "", status: "ON_CALL", currentLeadId: data.leadId, currentLeadName: data.leadName, callStartedAt: new Date(), callSid: data.callSid } as any); mutate("/reports/agent-performance"); },
    callEnded:           (data: any) => { updateAgentPresence({ id: data.agentId, name: "", status: "WRAP_UP" }); mutate("/reports/agent-performance"); },
    agentDisconnected:   (data: any) => { removeAgent(data.agentId); },
    leadFunnelUpdated:   () =>          mutate("/reports/lead-funnel"),
    sheetUpdated:        () =>          mutate("/reports/lead-funnel"),
  });

  const liveAgents  = agentsOnline.filter((a) => a.status !== "OFFLINE").length;
  const onCallCount = agentsOnline.filter((a) => a.status === "ON_CALL").length;

  const stats = [
    { label: "Live Agents",   value: liveAgents  || agentsOnline.length || "—", trend: "", icon: Users },
    { label: "Live Calls",    value: onCallCount || "—",               trend: "PEAK",  icon: Phone },
    { label: "Queue Length",  value: "—",                                trend: "",      icon: Radio },
    { label: "Conversion",    value: "4.2%",                            trend: "+0.8%", icon: Zap   },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground font-sans p-6 space-y-8 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 border-b border-border pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Shield size={16} className="text-primary" />
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-text-muted">Real-time Intelligence</span>
          </div>
          <h1 className="text-5xl font-black tracking-tighter uppercase italic">
            Supervisor <span className="not-italic text-primary">Command</span>
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-success/10 border border-success/20 px-4 py-2 rounded-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-success animate-ping" />
            <span className="text-[10px] font-black tracking-widest uppercase text-success">FreeSWITCH: Live</span>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <Card key={i} className="bg-surface border-border group hover:border-primary/40 transition-all overflow-hidden relative">
            <div className="absolute top-0 right-0 h-16 w-16 bg-primary/5 rounded-full -translate-y-8 translate-x-8 group-hover:bg-primary/10 transition-colors" />
            <CardContent className="p-5 relative">
              <div className="flex justify-between items-start mb-4">
                <p className="text-[9px] font-black text-text-muted uppercase tracking-widest">{s.label}</p>
                <div className="h-8 w-8 rounded-lg bg-surface-2 border border-border flex items-center justify-center">
                  <s.icon size={14} className="text-primary" />
                </div>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-black tabular-nums">{s.value}</span>
                {s.trend && <span className="text-[10px] font-bold text-success">{s.trend}</span>}
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-primary rounded-full animate-pulse" />
                <span className="text-[9px] font-bold uppercase tracking-widest text-text-muted">Live</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tab switcher */}
      <div className="flex gap-1 bg-surface-2/50 p-1 rounded-lg border border-border w-fit">
        {(["agents", "dialer"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-4 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-md transition-all",
              activeTab === tab ? "bg-primary text-white shadow-sm" : "text-text-muted hover:text-foreground"
            )}
          >
            {tab === "agents" ? "🟢 Agent Live Board" : "📞 Dialer Control"}
          </button>
        ))}
      </div>

      {/* Agents tab */}
      {activeTab === "agents" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Agent Table */}
          <div className="lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-black uppercase tracking-tight flex items-center gap-2">
                <Activity size={16} className="text-primary" /> Agent Live Board
              </h2>
              <span className="text-[10px] text-text-muted">{agentsOnline.length} agent(s) connected</span>
            </div>
            <Card className="bg-surface border-border overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-surface-2 border-b border-border">
                      {["Agent", "Status", "Current Lead", "Duration", "Actions"].map((c) => (
                        <th key={c} className="px-4 py-3 text-[9px] font-black uppercase tracking-widest text-text-muted italic">{c}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {agentsOnline.length > 0
                      ? agentsOnline.map((agent) => <AgentLiveRow key={agent.id} agent={agent} />)
                      : Array.from({ length: 6 }).map((_, i) => (
                          // Skeleton rows while waiting for agents to connect
                          <tr key={i} className="border-b border-border/30">
                            {Array.from({ length: 5 }).map((_, j) => (
                              <td key={j} className="px-4 py-3">
                                <div className="h-3 rounded bg-surface-2 animate-pulse" style={{ width: j === 0 ? "80px" : j === 4 ? "100px" : "60px" }} />
                              </td>
                            ))}
                          </tr>
                        ))}
                  </tbody>
                </table>
              </div>
              {agentsOnline.length === 0 && (
                <div className="text-center py-6 border-t border-border/30">
                  <Eye size={20} className="mx-auto mb-2 text-text-muted opacity-40" />
                  <p className="text-xs text-text-muted">Waiting for agents to connect…</p>
                </div>
              )}
            </Card>
          </div>

          {/* Right panel */}
          <div className="space-y-6">
            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2">
                  <Radio size={12} className="text-primary" /> Live Call Distribution
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-40">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={leadFunnel || []}>
                      <Bar dataKey="count" fill="#6366F1" radius={[3, 3, 0, 0]} />
                      <XAxis dataKey="status" hide />
                      <Tooltip
                        cursor={{ fill: "rgba(99,102,241,0.05)" }}
                        contentStyle={{ background: "#18181B", border: "1px solid #3F3F46", borderRadius: "8px", color: "#F4F4F5", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase" }}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                <Separator className="my-4 bg-border" />
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase">Active</p>
                    <p className="text-2xl font-black">{onCallCount}</p>
                  </div>
                  <div>
                    <p className="text-[9px] font-black text-text-muted uppercase">Available</p>
                    <p className="text-2xl font-black text-green-400">{agentsOnline.filter((a) => a.status === "AVAILABLE").length}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Supervisor legend */}
            <Card className="bg-surface border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-black uppercase tracking-[0.2em]">Action Guide</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { icon: <Headphones size={13} className="text-blue-400" />, label: "Whisper", desc: "Only agent hears you" },
                  { icon: <Mic size={13} className="text-yellow-400" />, label: "Barge", desc: "Full 3-way join" },
                  { icon: <PhoneOff size={13} className="text-red-400" />, label: "Hangup", desc: "Force end call" },
                ].map((item) => (
                  <div key={item.label} className="flex items-center gap-3">
                    <div className="h-7 w-7 rounded-lg bg-surface-2 border border-border flex items-center justify-center shrink-0">{item.icon}</div>
                    <div>
                      <p className="text-xs font-bold">{item.label}</p>
                      <p className="text-[10px] text-text-muted">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* Dialer Control tab */}
      {activeTab === "dialer" && (
        <div>
          <div className="flex items-center gap-2 mb-6">
            <Phone size={16} className="text-primary" />
            <h2 className="text-lg font-black uppercase tracking-tight">Campaign Dialer Control</h2>
          </div>
          <CampaignDialerControl />
        </div>
      )}
    </div>
  );
}
