"use client";

import { useState, useEffect, useRef } from "react";
import { MessageSquare, X, Send, GripHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

interface CommunicationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead?: { id: string; name: string; phone: string } | null;
}

const TAB_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  whatsapp: { label: "WhatsApp", color: "text-success", bg: "bg-success/20 border-success/30" },
  sms:       { label: "SMS",      color: "text-primary", bg: "bg-primary/20 border-primary/30" },
  email:     { label: "Email",    color: "text-info",    bg: "bg-info/20 border-info/30" },
};

export default function CommunicationDrawer({ isOpen, onClose, activeLead }: CommunicationDrawerProps) {
  const [activeTab, setActiveTab] = useState<"whatsapp" | "sms" | "email">("whatsapp");
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState<any[]>([]);
  const [position, setPosition] = useState({ x: 100, y: 150 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ offsetX: number; offsetY: number } | null>(null);

  const handleSend = () => {
    if (!message) return;
    setHistory([{ id: Date.now(), type: activeTab, content: message, timestamp: new Date().toLocaleTimeString(), status: "SENT" }, ...history]);
    setMessage("");
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (rect) dragRef.current = { offsetX: e.clientX - rect.left, offsetY: e.clientY - rect.top };
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) setPosition({ x: e.clientX - dragRef.current.offsetX, y: e.clientY - dragRef.current.offsetY });
    };
    const handleMouseUp = () => { setIsDragging(false); dragRef.current = null; };
    if (isDragging) { window.addEventListener("mousemove", handleMouseMove); window.addEventListener("mouseup", handleMouseUp); }
    return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
  }, [isDragging]);

  if (!isOpen) return null;

  const tabConfig = TAB_CONFIG[activeTab];

  return (
    <div
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={cn(
        "fixed w-[420px] bg-surface border border-border z-[100] rounded-xl shadow-2xl flex flex-col font-sans select-none transition-all duration-200",
        isDragging ? "shadow-primary/20 scale-[1.01]" : "shadow-black/40"
      )}
    >
      {/* Header Drag Handle */}
      <div
        onMouseDown={handleMouseDown}
        className="p-4 border-b border-border flex justify-between items-center bg-surface-2/50 rounded-t-xl cursor-grab active:cursor-grabbing"
      >
        <div className="flex items-center gap-3">
          <div className="h-8 w-8 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center">
            <MessageSquare size={14} className="text-primary" />
          </div>
          <div>
            <h2 className="text-sm font-black uppercase tracking-tighter">Multi-Channel Hub</h2>
            <p className="text-[9px] font-bold text-text-muted uppercase tracking-widest">
              Lead: <span className="text-foreground">{activeLead?.name || "None"}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <GripHorizontal size={16} className="text-text-muted" />
          <Button
            onClick={onClose}
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-text-muted hover:text-foreground hover:bg-surface rounded-lg border border-border"
          >
            <X size={14} />
          </Button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-2 border-b border-border bg-surface-2/30">
        {(["whatsapp", "sms", "email"] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 py-2 text-[9px] font-black uppercase tracking-widest rounded-lg transition-all",
              activeTab === tab
                ? "bg-primary text-white shadow-lg shadow-primary/20"
                : "text-text-muted hover:text-foreground hover:bg-surface-2"
            )}
          >
            {TAB_CONFIG[tab].label}
          </button>
        ))}
      </div>

      {/* Message History */}
      <div className="h-[280px] overflow-y-auto px-3 py-3 space-y-2 custom-scrollbar" style={{ background: "#0d1117" }}>
        {history.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-text-muted space-y-3 opacity-40">
            <MessageSquare size={40} />
            <span className="text-[10px] uppercase font-bold tracking-widest text-center">No messages yet</span>
          </div>
        ) : (
          history.map(msg => (
            <div key={msg.id} className="flex justify-end pointer-events-auto">
              <div className="max-w-[80%] rounded-2xl rounded-tr-sm px-3 py-2 shadow-md" style={{ background: "#005C4B" }}>
                <div className="flex items-center gap-1 mb-1" style={{ color: TAB_CONFIG[msg.type]?.color?.replace("text-", "") || "#25D366" }}>
                  <span className={cn("text-[9px] font-bold uppercase tracking-wider", TAB_CONFIG[msg.type]?.color || "text-success")}>
                    {msg.type}
                  </span>
                </div>
                <p className="text-white text-[13px] leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                <div className="flex items-center gap-1 mt-1 justify-end">
                  <span className="text-[10px] text-white/40">{msg.timestamp}</span>
                  <Send size={10} className="text-[#53BDEB]" />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Separator className="bg-border" />

      {/* Input */}
      <div className="p-4 space-y-3 rounded-b-xl">
        <textarea
          value={message}
          onChange={e => setMessage(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) handleSend(); }}
          placeholder={`Type your ${activeTab} message... (Ctrl+Enter to send)`}
          className="w-full bg-surface-2 border border-border rounded-xl p-3 text-xs h-20 focus:outline-none focus:ring-1 focus:ring-primary resize-none font-sans pointer-events-auto placeholder:text-text-muted transition-all"
        />
        <Button
          onClick={handleSend}
          className="w-full bg-primary text-white font-black uppercase tracking-widest text-[10px] h-10 shadow-lg shadow-primary/20 hover:bg-primary-dark pointer-events-auto"
        >
          <Send size={12} className="mr-2" /> Dispatch Communication
        </Button>
      </div>
    </div>
  );
}
