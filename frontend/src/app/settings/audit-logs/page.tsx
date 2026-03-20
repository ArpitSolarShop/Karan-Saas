"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Shield, User, Clock, RefreshCw } from "lucide-react";

interface AuditLog {
  id: string;
  userId?: string;
  user?: { firstName: string; email: string };
  entityType: string;
  entityId: string;
  action: string;
  oldValues?: any;
  newValues?: any;
  createdAt: string;
  tenantId: string;
}

const ACTION_COLOR: Record<string, string> = {
  CREATE: "bg-green-500/10 text-green-400 border-green-500/20",
  UPDATE: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  DELETE: "bg-red-500/10 text-red-400 border-red-500/20",
  LOGIN: "bg-violet-500/10 text-violet-400 border-violet-500/20",
};

export default function AuditLogsPage() {
  const { data: logs = [], isLoading, mutate } = useSWR<AuditLog[]>("/audit-logs", fetcher);

  function formatTime(ts: string) {
    return new Date(ts).toLocaleString("en-IN", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Audit <span className="text-primary not-italic">Logs</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{logs.length} actions logged</p>
        </div>
        <button onClick={() => mutate()} className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-surface hover:bg-surface-2 text-sm transition">
          <RefreshCw size={13} /> Refresh
        </button>
      </div>

      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 border-b border-border">
            <tr>
              {["Time", "User", "Action", "Entity", "Entity ID", "Changes"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 8 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-text-muted">
                  <Shield size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No audit log entries yet</p>
                </td>
              </tr>
            ) : (
              logs.slice(0, 200).map(log => (
                <tr key={log.id} className="border-b border-border/30 hover:bg-surface-2/20 transition-colors">
                  <td className="px-4 py-3 text-[11px] text-text-muted whitespace-nowrap">{formatTime(log.createdAt)}</td>
                  <td className="px-4 py-3">
                    {log.user ? (
                      <div className="flex items-center gap-1.5">
                        <User size={11} className="text-text-muted" />
                        <span className="text-[11px]">{log.user.firstName}</span>
                      </div>
                    ) : (
                      <span className="text-[11px] text-text-muted">System</span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border tracking-wider", ACTION_COLOR[log.action] || "bg-surface-2 text-text-muted border-border")}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-text-muted">{log.entityType}</td>
                  <td className="px-4 py-3 text-[10px] text-text-muted font-mono truncate max-w-28" title={log.entityId}>{log.entityId.slice(0, 12)}…</td>
                  <td className="px-4 py-3">
                    {(log.newValues || log.oldValues) ? (
                      <details className="cursor-pointer">
                        <summary className="text-[10px] text-primary hover:text-primary/80 list-none">View diff</summary>
                        <pre className="text-[9px] text-text-muted mt-1 max-w-xs overflow-x-auto bg-surface-2 rounded p-1">
                          {JSON.stringify(log.newValues || log.oldValues, null, 2).slice(0, 300)}
                        </pre>
                      </details>
                    ) : <span className="text-text-muted text-[11px]">—</span>}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
