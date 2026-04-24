"use client";

import { useState, useEffect, useRef } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
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
  Zap,
  ShieldCheck,
  BrainCircuit,
  ThumbsUp,
  ThumbsDown,
  Minus,
  Building2,
  StickyNote,
  Tag,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";
import CompanySelect from "@/components/companies/CompanySelect";
import Timeline from "@/components/leads/Timeline";
import { toast } from "sonner";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface CustomerWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead: any;
  onCall?: (phone: string) => void;
  onConvert?: () => void;
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

const DISPOSITION_OPTIONS = [
  { code: "INTERESTED", label: "Interested", color: "bg-emerald-500/10 text-emerald-700 border-emerald-500/20" },
  { code: "CALLBACK", label: "Callback", color: "bg-amber-500/10 text-amber-700 border-amber-500/20" },
  { code: "NOT_INTERESTED", label: "Not Interested", color: "bg-red-500/10 text-red-700 border-red-500/20" },
  { code: "CONVERTED", label: "Converted", color: "bg-blue-500/10 text-blue-700 border-blue-500/20" },
  { code: "DNC", label: "DNC", color: "bg-rose-600/10 text-rose-700 border-rose-600/20" },
];

export default function CustomerWorkspace({
  isOpen,
  onClose,
  activeLead,
  onCall,
  onConvert,
}: CustomerWorkspaceProps) {
  const { user } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [channelTab, setChannelTab] = useState<"messages" | "notes" | "quotes" | "timeline">(
    "messages"
  );
  const [sendChannel, setSendChannel] = useState<"WHATSAPP" | "SMS" | "EMAIL">(
    "WHATSAPP"
  );
  const [message, setMessage] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [resolvedLeadId, setResolvedLeadId] = useState<string | null>(null);
  const [score, setScore] = useState(activeLead?.score || 0);
  const [noteText, setNoteText] = useState("");
  const [isSavingNote, setIsSavingNote] = useState(false);
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

  const { data: notes, mutate: mutateNotes } = useSWR(
    effectiveLeadId ? `/notes/lead/${effectiveLeadId}` : null,
    fetcher,
    { refreshInterval: 5000 }
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

  const handleDisposition = async (code: string) => {
    if (!effectiveLeadId) return;
    try {
      await api.patch(`/leads/${effectiveLeadId}`, { status: code });
      mutate(`/sheets/sheet-001/rows`);
      toast.success(`Disposition set: ${code}`);
    } catch {
      toast.error("Failed to set disposition");
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !effectiveLeadId || isSavingNote) return;
    setIsSavingNote(true);
    try {
      await api.post("/notes", {
        leadId: effectiveLeadId,
        note: noteText.trim(),
        agentId: user?.id || "SYSTEM",
      });
      setNoteText("");
      mutateNotes();
      toast.success("Note added");
    } catch {
      toast.error("Failed to add note");
    } finally {
      setIsSavingNote(false);
    }
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
        userId: user?.id || "SYSTEM",
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

  const handleUpdateCompany = async (companyId: string) => {
    if (!activeLead?.id) return;
    try {
      await api.patch(`/leads-v2/${activeLead.id}`, { companyId: companyId || null });
      toast.success(companyId ? "Account linked" : "Account unlinked");
      mutate(`/sheets/sheet-001/rows`);
    } catch (error) {
      toast.error("Failed to update account link");
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
    <div className="fixed top-0 right-0 w-[420px] h-screen z-[200] flex flex-col shadow-2xl overflow-hidden bg-background border-l border-border">
      {/* ── Header ── */}
      <header
        className="px-4 py-3 flex items-center gap-3 shrink-0 relative border-b border-border bg-surface"
      >
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-8 w-8"
        >
          <X size={18} />
        </Button>

        {activeLead?.status !== 'CONVERTED' && onConvert && (
          <Button
            size="sm"
            onClick={onConvert}
            className="absolute right-12 top-1/2 -translate-y-1/2 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 h-8 px-3 text-[10px] font-bold uppercase tracking-wider"
          >
            <Zap size={12} className="mr-1.5" /> Convert
          </Button>
        )}

        <Avatar className="h-10 w-10 border border-border shrink-0">
          <AvatarImage src={`https://avatar.vercel.sh/${leadName}.png`} />
          <AvatarFallback className="font-bold text-sm bg-primary text-primary-foreground">
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
          
          <div className="mt-2 group/company">
            {activeLead.companyId ? (
              <div className="flex items-center justify-between gap-2 bg-primary/5 border border-primary/10 rounded px-2 py-1">
                <Link 
                  href={`/companies/${activeLead.companyId}`}
                  className="flex items-center gap-1.5 text-[10px] font-bold text-primary hover:underline truncate"
                >
                  <Building2 size={10} />
                  {activeLead.company?.name || "Linked Account"}
                </Link>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-4 w-4 opacity-0 group-hover/company:opacity-100 transition-opacity"
                  onClick={() => handleUpdateCompany("")}
                >
                  <X size={10} />
                </Button>
              </div>
            ) : (
              <CompanySelect 
                value={activeLead.companyId} 
                onSelect={(id) => handleUpdateCompany(id)} 
                className="w-full"
              />
            )}
          </div>

          <div className="flex items-center gap-1.5 mt-2">
             <div className={cn(
               "px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest flex items-center gap-1",
               activeLead.aiSentimentLast === 'POSITIVE' ? 'bg-success/10 text-success border border-success/20' : 
               activeLead.aiSentimentLast === 'NEGATIVE' ? 'bg-destructive/10 text-destructive border border-destructive/20' : 
               'bg-muted text-muted-foreground border border-border'
             )}>
                <BrainCircuit size={8}/> 
                {activeLead.aiSentimentLast || 'NEUTRAL'} SENTIMENT
             </div>
             {activeLead.isDnc && (
               <div className="px-1.5 py-0.5 bg-destructive/10 text-destructive border border-destructive/20 rounded text-[8px] font-black uppercase tracking-widest">DNC PROTECTED</div>
             )}
          </div>
        </div>

        <div className="flex items-center gap-1 mr-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onCall?.(activeLead.phone || "")}
            className="text-muted-foreground hover:text-foreground hover:bg-muted rounded-full h-8 w-8 transition-colors"
            title="Call this lead"
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

      {/* ── Intelligence Gauge ── */}
      <div className="px-6 py-4 bg-surface-2 border-b border-border relative overflow-hidden shrink-0">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
           <Zap size={80} className="text-primary"/>
        </div>
        
        <div className="flex items-end justify-between relative z-10 mb-3">
           <div>
              <h4 className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Alpha Score Index</h4>
              <p className="text-[9px] text-muted-foreground uppercase font-mono mt-1">Priority Class: {score > 80 ? 'CRITICAL' : score > 50 ? 'HIGH' : 'STANDARD'}</p>
           </div>
           <div className="text-right">
              <span className="text-3xl font-black text-foreground tabular-nums tracking-tighter">{score}</span>
              <span className="text-[10px] font-bold text-muted-foreground ml-1">/100</span>
           </div>
        </div>

        <div className="space-y-2 relative z-10">
          <div className="h-2 w-full bg-surface rounded-full overflow-hidden border border-border/50">
             <div 
               className={cn("h-full transition-all duration-500 ease-out shadow-lg", 
                 score > 80 ? 'bg-success' : score > 50 ? 'bg-primary' : 'bg-yellow-500'
               )} 
               style={{ width: `${score}%`, boxShadow: '0 0 10px var(--tw-shadow-color)' }}
             />
          </div>
          <input
            type="range"
            min="0"
            max="100"
            value={score}
            onChange={(e) => setScore(parseInt(e.target.value))}
            onMouseUp={(e) =>
              updateScore(parseInt((e.target as HTMLInputElement).value))
            }
            className="w-full h-1 opacity-0 absolute inset-0 cursor-pointer"
          />
        </div>

        {/* Quick Disposition Strip */}
        <div className="mt-3 relative z-10">
          <p className="text-[8px] font-black text-muted-foreground/50 uppercase tracking-widest mb-2 flex items-center gap-1">
            <Tag size={8}/> Quick Disposition
          </p>
          <div className="flex flex-wrap gap-1.5">
            {DISPOSITION_OPTIONS.map((d) => (
              <button
                key={d.code}
                onClick={() => handleDisposition(d.code)}
                className={cn(
                  "px-2 py-1 rounded-md text-[8px] font-black uppercase tracking-wider border transition-all hover:scale-105 active:scale-95",
                  d.color,
                  activeLead.status === d.code && "ring-1 ring-primary/40 shadow-lg"
                )}
              >
                {d.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Tab Bar ── */}
      <div className="bg-surface border-b border-border flex shrink-0">
        {[
          { id: "messages", label: "Messages", icon: MessageCircle },
          { id: "notes", label: "Notes", icon: StickyNote },
          { id: "quotes", label: "Quotes", icon: FileText },
          { id: "timeline", label: "Timeline", icon: Zap },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setChannelTab(tab.id as any)}
            className={cn(
              "flex-1 py-2.5 text-[10px] font-bold uppercase tracking-widest transition-all border-b-2 flex items-center justify-center gap-1.5",
              channelTab === tab.id
                ? "text-primary border-primary"
                : "text-muted-foreground border-transparent hover:text-foreground"
            )}
          >
            <tab.icon size={10} />
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
              background: "linear-gradient(rgba(250,250,250,0.94), rgba(250,250,250,0.94)), url('https://picsum.photos/id/1015/1920/1080') center/cover no-repeat",
              scrollbarWidth: "thin" as any,
              scrollbarColor: "rgb(225 29 72) transparent",
            }}
          >
            {/* Date Badge */}
            <div className="flex justify-center mb-4">
              <span
                className="text-[9px] font-bold py-1 px-4 rounded-full uppercase tracking-widest bg-muted text-muted-foreground border border-border"
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
                        isOutgoing ? "bg-primary text-primary-foreground" : "bg-surface border border-border text-foreground"
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

                      {/* Media thumbnail */}
                      {msg.mediaData && (
                        <div className="mb-2 overflow-hidden rounded-md border border-border/50 shadow-md">
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

                      {/* Meta */}
                      <div
                        className={cn(
                          "flex justify-end items-center gap-1 mt-1 text-[10px]",
                          isOutgoing ? "text-primary-foreground/80" : "text-muted-foreground"
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
            className="shrink-0 px-4 py-4 bg-surface border-t border-border"
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
            <div className="flex items-end gap-3 rounded-3xl px-4 py-2.5 bg-background border border-border focus-within:border-primary transition-colors">
              <button className="shrink-0 mb-1 text-muted-foreground hover:text-primary">
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
                className="flex-1 bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground outline-none resize-none leading-relaxed py-1"
                style={{ caretColor: "var(--primary)", minHeight: 32, maxHeight: 120 }}
              />
              <button className="shrink-0 mb-1 text-muted-foreground hover:text-primary">
                <Paperclip size={18} />
              </button>
              <button
                onClick={handleSend}
                disabled={isSending}
                className="h-10 w-10 rounded-full flex items-center justify-center shrink-0 transition-all disabled:opacity-40 bg-primary hover:bg-primary/90 shadow-md mb-0.5"
                style={{ boxShadow: "0 4px 14px rgba(79, 70, 229, 0.4)" }}
              >
                {message.trim() ? <Send size={16} className="text-primary-foreground ml-0.5" /> : <Mic size={16} className="text-primary-foreground" />}
              </button>
            </div>
          </div>
        </>
      ) : channelTab === "notes" ? (
        /* ── Notes Panel ── */
        <div className="flex-grow flex flex-col bg-surface-2">
          <ScrollArea className="flex-1 px-4 py-4">
            {!notes || notes.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-40 text-center">
                <StickyNote size={28} className="text-muted-foreground/20 mb-2" />
                <p className="text-muted-foreground/50 text-xs">No notes yet</p>
                <p className="text-muted-foreground/40 text-[10px] mt-1">Add your first note below</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(notes as any[]).sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map((note: any) => (
                  <div
                    key={note.id}
                    className="rounded-xl bg-background border border-border p-3 shadow-sm group hover:border-primary/30 transition-colors"
                  >
                    <p className="text-[13px] text-foreground leading-relaxed whitespace-pre-wrap">{note.content}</p>
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-border/30">
                      <span className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest">
                        {note.user ? `${note.user.firstName || ''} ${note.user.lastName || ''}`.trim() : 'Agent'}
                      </span>
                      <span className="text-[9px] text-muted-foreground font-mono">
                        {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Add Note Input */}
          <div className="shrink-0 px-4 py-3 border-t border-border bg-surface-2">
            <div className="flex items-end gap-2">
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleAddNote();
                  }
                }}
                placeholder="Type a note... (Ctrl+Enter to save)"
                rows={2}
                className="flex-1 bg-background border border-border text-[13px] text-foreground placeholder:text-muted-foreground outline-none resize-none rounded-xl px-3 py-2 focus:border-primary/50 transition-colors"
              />
              <Button
                onClick={handleAddNote}
                disabled={!noteText.trim() || isSavingNote}
                size="icon"
                className="h-10 w-10 rounded-xl bg-primary hover:bg-primary/90 shrink-0 disabled:opacity-40"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>
      ) : channelTab === "quotes" ? (
        /* ── Quotes Panel ── */
        <div className="flex-grow overflow-y-auto bg-surface-2 px-4 py-4 space-y-4">
          {!quotes || quotes.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-center">
              <FileText size={28} className="text-muted-foreground/30 mb-2" />
              <p className="text-muted-foreground/50 text-xs">No quotes generated yet</p>
            </div>
          ) : (
            quotes.map((q: any) => (
              <div
                key={q.id}
                className="rounded-2xl overflow-hidden border border-border bg-surface shadow-lg"
              >
                <div
                  className="px-4 py-3 flex justify-between items-center bg-emerald-500/10"
                >
                  <div>
                    <p className="text-[11px] font-black uppercase tracking-widest text-emerald-600">
                      Quote v{q.version}
                    </p>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                      {new Date(q.createdAt).toLocaleDateString("en-IN")}
                    </p>
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full border border-border text-muted-foreground">
                    {q.status}
                  </span>
                </div>
                <div className="px-4 py-3 flex justify-between items-center">
                  <p className="text-foreground font-black text-lg tabular-nums">
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
      ) : (
        <Timeline leadId={activeLead.id} />
      )}
    </div>
  );
}
