"use client";

import { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Video,
  X,
  Send,
  Paperclip,
  Mic,
  Smile,
  MessageCircle,
  Mail,
  MessageSquare,
  CheckCheck,
  Check,
  ChevronDown,
  FileText,
  Star,
  Download,
  WifiOff,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead: any;
  onCall?: () => void;
}

const CHANNEL_ICONS: Record<string, any> = {
  WHATSAPP: <MessageCircle size={11} />,
  EMAIL: <Mail size={11} />,
  SMS: <MessageSquare size={11} />,
};

const CHANNEL_COLORS: Record<string, string> = {
  WHATSAPP: "#25D366",
  EMAIL: "#EA4335",
  SMS: "#0078D4",
};

export default function CustomerWorkspace({
  isOpen,
  onClose,
  activeLead,
  onCall,
}: CustomerWorkspaceProps) {
  const [isMounted, setIsMounted] = useState(false);
  const [channelTab, setChannelTab] = useState<"messages" | "quotes">(
    "messages"
  );
  const [sendChannel, setSendChannel] = useState<"WHATSAPP" | "SMS" | "EMAIL">(
    "WHATSAPP"
  );
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resolvedLeadId, setResolvedLeadId] = useState<string | null>(null);
  const [score, setScore] = useState(activeLead?.score || 0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const effectiveLeadId = resolvedLeadId || activeLead?.id;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setResolvedLeadId(null);
    setScore(activeLead?.score || 0);
  }, [activeLead?.id, activeLead?.score]);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  });

  const { data: threadMessages, isLoading: isMessagesLoading } = useSWR(
    effectiveLeadId ? `/communications/thread/${effectiveLeadId}?phone=${activeLead?.phone || ''}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const { data: quotes } = useSWR(
    effectiveLeadId ? `/quotes/lead/${effectiveLeadId}` : null,
    fetcher
  );

  const messages = (threadMessages || []).sort(
    (a: any, b: any) =>
      new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  const updateScore = async (newScore: number) => {
    setScore(newScore);
    if (!effectiveLeadId) return;
    try {
      await api.patch(`/leads/${effectiveLeadId}`, { score: newScore });
      mutate(`/sheets/sheet-001/rows`);
    } catch {}
  };

  const autoResize = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = Math.min(el.scrollHeight, 120) + "px";
  };

  const handleSend = async () => {
    if (!message.trim() || !activeLead || isSending) return;
    const text = message.trim();
    setMessage("");
    setIsSending(true);
    if (textareaRef.current) textareaRef.current.style.height = "36px";

    try {
      const response = await api.post("/communications/send", {
        leadId: activeLead.id,
        userId: "SYSTEM",
        type: sendChannel,
        message: text,
      });

      const newLeadId = response.data?.leadId;
      if (newLeadId && newLeadId !== effectiveLeadId) {
        setResolvedLeadId(newLeadId);
      }
      mutate(`/communications/thread/${newLeadId || effectiveLeadId}`);
    } catch (err: any) {
      console.error("Failed to send message:", err);
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen || !activeLead || !isMounted) return null;

  const leadName =
    activeLead.name || activeLead.firstName || "Unknown Entity";
  const initials = leadName
    .split(" ")
    .map((w: string) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="fixed top-0 right-0 w-[420px] h-screen z-[200] flex flex-col shadow-2xl overflow-hidden">
      {/* ── Header ── */}
      <header
        className="px-4 py-3 flex items-center gap-3 shrink-0 relative border-b border-border bg-card"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-white/70 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
        >
          <X size={18} />
        </Button>

        <Avatar className="h-10 w-10 border-2 border-white/20 shrink-0">
          <AvatarImage src={`https://avatar.vercel.sh/${leadName}.png`} />
          <AvatarFallback className="font-bold text-sm bg-primary text-white">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-foreground font-semibold text-sm truncate leading-tight">
            {leadName}
          </h2>
          <p className="text-muted-foreground text-[11px] truncate">
            {activeLead.phone || activeLead.email || "No contact info"}
          </p>
        </div>

        <div className="flex items-center gap-1 mr-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCall}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-8 w-8 transition-colors"
          >
            <Phone size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-8 w-8 transition-colors"
          >
            <Video size={18} />
          </Button>
        </div>
      </header>

      {/* ── Lead Score ── */}
      <div className="px-4 py-2 bg-[#1a1a2e] border-b border-white/5 flex items-center justify-between shrink-0">
        <span className="text-[10px] font-bold text-white/40 uppercase tracking-widest">
          Lead Score
        </span>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            onMouseUp={(e) =>
              updateScore(parseInt((e.target as HTMLInputElement).value))
            }
            className="w-28 h-1 rounded-full cursor-pointer accent-primary"
          />
          <span
            className="text-xs font-black tabular-nums min-w-[28px] text-right text-primary"
          >
            {score}
          </span>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-[#1a1a2e] border-b border-white/5 flex shrink-0">
        {[
          { id: "messages", label: "Messages" },
          { id: "quotes", label: "Quotes" },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setChannelTab(tab.id as any)}
            className={cn(
              "flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-all border-b-2",
              channelTab === tab.id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chat Area ── */}
      {channelTab === "messages" ? (
        <>
          {/* Messages scroll area */}
          <div
            className="flex-grow overflow-y-auto px-4 py-6"
            style={{
              background: "linear-gradient(rgba(15,23,42,0.94), rgba(15,23,42,0.94)), url('https://picsum.photos/id/1015/1920/1080') center/cover no-repeat",
              scrollbarWidth: "thin" as any,
              scrollbarColor: "rgb(225 29 72) transparent",
            }}
          >
            {/* Date Badge */}
            <div className="flex justify-center mb-4">
              <span
                className="text-[9px] font-bold py-1 px-4 rounded-full uppercase tracking-widest"
                style={{ background: "#1c0010", border: "1px solid rgba(180,0,60,0.2)", color: "#9a6070" }}
              >
                {new Date().toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" })}
              </span>
            </div>

            {isMessagesLoading && messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                <div className="h-6 w-6 rounded-full border-2 border-primary border-t-transparent animate-spin mb-2 opacity-50"></div>
                <p className="text-xs text-muted-foreground">Loading history...</p>
              </div>
            ) : messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center gap-2">
                <WifiOff size={28} className="text-muted-foreground mb-2 opacity-30" />
                <p className="text-xs text-muted-foreground">No messages yet</p>
                <p className="text-[10px] text-muted-foreground opacity-50">Send the first message below</p>
              </div>
            )}

            {messages.map((msg: any, idx: number) => {
              const isOutgoing = msg.direction === "OUTBOUND";
              const channel = msg.channel || "WHATSAPP";
              const text = msg.content || "";
              const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
              const prevMsg = idx > 0 ? messages[idx - 1] : null;
              const isFirst = !prevMsg || prevMsg.direction !== msg.direction;

              return (
                <div
                  key={msg.id}
                  className={cn("flex", isOutgoing ? "justify-end" : "justify-start", isFirst ? "mt-4" : "mt-1")}
                >
                  <div className="relative max-w-[78%]">
                    <div
                      className={cn(
                        "px-4 py-2.5 shadow-sm text-[14.5px] leading-relaxed",
                        isOutgoing ? "bg-rose-600 text-white" : "bg-slate-800 border border-slate-700 text-slate-100"
                      )}
                      style={{
                        borderRadius: isOutgoing
                          ? (isFirst ? "20px 20px 6px 20px" : "20px 20px 6px 20px")
                          : (isFirst ? "20px 20px 20px 6px" : "20px 20px 20px 6px"),
                        minWidth: 80,
                      }}
                    >
                      {/* Channel tag */}
                      {isFirst && (
                        <div className="flex items-center gap-1.5 mb-1.5 opacity-80">
                          {CHANNEL_ICONS[channel]}
                          <span className="text-[9px] font-bold uppercase tracking-wider">{channel}</span>
                        </div>
                      )}

                      {/* Meta absolute bottom-right */}
                      {msg.mediaData && (
                        <div className="mb-2 overflow-hidden rounded-md border border-slate-700/50 shadow-md">
                          <img 
                            src={`data:image/jpeg;base64,${msg.mediaData}`} 
                            alt="Media thumbnail" 
                            className="w-full h-auto max-h-[300px] object-cover"
                          />
                        </div>
                      )}

                      <p className="whitespace-pre-wrap break-words pr-2">
                        {text}
                      </p>

                      {/* Meta absolute bottom-right */}
                      <div
                        className={cn(
                          "flex justify-end items-center gap-1 mt-1 text-[10px]",
                          isOutgoing ? "text-emerald-300" : "text-slate-400"
                        )}
                      >
                        <span>{time}</span>
                        {isOutgoing && <CheckCheck size={12} />}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Bar ── */}
          <div
            className="shrink-0 px-4 py-4"
            style={{ background: "#0f172a", borderTop: "1px solid #334155" }}
          >
            {/* Channel selector */}
            <div className="flex gap-2 mb-3">
              {(["WHATSAPP", "SMS", "EMAIL"] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSendChannel(ch)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all"
                  style={{
                    background: sendChannel === ch ? "rgba(225, 29, 72, 0.15)" : "transparent",
                    color: sendChannel === ch ? "#f43f5e" : "#94a3b8",
                    border: sendChannel === ch ? "1px solid rgba(225, 29, 72, 0.5)" : "1px solid #334155",
                  }}
                >
                  {CHANNEL_ICONS[ch]}
                  {ch}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div className="flex items-end gap-3 rounded-3xl px-4 py-2.5 bg-slate-800 border border-slate-700 focus-within:border-rose-600 transition-colors">
              <button className="shrink-0 mb-1 text-slate-400 hover:text-rose-400">
                <Smile size={20} />
              </button>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => { setMessage(e.target.value); autoResize(); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message via ${sendChannel.toLowerCase()}…`}
                rows={1}
                className="flex-1 bg-transparent text-[14px] text-slate-100 placeholder:text-slate-500 outline-none resize-none leading-relaxed py-1"
                style={{ caretColor: "#e11d48", minHeight: 32, maxHeight: 120 }}
              />
              <button className="shrink-0 mb-1 text-slate-400 hover:text-rose-400">
                <Paperclip size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 bg-rose-600 hover:bg-rose-700 shadow-md mb-0.5"
                style={{ boxShadow: "0 4px 14px rgba(225, 29, 72, 0.4)" }}
              >
                {message.trim() ? <Send size={16} className="text-white ml-0.5" /> : <Mic size={16} className="text-white" />}
              </button>
            </div>
          </div>
        </>
      ) : (
        /* ── Quotes Panel ── */
        <div className="flex-grow overflow-y-auto bg-[#0d1117] px-4 py-4 space-y-4">
          {!quotes || quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText size={28} className="text-white/20 mb-2" />
              <p className="text-white/30 text-xs">No quotes generated yet</p>
            </div>
          ) : (
            quotes.map((q: any) => (
              <div
                key={q.id}
                className="rounded-2xl overflow-hidden border border-white/10 bg-[#1f2937] shadow-lg"
              >
                <div
                  className="px-4 py-3 flex justify-between items-center"
                  style={{ background: "rgba(37,211,102,0.08)" }}
                >
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-[#25D366]">
                      Quote v{q.version}
                    </p>
                    <p className="text-[10px] text-white/30 font-mono mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-white/10 text-white/50">
                    {q.status}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <p className="text-white font-black text-lg tabular-nums">
                    ₹{q.totalValue?.toLocaleString("en-IN")}
                  </p>
                  <Button
                    size="sm"
                    onClick={() =>
                      window.open(
                        `${
                          api.defaults.baseURL || "http://localhost:3001"
                        }/quotes/${q.id}/pdf`,
                        "_blank"
                      )
                    }
                    className="h-8 text-[10px] font-bold uppercase tracking-widest gap-1.5"
                    style={{ background: "#25D366", color: "#000" }}
                  >
                    <Download size={12} />
                    PDF
                  </Button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
