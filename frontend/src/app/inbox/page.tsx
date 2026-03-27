"use client";

import { useState, useRef, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  Search, MoreVertical, Phone, Video, Paperclip, Smile,
  Mic, Send, CheckCheck, Check, X, Info, MessageSquare,
  Mail, Circle, ArrowLeft,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────
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
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

const AVATAR_PALETTE = [
  "#6366f1", "#8b5cf6", "#ec4899", "#14b8a6",
  "#f59e0b", "#10b981", "#3b82f6", "#ef4444",
];
function avatarColor(name: string) {
  let h = 0;
  for (let i = 0; i < name.length; i++) h = (h * 31 + name.charCodeAt(i)) & 0xffffffff;
  return AVATAR_PALETTE[Math.abs(h) % AVATAR_PALETTE.length];
}

// ─── Bubble Tail SVG ──────────────────────────────────────────────────────────
// Sent  = right tail, filled with primary indigo
// Received = left tail, filled with surface-2
function BubbleTail({ isSent }: { isSent: boolean }) {
  return (
    <svg
      viewBox="0 0 8 13" width="8" height="13"
      className="absolute top-0"
      style={{ [isSent ? "right" : "left"]: -7 }}
    >
      {isSent ? (
        <path fill="#4f46e5" d="M5.188 0H0v11.193l6.467-8.625C7.526 1.156 6.958 0 5.188 0z" />
      ) : (
        <path fill="#27272a" d="M2.812 0H8v11.193L1.533 2.568C.474 1.156 1.042 0 2.812 0z" />
      )}
    </svg>
  );
}

// ─── Main ─────────────────────────────────────────────────────────────────────
export default function InboxPage() {
  const { data: threads = [], isLoading } = useSWR<Thread[]>("/communications/threads", fetcher, { refreshInterval: 5000 });
  const [selected, setSelected] = useState<Thread | null>(null);
  const [messages, setMessages] = useState<ThreadMessage[]>([]);
  const [msg, setMsg] = useState("");
  const [channel, setChannel] = useState<"WHATSAPP" | "EMAIL">("WHATSAPP");
  const [sending, setSending] = useState(false);
  const [search, setSearch] = useState("");
  const [filterChip, setFilterChip] = useState("All");
  const [isTyping, setIsTyping] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const filtered = threads.filter((t) =>
    search === "" || t.leadName.toLowerCase().includes(search.toLowerCase()) || t.phone.includes(search)
  );

  async function openThread(thread: Thread) {
    setSelected(thread);
    setShowInfo(false);
    try {
      const res = await api.get(`/communications/thread/${thread.leadId}`);
      setMessages(res.data || []);
    } catch {
      setMessages([]);
    }
  }

  async function send() {
    if (!selected || !msg.trim()) return;
    const text = msg.trim();
    setMsg("");
    setSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "44px";

    const optimistic: ThreadMessage = {
      id: Date.now().toString(),
      direction: "OUTBOUND",
      channel,
      content: text,
      status: "SENT",
      createdAt: new Date().toISOString(),
    };
    setMessages((m) => [...m, optimistic]);

    try {
      await api.post("/communications/send", {
        leadId: selected.leadId,
        channel,
        content: text,
        toNumber: selected.phone,
      });
      mutate("/communications/threads");
    } finally {
      setSending(false);
    }
  }

  function autoResize() {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  }

  return (
    <div className="flex h-screen overflow-hidden bg-background text-foreground">
      {/* Global animation */}
      <style>{`
        @keyframes typingBounce {
          0%, 100% { transform: translateY(0); opacity: 0.5; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>

      {/* ── SIDEBAR ─────────────────────────────────────────────── */}
      <aside className="flex flex-col shrink-0 border-r border-border bg-card" style={{ width: 320 }}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="text-base font-black uppercase tracking-tight italic">
            Inbox <span className="text-primary not-italic">Unified</span>
          </h2>
          <MoreVertical size={16} className="text-muted-foreground" />
        </div>

        {/* Search */}
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2 rounded-xl bg-muted px-3 py-2 border border-border focus-within:border-primary transition-colors">
            <Search size={13} className="text-muted-foreground shrink-0" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search contacts…"
              className="bg-transparent outline-none text-sm w-full text-foreground placeholder:text-muted-foreground"
            />
          </div>
        </div>

        {/* Filter chips */}
        <div className="flex gap-1.5 px-3 py-2 border-b border-border overflow-x-auto no-scrollbar shrink-0">
          {["All", "Unread", "WhatsApp", "Email"].map((chip) => (
            <button
              key={chip}
              onClick={() => setFilterChip(chip)}
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold whitespace-nowrap uppercase tracking-wider transition-all",
                filterChip === chip
                  ? "bg-primary text-white"
                  : "text-muted-foreground border border-border hover:text-foreground"
              )}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Thread list */}
        <div className="flex-1 overflow-y-auto custom-scrollbar divide-y divide-border/50">
          {isLoading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="flex gap-3 p-3">
                  <div className="w-11 h-11 rounded-full bg-muted animate-pulse shrink-0" />
                  <div className="flex-1 space-y-2 pt-1">
                    <div className="h-3 w-2/3 bg-muted rounded animate-pulse" />
                    <div className="h-2 w-full bg-muted/60 rounded animate-pulse" />
                  </div>
                </div>
              ))
            : filtered.length === 0
            ? (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground gap-2">
                  <MessageSquare size={24} className="opacity-30" />
                  <p className="text-sm">No conversations yet</p>
                </div>
              )
            : filtered.map((t) => {
                const isActive = selected?.leadId === t.leadId;
                return (
                  <button
                    key={t.leadId}
                    onClick={() => openThread(t)}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-3 text-left transition-colors relative hover:bg-muted/40",
                      isActive && "bg-primary/5 border-l-2 border-l-primary"
                    )}
                  >
                    <div
                      className="w-11 h-11 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                      style={{ background: avatarColor(t.leadName) }}
                    >
                      {initials(t.leadName)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-baseline mb-0.5">
                        <p className={cn("text-sm truncate", isActive ? "font-semibold text-foreground" : "font-medium text-foreground")}>
                          {t.leadName}
                        </p>
                        <span className={cn("text-[10px] ml-2 shrink-0", t.unread > 0 ? "text-primary font-semibold" : "text-muted-foreground")}>
                          {format(new Date(t.lastAt), "HH:mm")}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-xs text-muted-foreground truncate">{t.lastMessage}</p>
                        {t.unread > 0 && (
                          <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary text-white text-[10px] font-bold px-1.5 shrink-0">
                            {t.unread}
                          </span>
                        )}
                      </div>
                    </div>
                  </button>
                );
              })}
        </div>
      </aside>

      {/* ── CHAT AREA ───────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {!selected ? (
          /* Empty state */
          <div className="flex-1 flex flex-col items-center justify-center gap-6 text-muted-foreground bg-background">
            <div className="w-20 h-20 rounded-full bg-card border border-border flex items-center justify-center">
              <MessageSquare size={36} className="opacity-30" />
            </div>
            <div className="text-center">
              <h2 className="text-xl font-semibold mb-2 text-foreground">Unified Inbox</h2>
              <p className="text-sm text-muted-foreground max-w-[260px] leading-relaxed">
                Select a conversation from the left to start messaging
              </p>
            </div>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <header className="flex items-center gap-3 px-4 border-b border-border bg-card shrink-0" style={{ height: 60 }}>
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shrink-0"
                style={{ background: avatarColor(selected.leadName) }}
              >
                {initials(selected.leadName)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm text-foreground leading-tight">{selected.leadName}</p>
                <p className={cn("text-xs", isTyping ? "text-primary italic" : "text-muted-foreground")}>
                  {isTyping ? "typing…" : selected.phone}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {[
                  { icon: Phone, label: "Call" },
                  { icon: Video, label: "Video" },
                  { icon: Search, label: "Search" },
                  { icon: showInfo ? X : Info, label: "Info", action: () => setShowInfo(!showInfo) },
                  { icon: MoreVertical, label: "More" },
                ].map(({ icon: Icon, label, action }) => (
                  <button
                    key={label}
                    title={label}
                    onClick={action}
                    className="w-9 h-9 rounded-full flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
                  >
                    <Icon size={18} />
                  </button>
                ))}
              </div>
            </header>

            {/* Messages */}
            <div
              className="flex-1 overflow-y-auto px-5 py-4 flex flex-col gap-0.5 custom-scrollbar"
              style={{ background: "var(--color-bg)" }}
            >
              {/* Date divider */}
              <div className="flex items-center gap-3 my-3">
                <div className="flex-1 h-px bg-border" />
                <span className="text-[11px] px-3 py-1 rounded-full bg-card border border-border text-muted-foreground">
                  {format(new Date(), "d MMMM yyyy")}
                </span>
                <div className="flex-1 h-px bg-border" />
              </div>

              {messages.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center gap-3 text-muted-foreground py-16">
                  <Circle size={20} className="opacity-20" />
                  <p className="text-sm">No messages yet — say hello!</p>
                </div>
              ) : (
                messages.map((m, idx) => {
                  const isSent = m.direction === "OUTBOUND";
                  const prevMsg = idx > 0 ? messages[idx - 1] : null;
                  const isFirst = !prevMsg || prevMsg.direction !== m.direction;

                  return (
                    <div
                      key={m.id}
                      className={cn("flex", isSent ? "justify-end" : "justify-start")}
                      style={{ marginTop: isFirst ? 12 : 3 }}
                    >
                      <div className="relative max-w-[70%]">
                        {/* Bubble */}
                        <div
                          className="px-3 pt-2 pb-6 relative"
                          style={{
                            background: isSent ? "var(--color-primary)" : "var(--color-surface-2)",
                            borderRadius: isSent
                              ? "18px 18px 4px 18px"
                              : "18px 18px 18px 4px",
                            boxShadow: isSent
                              ? "0 2px 8px rgba(99,102,241,0.35)"
                              : "0 1px 4px rgba(0,0,0,0.3)",
                            minWidth: 80,
                          }}
                        >
                          {/* Channel badge */}
                          <p
                            className="text-[9px] font-bold uppercase tracking-wider mb-1"
                            style={{
                              color: m.channel === "WHATSAPP" ? "#4ade80"
                                : m.channel === "EMAIL" ? "#60a5fa"
                                : "#a78bfa",
                            }}
                          >
                            {m.channel}
                          </p>

                          {/* Content */}
                          <p
                            className="text-[14px] leading-relaxed whitespace-pre-wrap break-words"
                            style={{ color: isSent ? "#fff" : "var(--color-text)" }}
                          >
                            {m.content}
                          </p>

                          {/* Timestamp */}
                          <div
                            className="absolute bottom-1.5 right-2.5 flex items-center gap-1"
                            style={{ fontSize: 10, color: isSent ? "rgba(255,255,255,0.55)" : "var(--color-text-muted)" }}
                          >
                            <span>{format(new Date(m.createdAt), "HH:mm")}</span>
                            {isSent && <CheckCheck size={12} style={{ color: "#93c5fd" }} />}
                          </div>
                        </div>

                        {/* Bubble tail (only on first message in a group) */}
                        {isFirst && <BubbleTail isSent={isSent} />}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Typing indicator */}
              {isTyping && (
                <div className="flex justify-start mt-3">
                  <div className="flex items-center gap-1 px-4 py-3 rounded-2xl rounded-tl-sm bg-muted">
                    {[0, 1, 2].map((i) => (
                      <div
                        key={i}
                        className="w-2 h-2 rounded-full bg-muted-foreground"
                        style={{ animation: `typingBounce 1.4s infinite ease-in-out ${i * 0.16}s` }}
                      />
                    ))}
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} className="h-1" />
            </div>

            {/* Input Bar */}
            <footer className="shrink-0 px-4 py-3 bg-card border-t border-border">
              {/* Channel selector */}
              <div className="flex gap-1.5 mb-2">
                <span className="text-[10px] font-bold uppercase text-muted-foreground self-center mr-1">Via:</span>
                {(["WHATSAPP", "EMAIL"] as const).map((ch) => (
                  <button
                    key={ch}
                    onClick={() => setChannel(ch)}
                    className={cn(
                      "text-[10px] font-bold uppercase px-2.5 py-1 rounded-full transition-all border",
                      channel === ch
                        ? "bg-primary border-primary text-white"
                        : "border-border text-muted-foreground hover:text-foreground"
                    )}
                  >
                    {ch === "WHATSAPP" ? "WhatsApp" : "Email"}
                  </button>
                ))}
              </div>

              <div className="flex items-end gap-2">
                <button title="Emoji" className="shrink-0 pb-1 text-muted-foreground hover:text-primary transition-colors">
                  <Smile size={20} />
                </button>
                <button title="Attach" className="shrink-0 pb-1 text-muted-foreground hover:text-primary transition-colors">
                  <Paperclip size={18} />
                </button>

                {/* Textarea */}
                <div className="flex-1 rounded-xl bg-muted border border-border px-4 py-2.5 focus-within:border-primary transition-colors">
                  <textarea
                    ref={textareaRef}
                    value={msg}
                    onChange={(e) => { setMsg(e.target.value); autoResize(); }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); }
                    }}
                    placeholder={`Message via ${channel === "WHATSAPP" ? "WhatsApp" : "Email"}…`}
                    rows={1}
                    className="w-full bg-transparent outline-none resize-none text-sm text-foreground placeholder:text-muted-foreground leading-relaxed"
                    style={{ minHeight: 36, maxHeight: 120 }}
                  />
                </div>

                {/* Send button */}
                <button
                  onClick={send}
                  disabled={sending || !msg.trim()}
                  className="shrink-0 w-11 h-11 rounded-xl flex items-center justify-center bg-primary text-white transition-all hover:opacity-90 active:scale-95 disabled:opacity-40 shadow-lg shadow-primary/30"
                >
                  {msg.trim() ? <Send size={18} className="ml-0.5" /> : <Mic size={18} />}
                </button>
              </div>
            </footer>
          </>
        )}
      </div>

      {/* ── INFO PANEL ──────────────────────────────────────────── */}
      {showInfo && selected && (
        <aside
          className="flex flex-col shrink-0 border-l border-border bg-card overflow-y-auto custom-scrollbar"
          style={{ width: 280 }}
        >
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-4 border-b border-border">
            <button onClick={() => setShowInfo(false)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-muted text-muted-foreground hover:text-foreground transition-all">
              <X size={16} />
            </button>
            <h3 className="font-semibold text-sm text-foreground">Contact info</h3>
          </div>

          {/* Avatar */}
          <div className="flex flex-col items-center py-6 px-4 gap-2 border-b border-border">
            <div
              className="w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold text-white ring-4 ring-primary/20"
              style={{ background: avatarColor(selected.leadName) }}
            >
              {initials(selected.leadName)}
            </div>
            <p className="font-semibold text-base text-foreground">{selected.leadName}</p>
            <p className="text-xs text-muted-foreground">{selected.phone}</p>
            <div className="flex gap-2 mt-2">
              {[Phone, Video, Mail].map((Icon, i) => (
                <button key={i} className="p-2.5 rounded-xl bg-muted hover:bg-primary hover:text-white text-muted-foreground transition-all">
                  <Icon size={16} />
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="p-4">
            <p className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-2">Quick Actions</p>
            {["View Lead Profile", "Add Note", "Schedule Callback"].map((action) => (
              <button
                key={action}
                className="w-full text-left text-sm py-2 px-3 rounded-lg mb-1 text-foreground hover:bg-muted transition-all"
              >
                {action}
              </button>
            ))}
          </div>
        </aside>
      )}
    </div>
  );
}
