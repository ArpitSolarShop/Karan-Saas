"use client";

import { useState } from "react";
import {
  Play, Pause, Square, Zap, Users, Phone,
  Clock, AlertTriangle, ChevronRight
} from "lucide-react";
import useSWR, { mutate } from "swr";
import api, { fetcher } from "@/lib/api";

interface Campaign {
  id: string;
  name: string;
  status: string;
  dialerMode: string;
  description?: string;
  _count?: { leads: number };
}

interface QueueStats {
  dialer: { waiting: number; active: number; completed: number; failed: number };
}

type DialerAction = "start" | "pause" | "stop";

export function CampaignDialerControl() {
  const { data: campaigns } = useSWR<Campaign[]>("/campaigns", fetcher);
  const { data: queueStats } = useSWR<QueueStats>("/jobs/status", fetcher, { refreshInterval: 5000 });
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  async function sendDialerAction(campaignId: string, action: DialerAction) {
    setLoadingId(campaignId);
    try {
      await api.post(`/campaigns/${campaignId}/dialer/${action}`);
      mutate("/campaigns");
    } catch (err) {
      console.error(`[Dialer] ${action} failed:`, err);
    } finally {
      setLoadingId(null);
    }
  }

  const statusColor: Record<string, string> = {
    ACTIVE:   "text-green-400 bg-green-500/10 border-green-500/20",
    PAUSED:   "text-yellow-400 bg-yellow-500/10 border-yellow-500/20",
    COMPLETED:"text-text-muted bg-surface-2 border-border",
    DRAFT:    "text-blue-400 bg-blue-500/10 border-blue-500/20",
    ARCHIVED: "text-text-muted bg-surface-2 border-border",
  };

  return (
    <div className="space-y-4">
      {/* Queue pulse */}
      {queueStats && (
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: "Waiting",   value: queueStats.dialer?.waiting   ?? 0, color: "text-yellow-400" },
            { label: "Active",    value: queueStats.dialer?.active    ?? 0, color: "text-green-400" },
            { label: "Done",      value: queueStats.dialer?.completed ?? 0, color: "text-text-muted" },
            { label: "Failed",    value: queueStats.dialer?.failed    ?? 0, color: "text-red-400" },
          ].map((s) => (
            <div key={s.label} className="bg-surface-2 border border-border rounded-xl p-3 text-center">
              <p className={`text-2xl font-black tabular-nums ${s.color}`}>{s.value}</p>
              <p className="text-[10px] text-text-muted uppercase tracking-widest mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* Campaign rows */}
      <div className="space-y-2">
        {(campaigns || []).map((c) => {
          const isRunning = c.status === "ACTIVE";
          const isPaused  = c.status === "PAUSED";
          const loading   = loadingId === c.id;
          const expanded  = expandedId === c.id;

          return (
            <div
              key={c.id}
              className="bg-surface border border-border rounded-xl overflow-hidden transition-all"
            >
              {/* Row */}
              <div className="flex items-center gap-4 px-5 py-3">
                {/* Status dot */}
                <div className={`h-2 w-2 rounded-full shrink-0 ${isRunning ? "bg-green-400 animate-pulse" : isPaused ? "bg-yellow-400" : "bg-border"}`} />

                {/* Name + mode */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{c.name}</p>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-widest ${statusColor[c.status] ?? "text-text-muted bg-surface-2 border-border"}`}>
                      {c.status}
                    </span>
                    <span className="text-[10px] text-text-muted">{c.dialerMode?.replace("_", " ")}</span>
                    {c._count?.leads && (
                      <span className="text-[10px] text-text-muted flex items-center gap-1">
                        <Users size={9} /> {c._count.leads}
                      </span>
                    )}
                  </div>
                </div>

                {/* Controls */}
                <div className="flex items-center gap-2 shrink-0">
                  {!isRunning && (
                    <button
                      disabled={loading}
                      onClick={() => sendDialerAction(c.id, "start")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-green-500/10 hover:bg-green-500/20 border border-green-500/20 rounded-lg text-[10px] font-bold text-green-400 transition disabled:opacity-50"
                    >
                      {loading ? <div className="w-3 h-3 border-2 border-green-400/30 border-t-green-400 rounded-full animate-spin" /> : <Play size={11} />}
                      Start
                    </button>
                  )}
                  {isRunning && (
                    <button
                      disabled={loading}
                      onClick={() => sendDialerAction(c.id, "pause")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/20 rounded-lg text-[10px] font-bold text-yellow-400 transition disabled:opacity-50"
                    >
                      {loading ? <div className="w-3 h-3 border-2 border-yellow-400/30 border-t-yellow-400 rounded-full animate-spin" /> : <Pause size={11} />}
                      Pause
                    </button>
                  )}
                  {(isRunning || isPaused) && (
                    <button
                      disabled={loading}
                      onClick={() => sendDialerAction(c.id, "stop")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 rounded-lg text-[10px] font-bold text-red-400 transition disabled:opacity-50"
                    >
                      <Square size={11} /> Stop
                    </button>
                  )}
                  <button
                    onClick={() => setExpandedId(expanded ? null : c.id)}
                    className="p-1.5 rounded-md text-text-muted hover:text-foreground transition"
                  >
                    <ChevronRight size={14} className={`transition-transform ${expanded ? "rotate-90" : ""}`} />
                  </button>
                </div>
              </div>

              {/* Expanded details */}
              {expanded && (
                <div className="border-t border-border px-5 py-4 bg-surface-2/50">
                  <p className="text-xs text-text-muted">{c.description || "No description."}</p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                      <Zap size={11} className="text-primary" />
                      Mode: <span className="font-bold text-foreground">{c.dialerMode}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] text-text-muted">
                      <Clock size={11} /> Auto-retry: <span className="font-bold text-foreground">5 min delay</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {(!campaigns || campaigns.length === 0) && (
          <div className="text-center py-12 text-text-muted">
            <Zap size={24} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No campaigns yet. Create one to start dialing.</p>
          </div>
        )}
      </div>
    </div>
  );
}
