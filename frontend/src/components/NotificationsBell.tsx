"use client";

import { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Bell, BellRing, CheckCheck, X, Info, AlertCircle, CheckCircle, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface Notification {
  id: string;
  type: string;
  title: string;
  body?: string;
  isRead: boolean;
  createdAt: string;
  entityType?: string;
  entityId?: string;
}

const TYPE_ICON: Record<string, any> = {
  CALLBACK: <Calendar size={14} className="text-amber-400" />,
  ALERT: <AlertCircle size={14} className="text-red-400" />,
  SUCCESS: <CheckCircle size={14} className="text-green-400" />,
  INFO: <Info size={14} className="text-blue-400" />,
};

export function NotificationsBell({ recipientId }: { recipientId?: string }) {
  const { data: notifications = [] } = useSWR<Notification[]>("/notifications/unread", fetcher, { refreshInterval: 15000 });
  const [open, setOpen] = useState(false);
  const [allData, setAllData] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);
  const unreadCount = notifications.length;

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function openDropdown() {
    setOpen(o => !o);
    if (!open) {
      try {
        const res = await api.get("/notifications");
        setAllData(res.data || res);
      } catch {}
    }
  }

  async function markRead(id: string) {
    await api.patch(`/notifications/${id}/read`);
    mutate("/notifications/unread");
    setAllData(d => d.map(n => n.id === id ? { ...n, isRead: true } : n));
  }

  async function markAllRead() {
    await api.post("/notifications/mark-all-read", {});
    mutate("/notifications/unread");
    setAllData(d => d.map(n => ({ ...n, isRead: true })));
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={openDropdown}
        className={cn(
          "relative p-2 rounded-xl border transition-all",
          open ? "bg-primary/10 border-primary/30" : "bg-surface-2/50 border-border hover:border-border-active"
        )}
      >
        {unreadCount > 0 ? <BellRing size={16} className="text-primary animate-pulse" /> : <Bell size={16} className="text-text-muted" />}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-12 w-80 bg-surface border border-border rounded-2xl shadow-xl shadow-black/30 z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-surface-2/50">
            <span className="text-[11px] font-black uppercase tracking-widest">Notifications</span>
            {allData.some(n => !n.isRead) && (
              <button onClick={markAllRead} className="flex items-center gap-1 text-[10px] text-primary hover:text-primary/80">
                <CheckCheck size={11} /> Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-96 overflow-y-auto divide-y divide-border/50">
            {allData.length === 0 ? (
              <div className="py-8 text-center text-text-muted text-sm">
                <Bell size={20} className="mx-auto mb-2 opacity-30" />
                <p>No notifications yet</p>
              </div>
            ) : (
              allData.map(n => (
                <div
                  key={n.id}
                  onClick={() => !n.isRead && markRead(n.id)}
                  className={cn(
                    "flex items-start gap-3 px-4 py-3 cursor-pointer hover:bg-surface-2/50 transition-colors",
                    !n.isRead && "bg-primary/5 border-l-2 border-l-primary"
                  )}
                >
                  <div className="mt-0.5 shrink-0">{TYPE_ICON[n.type] || <Info size={14} className="text-text-muted" />}</div>
                  <div className="flex-1 min-w-0">
                    <p className={cn("text-xs", !n.isRead ? "font-semibold" : "font-normal")}>{n.title}</p>
                    {n.body && <p className="text-[11px] text-text-muted mt-0.5 truncate">{n.body}</p>}
                    <p className="text-[10px] text-text-muted/60 mt-1">{formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!n.isRead && <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
