"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  MessageSquare, Phone, Mail, Filter, Search, Plus,
  Send, ChevronDown, Circle, CheckCheck
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

interface ThreadMessage {
  id: string;
  direction: "INBOUND" | "OUTBOUND";
  channel: "WHATSAPP" | "EMAIL" | "CALL" | "SMS";
  content: string;
  status: string;
  createdAt: string;
}

interface Thread {
  leadId: string;
  leadName: string;
  phone: string;
  lastMessage: string;
  lastChannel: string;
  lastAt: string;
  unread: number;
  messages?: ThreadMessage[];
}

const CHANNEL_ICON: Record<string, any> = {
  WHATSAPP: <MessageSquare size={12} className="text-green-400" />,
  EMAIL: <Mail size={12} className="text-blue-400" />,
  CALL: <Phone size={12} className="text-violet-400" />,
};

const CHANNEL_COLOR: Record<string, string> = {
  WHATSAPP: "text-green-400",
  EMAIL: "text-blue-400",
  CALL: "text-violet-400",
};

export default function InboxPage() {
  const { data: threads = [], isLoading } = useSWR<Thread[]>("/communications/threads", fetcher);
  const [selected, setSelected] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterChannel, setFilterChannel] = useState<string>("ALL");

  const filtered = threads.filter(t =>
    (search === "" || t.leadName.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search)) &&
    (filterChannel === "ALL" || t.lastChannel === filterChannel)
  );

  async function openThread(thread: Thread) {
    setSelected(thread);
    try {
      const res = await api.get(`/communications/thread/${thread.leadId}`);
      setMessages(res.data || res);
    } catch { setMessages([]); }
  }

  async function send() {
    if (!selected || !msg.trim()) return;
    setSending(true);
    try {
      await api.post("/communications/send", {
        leadId: selected.leadId,
        channel,
        content: msg,
        toNumber: selected.phone,
      });
      setMessages(m => [...m, {
        id: Date.now().toString(), direction: "OUTBOUND", channel,
        content: msg, status: "SENT", createdAt: new Date().toISOString(),
      }]);
      setMsg("");
      mutate("/communications/threads");
    } finally { setSending(false); }
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex h-screen overflow-hidden">
      {/* Sidebar */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-border">
          <h2 className="text-lg font-black uppercase tracking-tight italic">
            Inbox <span className="text-primary not-italic">Unified</span>
          </h2>
          <div className="relative mt-3">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <Input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="pl-8 bg-surface-2 border-border text-sm h-8"
            />
          </div>
          {/* Channel filter */}
          <div className="flex gap-1 mt-2">
            {["ALL", "WHATSAPP", "EMAIL", "CALL"].map(ch => (
              <button
                key={ch}
                onClick={() => setFilterChannel(ch)}
                className={cn(
                  "text-[9px] px-2 py-1 rounded-md font-black uppercase tracking-wider transition",
                  filterChannel === ch ? "bg-primary text-white" : "text-text-muted hover:text-foreground"
                )}
              >
                {ch === "ALL" ? "All" : ch === "WHATSAPP" ? "WA" : ch}
              </button>
            ))}
          </div>
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto divide-y divide-border/50">
          {isLoading ? (
            Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="p-3 space-y-2">
                <div className="h-3 w-2/3 bg-surface-2 rounded animate-pulse" />
                <div className="h-2 w-full bg-surface-2/60 rounded animate-pulse" />
              </div>
            ))
          ) : filtered.length === 0 ? (
            <div className="p-8 text-center text-text-muted text-sm">
              <MessageSquare size={20} className="mx-auto mb-2 opacity-30" />
              <p>No conversations yet</p>
            </div>
          ) : (
            filtered.map(t => (
              <button
                key={t.leadId}
                onClick={() => openThread(t)}
                className={cn(
                  "w-full text-left p-3 hover:bg-surface-2/50 transition-colors",
                  selected?.leadId === t.leadId && "bg-primary/5 border-l-2 border-l-primary"
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-[11px] font-black text-primary shrink-0">
                      {t.leadName[0]}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{t.leadName}</p>
                      <p className="text-[10px] text-text-muted font-mono">{t.phone}</p>
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-text-muted">{format(new Date(t.lastAt), "HH:mm")}</p>
                    {t.unread > 0 && (
                      <span className="inline-flex w-4 h-4 rounded-full bg-primary text-white text-[9px] items-center justify-center mt-0.5">{t.unread}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 pl-10">
                  {CHANNEL_ICON[t.lastChannel]}
                  <p className="text-[11px] text-text-muted truncate">{t.lastMessage}</p>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat area */}
      <div className="flex-1 flex flex-col">
        {!selected ? (
          <div className="flex-1 flex flex-col items-center justify-center text-text-muted gap-3">
            <MessageSquare size={40} className="opacity-20" />
            <p className="text-sm">Select a conversation to open</p>
          </div>
        ) : (
          <>
            {/* Thread header */}
            <div className="px-4 py-3 border-b border-border flex items-center justify-between bg-surface-2/30">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-sm font-black text-primary">
                  {selected.leadName[0]}
                </div>
                <div>
                  <p className="font-semibold text-sm">{selected.leadName}</p>
                  <p className="text-[11px] text-text-muted font-mono">{selected.phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-primary transition">
                  <Phone size={14} />
                </button>
                <button className="p-2 rounded-lg bg-surface hover:bg-surface-2 border border-border text-text-muted hover:text-primary transition">
                  <Mail size={14} />
                </button>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {messages.length === 0 ? (
                <div className="text-center text-text-muted text-sm py-8">
                  <Circle size={20} className="mx-auto mb-2 opacity-20" />
                  <p>No messages yet</p>
                </div>
              ) : (
                messages.map(m => (
                  <div key={m.id} className={cn("flex", m.direction === "OUTBOUND" ? "justify-end" : "justify-start")}>
                    <div className={cn(
                      "max-w-xs rounded-2xl px-3 py-2 text-xs",
                      m.direction === "OUTBOUND"
                        ? "bg-primary text-white rounded-br-sm"
                        : "bg-surface-2 text-foreground border border-border rounded-bl-sm"
                    )}>
                      <div className="flex items-center gap-1.5 mb-1">
                        {CHANNEL_ICON[m.channel]}
                        <span className={cn("text-[9px] font-bold uppercase", m.direction === "OUTBOUND" ? "text-white/70" : CHANNEL_COLOR[m.channel])}>{m.channel}</span>
                      </div>
                      <p className="leading-relaxed">{m.content}</p>
                      <p className={cn("text-[9px] mt-1 text-right", m.direction === "OUTBOUND" ? "text-white/50" : "text-text-muted")}>
                        {format(new Date(m.createdAt), "HH:mm")}
                        {m.direction === "OUTBOUND" && <CheckCheck size={9} className="inline ml-1" />}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Compose */}
            <div className="p-3 border-t border-border bg-surface-2/30">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] text-text-muted font-bold uppercase tracking-wider">Send via:</span>
                {(["WHATSAPP", "EMAIL"] as const).map(ch => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={cn(
                      "flex items-center gap-1 px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider border transition",
                      channel === ch ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-text-muted hover:text-foreground"
                    )}
                  >
                    {CHANNEL_ICON[ch]} {ch}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  value={msg}
                  onChange={e => setMsg(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
                  placeholder={`Type a ${channel === "WHATSAPP" ? "WhatsApp" : "email"} message…`}
                  className="flex-1 bg-surface border-border text-sm"
                />
                <Button onClick={send} disabled={sending || !msg.trim()} size="sm" className="bg-primary text-white px-4">
                  <Send size={14} />
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
