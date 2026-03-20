"use client";

import { cn } from "@/lib/utils";
import { formatDistanceToNow, format } from "date-fns";
import {
  Phone, MessageSquare, FileText, CheckSquare, AlertCircle,
  PhoneIncoming, PhoneOutgoing, PhoneMissed, Mail, Clock, Star
} from "lucide-react";

interface ActivityEntry {
  id: string;
  type: string;
  description: string;
  createdAt: string;
  agentId?: string;
  metadata?: any;
}

interface Call {
  id: string;
  callDirection: string;
  status: string;
  durationSeconds: number;
  dispositionId?: string;
  disposition?: { name: string; colorHex: string };
  createdAt: string;
}

interface Note {
  id: string;
  content: string;
  createdAt: string;
}

interface Task {
  id: string;
  title: string;
  status: string;
  dueAt?: string;
  createdAt: string;
}

interface ActivityTimelineProps {
  activities?: ActivityEntry[];
  calls?: Call[];
  notes?: Note[];
  tasks?: Task[];
}

interface TimelineItem {
  id: string;
  ts: Date;
  type: "call" | "note" | "task" | "activity" | "email";
  icon: React.ReactNode;
  color: string;
  title: string;
  sub?: string;
  badge?: string;
  badgeColor?: string;
}

function fmtDuration(secs: number) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}m ${s}s`;
}

export function ActivityTimeline({ activities = [], calls = [], notes = [], tasks = [] }: ActivityTimelineProps) {
  const items: TimelineItem[] = [
    ...calls.map(c => ({
      id: `call-${c.id}`,
      ts: new Date(c.createdAt),
      type: "call" as const,
      icon: c.callDirection === "INBOUND"
        ? <PhoneIncoming size={13} />
        : c.status === "NO_ANSWER" || c.status === "FAILED"
        ? <PhoneMissed size={13} />
        : <PhoneOutgoing size={13} />,
      color: c.status === "COMPLETED" ? "bg-green-500/10 text-green-400 border-green-500/20"
        : c.status === "NO_ANSWER" ? "bg-red-500/10 text-red-400 border-red-500/20"
        : "bg-blue-500/10 text-blue-400 border-blue-500/20",
      title: `${c.callDirection === "INBOUND" ? "Inbound" : "Outbound"} call — ${c.status.replace(/_/g, " ")}`,
      sub: c.durationSeconds > 0 ? `Duration: ${fmtDuration(c.durationSeconds)}` : undefined,
      badge: c.disposition?.name,
      badgeColor: c.disposition?.colorHex,
    })),
    ...notes.map(n => ({
      id: `note-${n.id}`,
      ts: new Date(n.createdAt),
      type: "note" as const,
      icon: <FileText size={13} />,
      color: "bg-amber-500/10 text-amber-400 border-amber-500/20",
      title: "Note added",
      sub: n.content.length > 80 ? n.content.slice(0, 80) + "…" : n.content,
    })),
    ...tasks.map(t => ({
      id: `task-${t.id}`,
      ts: new Date(t.createdAt),
      type: "task" as const,
      icon: <CheckSquare size={13} />,
      color: t.status === "COMPLETED" ? "bg-green-500/10 text-green-400 border-green-500/20" : "bg-violet-500/10 text-violet-400 border-violet-500/20",
      title: t.title,
      sub: t.status === "COMPLETED" ? "Completed" : t.dueAt ? `Due: ${format(new Date(t.dueAt), "dd MMM HH:mm")}` : "Pending",
      badge: t.status,
    })),
    ...activities.map(a => ({
      id: `act-${a.id}`,
      ts: new Date(a.createdAt),
      type: "activity" as const,
      icon: <Clock size={13} />,
      color: "bg-surface-2 text-text-muted border-border",
      title: a.type.replace(/_/g, " "),
      sub: a.description,
    })),
  ].sort((a, b) => b.ts.getTime() - a.ts.getTime());

  if (items.length === 0) {
    return (
      <div className="text-center py-8 text-text-muted text-sm">
        <Clock size={20} className="mx-auto mb-2 opacity-30" />
        <p>No activity yet</p>
      </div>
    );
  }

  return (
    <div className="relative pl-6 space-y-0">
      {/* Vertical line */}
      <div className="absolute left-2.5 top-2 bottom-2 w-px bg-border/50" />

      {items.map((item, idx) => (
        <div key={item.id} className="relative flex items-start gap-3 pb-4 last:pb-0">
          {/* Dot */}
          <div className={cn("absolute -left-3.5 w-7 h-7 rounded-full border flex items-center justify-center shrink-0 z-10", item.color)}>
            {item.icon}
          </div>

          {/* Content */}
          <div className="ml-4 flex-1 min-w-0 pt-0.5">
            <div className="flex items-start justify-between gap-2 flex-wrap">
              <p className="text-xs font-medium leading-tight">{item.title}</p>
              <span className="text-[10px] text-text-muted shrink-0">{formatDistanceToNow(item.ts, { addSuffix: true })}</span>
            </div>
            {item.sub && <p className="text-[11px] text-text-muted mt-0.5 leading-relaxed">{item.sub}</p>}
            {item.badge && (
              <span
                className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded border text-text-muted border-border bg-surface-2"
                style={item.badgeColor ? { borderColor: `${item.badgeColor}40`, color: item.badgeColor } : undefined}
              >
                {item.badge}
              </span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
