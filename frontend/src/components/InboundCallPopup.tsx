"use client";

import { useState, useEffect } from "react";
import { useSocket } from "@/hooks/useTelephonySocket";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Phone, PhoneOff, PhoneIncoming, User, X } from "lucide-react";

interface InboundCallData {
  callUUID: string;
  from: string;
  leadId?: string;
  leadName?: string;
  campaignId?: string;
}

export function InboundCallPopup() {
  const [inbound, setInbound] = useState<InboundCallData | null>(null);
  const [ringing, setRinging] = useState(false);
  const socket = useSocket();

  useEffect(() => {
    if (!socket) return;

    socket.on("inboundCall", (data: InboundCallData) => {
      setInbound(data);
      setRinging(true);
    });

    socket.on("callAnswered", () => { setRinging(false); });
    socket.on("callEnded", () => { setInbound(null); setRinging(false); });

    return () => {
      socket.off("inboundCall");
      socket.off("callAnswered");
      socket.off("callEnded");
    };
  }, [socket]);

  async function answer() {
    if (!inbound) return;
    try {
      await api.post("/telephony/answer", { callUUID: inbound.callUUID });
    } catch {}
    setRinging(false);
  }

  async function reject() {
    if (!inbound) return;
    try {
      await api.post("/telephony/hangup", { callUUID: inbound.callUUID });
    } catch {}
    setInbound(null);
    setRinging(false);
  }

  if (!inbound) return null;

  return (
    <div className={cn(
      "fixed bottom-24 right-6 z-[200] w-72 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/50 overflow-hidden transition-all",
      ringing && "animate-pulse-ring"
    )}>
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600/20 to-green-500/5 border-b border-border px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <PhoneIncoming size={14} className="text-green-400 animate-bounce" />
          <span className="text-[10px] font-black uppercase tracking-wider text-green-400">Incoming Call</span>
        </div>
        <button onClick={reject} className="text-text-muted hover:text-red-400 transition"><X size={14} /></button>
      </div>

      {/* Caller info */}
      <div className="px-4 py-4 flex items-center gap-3">
        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-500/20 to-green-400/5 border border-green-500/20 flex items-center justify-center">
          <User size={20} className="text-green-400" />
        </div>
        <div>
          <p className="font-bold text-sm">{inbound.leadName || inbound.from}</p>
          <p className="text-[11px] text-text-muted font-mono">{inbound.from}</p>
          {inbound.campaignId && <p className="text-[10px] text-text-muted mt-0.5">Campaign call</p>}
        </div>
      </div>

      {/* Ringing indicator */}
      <div className="flex justify-center gap-1 pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="w-1.5 h-1.5 rounded-full bg-green-400"
            style={{ animationDelay: `${i * 0.2}s`, animation: "bounce 1s infinite" }}
          />
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 p-3 border-t border-border">
        <button
          onClick={reject}
          className="flex-1 flex items-center justify-center gap-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl py-2.5 hover:bg-red-500/20 transition font-bold text-xs"
        >
          <PhoneOff size={14} /> Reject
        </button>
        <button
          onClick={answer}
          className="flex-1 flex items-center justify-center gap-2 bg-green-500/10 border border-green-500/20 text-green-400 rounded-xl py-2.5 hover:bg-green-500/20 transition font-bold text-xs"
        >
          <Phone size={14} /> Answer
        </button>
      </div>
    </div>
  );
}
