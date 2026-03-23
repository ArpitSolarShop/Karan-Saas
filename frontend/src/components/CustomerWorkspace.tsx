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

  const { data: activities } = useSWR(
    effectiveLeadId ? `/activities/lead/${effectiveLeadId}` : null,
    fetcher,
    { refreshInterval: 3000 }
  );

  const { data: quotes } = useSWR(
    effectiveLeadId ? `/quotes/lead/${effectiveLeadId}` : null,
    fetcher
  );

  const messages = (activities || [])
    .filter((a: any) => ["WHATSAPP", "SMS", "EMAIL"].includes(a.type || a.activityType))
    .sort(
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
      mutate(`/activities/lead/${newLeadId || effectiveLeadId}`);
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
      {/* ── WA-style dark header ── */}
      <header
        style={{ background: "linear-gradient(135deg, #075E54 0%, #128C7E 100%)" }}
        className="px-4 py-3 flex items-center gap-3 shrink-0 relative"
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
          <AvatarFallback style={{ background: "#25D366", color: "#000" }} className="font-bold text-sm">
            {initials}
          </AvatarFallback>
        </Avatar>

        <div className="flex-1 min-w-0">
          <h2 className="text-white font-semibold text-sm truncate leading-tight">
            {leadName}
          </h2>
          <p className="text-white/60 text-[11px] truncate">
            {activeLead.phone || activeLead.email || "No contact info"}
          </p>
        </div>

        <div className="flex items-center gap-1 mr-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={onCall}
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
          >
            <Phone size={18} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-white/80 hover:text-white hover:bg-white/10 rounded-full h-8 w-8"
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
            className="w-28 h-1 rounded-full cursor-pointer accent-[#25D366]"
          />
          <span
            className="text-xs font-black tabular-nums min-w-[28px] text-right"
            style={{ color: "#25D366" }}
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
                ? "text-[#25D366] border-[#25D366]"
                : "text-white/40 border-transparent hover:text-white/60"
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Chat Area ── */}
      {channelTab === "messages" ? (
        <>
          {/* Messages scroll area with WA background pattern */}
          <div
            className="flex-grow overflow-y-auto px-3 py-4 space-y-2"
            style={{
              background: "#0d1117",
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }}
          >
            {/* Session Start Badge */}
            <div className="flex justify-center mb-4">
              <span className="bg-[#1f2937] text-white/40 text-[9px] font-bold py-1 px-4 rounded-full uppercase tracking-widest shadow-sm">
                {new Date().toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
              </span>
            </div>

            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-32 text-center">
                <WifiOff size={28} className="text-white/20 mb-2" />
                <p className="text-white/30 text-xs">No messages yet</p>
                <p className="text-white/20 text-[10px] mt-1">
                  Send the first message below
                </p>
              </div>
            )}

            {messages.map((msg: any) => {
              const isOutgoing = msg.userId === "SYSTEM" || !msg.userId;
              const channel = msg.type || msg.activityType || "WHATSAPP";
              const text = (msg.description || "")
                .replace(/^Sent (WHATSAPP|SMS|EMAIL)(?: to [^:]+)?: /, "")
                .replace(/^\[INCOMING\] /, "");
              const time = new Date(msg.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              });

              return (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    isOutgoing ? "justify-end" : "justify-start"
                  )}
                >
                  <div
                    className={cn(
                      "max-w-[78%] rounded-2xl px-3 py-2 shadow-md relative",
                      isOutgoing
                        ? "rounded-tr-sm"
                        : "rounded-tl-sm"
                    )}
                    style={{
                      background: isOutgoing ? "#005C4B" : "#1f2937",
                    }}
                  >
                    {/* Channel tag */}
                    <div
                      className="flex items-center gap-1 mb-1"
                      style={{ color: CHANNEL_COLORS[channel] + "99" }}
                    >
                      {CHANNEL_ICONS[channel]}
                      <span className="text-[9px] font-bold uppercase tracking-wider">
                        {channel}
                      </span>
                    </div>

                    <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap break-words">
                      {text}
                    </p>

                    {/* Timestamp + ticks */}
                    <div
                      className={cn(
                        "flex items-center gap-1 mt-1 justify-end"
                      )}
                    >
                      <span className="text-[10px] text-white/40">{time}</span>
                      {isOutgoing && (
                        <CheckCheck size={14} className="text-[#53BDEB]" />
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            <div ref={messagesEndRef} />
          </div>

          {/* ── Input Bar ── */}
          <div className="shrink-0 bg-[#1a1a2e] border-t border-white/5 px-3 py-3 space-y-2">
            {/* Channel selector */}
            <div className="flex gap-1">
              {(["WHATSAPP", "SMS", "EMAIL"] as const).map((ch) => (
                <button
                  key={ch}
                  onClick={() => setSendChannel(ch)}
                  className={cn(
                    "flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all border",
                    sendChannel === ch
                      ? "border-transparent text-black"
                      : "text-white/40 border-white/10 hover:border-white/20 hover:text-white/60"
                  )}
                  style={
                    sendChannel === ch
                      ? { background: CHANNEL_COLORS[ch] }
                      : {}
                  }
                >
                  {CHANNEL_ICONS[ch]}
                  {ch}
                </button>
              ))}
            </div>

            {/* Input row */}
            <div
              className="flex items-end gap-2 rounded-2xl px-3 py-2 transition-all"
              style={{
                background: "#111827",
                border: "1px solid rgba(255,255,255,0.07)",
              }}
            >
              <button className="text-white/30 hover:text-white/60 shrink-0 mb-1 transition-colors">
                <Smile size={20} />
              </button>
              <textarea
                ref={textareaRef}
                value={message}
                onChange={(e) => {
                  setMessage(e.target.value);
                  autoResize();
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                placeholder={`Message via ${sendChannel.toLowerCase()}...`}
                rows={1}
                className="flex-1 bg-transparent text-white text-[13px] outline-none resize-none placeholder:text-white/25 leading-relaxed"
                style={{ minHeight: "36px", maxHeight: "120px" }}
              />
              <button className="text-white/30 hover:text-white/60 shrink-0 mb-1 transition-colors">
                <Paperclip size={18} />
              </button>
              {message.trim() ? (
                <button
                  onClick={handleSend}
                  disabled={isSending}
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all shadow-lg disabled:opacity-50"
                  style={{ background: "#25D366" }}
                >
                  <Send size={16} className="text-black" />
                </button>
              ) : (
                <button
                  className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 transition-all"
                  style={{ background: "#25D366" }}
                >
                  <Mic size={16} className="text-black" />
                </button>
              )}
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
