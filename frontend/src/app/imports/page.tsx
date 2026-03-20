"use client";

import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { Upload, CheckCircle, XCircle, Clock, FileText, AlertCircle } from "lucide-react";

interface LeadList {
  id: string;
  name?: string;
  filename: string;
  status: string;
  totalRows: number;
  importedRows: number;
  failedRows: number;
  errors?: any[];
  campaignId?: string;
  campaign?: { name: string };
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { color: string; icon: any; label: string }> = {
  PENDING:    { color: "bg-amber-500/10 text-amber-400 border-amber-500/20", icon: Clock, label: "Pending" },
  PROCESSING: { color: "bg-blue-500/10 text-blue-400 border-blue-500/20", icon: Clock, label: "Processing" },
  COMPLETED:  { color: "bg-green-500/10 text-green-400 border-green-500/20", icon: CheckCircle, label: "Done" },
  FAILED:     { color: "bg-red-500/10 text-red-400 border-red-500/20", icon: XCircle, label: "Failed" },
  PARTIAL:    { color: "bg-orange-500/10 text-orange-400 border-orange-500/20", icon: AlertCircle, label: "Partial" },
};

export default function ImportHistoryPage() {
  const { data: lists = [], isLoading } = useSWR<LeadList[]>("/leads/import-history", fetcher);

  const totalImported = lists.reduce((s, l) => s + (l.importedRows || 0), 0);
  const totalFailed = lists.reduce((s, l) => s + (l.failedRows || 0), 0);

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Import <span className="text-primary not-italic">History</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{lists.length} import batches · {totalImported.toLocaleString()} leads imported</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Batches", value: lists.length, color: "text-foreground" },
          { label: "Leads Imported", value: totalImported.toLocaleString(), color: "text-green-400" },
          { label: "Failed Rows", value: totalFailed.toLocaleString(), color: "text-red-400" },
          { label: "Success Rate", value: (totalImported + totalFailed > 0 ? ((totalImported / (totalImported + totalFailed)) * 100).toFixed(1) : 100) + "%", color: "text-primary" },
        ].map(s => (
          <div key={s.label} className="bg-surface border border-border rounded-2xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-black mb-1">{s.label}</p>
            <p className={cn("text-2xl font-black", s.color)}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 border-b border-border">
            <tr>
              {["File / Name", "Campaign", "Status", "Imported", "Failed", "Date"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 6 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : lists.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-16 text-text-muted">
                  <Upload size={24} className="mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No imports yet. Go to Leads → Import to upload a CSV.</p>
                </td>
              </tr>
            ) : (
              lists.map(l => {
                const cfg = STATUS_CONFIG[l.status] || STATUS_CONFIG.PENDING;
                const Icon = cfg.icon;
                const pct = l.totalRows > 0 ? Math.round((l.importedRows / l.totalRows) * 100) : 0;
                return (
                  <tr key={l.id} className="border-b border-border/30 hover:bg-surface-2/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <FileText size={13} className="text-text-muted shrink-0" />
                        <div>
                          <p className="text-xs font-medium">{l.name || l.filename}</p>
                          {l.name && <p className="text-[10px] text-text-muted font-mono">{l.filename}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-[11px] text-text-muted">{l.campaign?.name || "—"}</td>
                    <td className="px-4 py-3">
                      <span className={cn("flex items-center gap-1 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border w-fit", cfg.color)}>
                        <Icon size={9} /> {cfg.label}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <span className="text-xs font-bold text-green-400">{l.importedRows}</span>
                        <span className="text-text-muted text-[10px]"> / {l.totalRows}</span>
                      </div>
                      <div className="w-20 h-1 bg-surface-2 rounded-full mt-1">
                        <div className="h-1 bg-green-400 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </td>
                    <td className="px-4 py-3 text-xs text-red-400 font-medium">{l.failedRows || 0}</td>
                    <td className="px-4 py-3 text-[11px] text-text-muted whitespace-nowrap">
                      {format(new Date(l.createdAt), "dd MMM yyyy HH:mm")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
