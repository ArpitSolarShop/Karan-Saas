"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { 
  Phone, 
  PhoneOff, 
  X, 
  Delete, 
  Hash, 
  Mic2, 
  Volume2, 
  Signal,
  Video,
  ChevronDown,
  Terminal,
  MicOff,
  VolumeX,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { io, Socket } from "socket.io-client";
import { UserAgent, Invitation, Session, SessionState } from "sip.js";

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

interface SoftphoneProps {
  agentId?: string;
  onCallEnd?: (duration: number) => void;
  onCallStart?: (data: any) => void;
}

export default function Softphone({ agentId, onCallStart, onCallEnd }: SoftphoneProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStatus, setCallStatus] = useState<"IDLE" | "CONNECTING" | "INCALL" | "HELD" | "RINGING">("IDLE");
  const [timer, setTimer] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isSpeaker, setIsSpeaker] = useState(false);
  
  const socketRef = useRef<Socket | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const uaRef = useRef<UserAgent | null>(null);
  const sessionRef = useRef<Session | null>(null);

  // ── Signaling Setup ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!agentId) return;

    const socket = io(`${API_URL}/telephony`);
    socketRef.current = socket;

    socket.on("connect", () => {
      socket.emit("join_room", { roomId: `agent:${agentId}` });
    });

    socket.on("call:status", (data: any) => {
      console.log("[Softphone] Received Status:", data.status);
      setCallStatus(data.status);
      if (data.status === "INCALL") onCallStart?.(data);
      if (data.status === "IDLE") onCallEnd?.(timer);
    });

    return () => {
      socket.disconnect();
    };
  }, [agentId]);

  // ── Call Timer ─────────────────────────────────────────────────────────────
  useEffect(() => {
    if (callStatus === "INCALL") {
      timerRef.current = setInterval(() => {
        setTimer((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      if (callStatus === "IDLE") setTimer(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callStatus]);

  const formatTime = (s: number) => {
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };

  // ── Actions ────────────────────────────────────────────────────────────────
  const handleDial = useCallback(() => {
    if (!phoneNumber || !socketRef.current) return;
    setCallStatus("CONNECTING");
    
    // Emit to signaling gateway
    socketRef.current.emit("call:initiate", {
      to: phoneNumber,
      agentId,
      metadata: { source: "MANUAL_DIAL" }
    });

    // MOCK MODE FALLBACK: If no SIP server, auto-connect after 2s
    setTimeout(() => {
      if (callStatus === "CONNECTING") {
        setCallStatus("INCALL");
        onCallStart?.({ to: phoneNumber });
      }
    }, 2000);
  }, [phoneNumber, agentId, onCallStart, callStatus]);

  const handleHangup = useCallback(() => {
    if (!socketRef.current) return;
    socketRef.current.emit("call:hangup", { agentId, callId: "current" });
    setCallStatus("IDLE");
    onCallEnd?.(timer);
  }, [agentId, onCallEnd, timer]);

  const addDigit = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  return (
    <>
      <Button 
        onClick={() => setVisible(!visible)}
        size="icon"
        className={cn(
          "fixed bottom-10 right-10 w-16 h-16 rounded-full shadow-2xl z-[100] transition-all hover:scale-110 active:scale-95 group",
          callStatus === "INCALL" ? "bg-destructive animate-pulse" : "bg-primary"
        )}
      >
        {callStatus === "INCALL" ? (
          <PhoneOff size={24} className="text-white" />
        ) : (
          <Phone size={24} className="text-white group-hover:rotate-12 transition-transform" />
        )}
      </Button>

      {visible && (
        <div className="fixed bottom-32 right-10 w-80 bg-surface/95 border border-border shadow-2xl z-[100] flex flex-col font-sans backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
          <header className="bg-surface-2 p-4 flex justify-between items-center border-b border-border">
            <div className="flex items-center space-x-2">
              <div className={cn("h-2 w-2 rounded-full", callStatus === "IDLE" ? "bg-success" : "bg-primary animate-pulse")} />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">
                {agentId ? `STATION: ${agentId}` : "OFFLINE"}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setVisible(false)} className="h-6 w-6 text-text-muted hover:text-white">
              <X size={14} />
            </Button>
          </header>

          <div className="p-6 space-y-6">
            <div className="bg-surface-2 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px] shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Signal size={40} className="text-primary" />
              </div>
              
              {callStatus === "IDLE" ? (
                <div className="w-full space-y-1">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center mb-1">Enter Destination</p>
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="DIAL..."
                    className="bg-transparent text-center text-2xl font-black w-full outline-none text-foreground placeholder:text-surface-2"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest animate-pulse">
                      {callStatus === "CONNECTING" ? "LINKING..." : callStatus === "RINGING" ? "RINGING..." : "LIVE SESSION"}
                    </span>
                    <span className="text-text-muted text-[9px] tracking-widest">// OP: {agentId}</span>
                  </div>
                  <span className="text-2xl font-black text-foreground tracking-tighter">{phoneNumber || "PRIVATE ID"}</span>
                  {callStatus === "INCALL" && (
                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full text-[10px] font-black tabular-nums">
                      {formatTime(timer)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {callStatus === "IDLE" && (
              <div className="grid grid-cols-3 gap-3">
                {["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"].map((keyChar) => (
                  <Button 
                    key={keyChar} 
                    variant="outline"
                    onClick={() => addDigit(keyChar)}
                    className="h-12 border-border/50 bg-surface-2/50 text-foreground/80 hover:bg-primary hover:text-white hover:border-primary transition-all font-black text-sm rounded-lg"
                  >
                    {keyChar}
                  </Button>
                ))}
              </div>
            )}

            {callStatus === "INCALL" && (
              <div className="grid grid-cols-3 gap-4 pb-2">
                 {[
                   { icon: isMuted ? MicOff : Mic2, label: 'MUTE', active: isMuted, onClick: () => setIsMuted(!isMuted) },
                   { icon: isSpeaker ? Volume2 : VolumeX, label: 'SPEAKER', active: isSpeaker, onClick: () => setIsSpeaker(!isSpeaker) },
                   { icon: Hash, label: 'KEYPAD' },
                   { icon: Phone, label: 'HOLD' },
                   { icon: Video, label: 'VIDEO' },
                   { icon: ChevronDown, label: 'MORE' },
                 ].map((ctrl, i) => (
                   <div key={i} className="flex flex-col items-center space-y-1">
                      <Button 
                        variant="outline" size="icon" 
                        onClick={ctrl.onClick}
                        className={cn("h-10 w-10 border-border bg-surface-2 transition-colors", ctrl.active ? "text-primary border-primary bg-primary/10" : "text-text-muted hover:text-primary")}
                      >
                        <ctrl.icon size={16} />
                      </Button>
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{ctrl.label}</span>
                   </div>
                 ))}
              </div>
            )}

            <div className="flex space-x-3 pt-2">
              {callStatus === "IDLE" ? (
                <Button 
                  onClick={handleDial}
                  className="flex-grow bg-primary hover:bg-primary-dark text-white text-[10px] font-black tracking-[0.2em] uppercase h-12 shadow-lg shadow-primary/20"
                >
                  Initiate Secure Link
                </Button>
              ) : (
                <Button 
                  onClick={handleHangup}
                  className="flex-grow bg-destructive hover:bg-destructive/90 text-white text-[10px] font-black tracking-[0.2em] uppercase h-12 shadow-lg shadow-destructive/20"
                >
                  Terminate Link
                </Button>
              )}
              {callStatus === "IDLE" && phoneNumber && (
                <Button 
                  variant="outline" 
                  onClick={() => setPhoneNumber("")}
                  className="w-12 border-border bg-surface-2 hover:bg-surface-2/50 text-text-muted h-12"
                >
                  <Delete size={18} />
                </Button>
              )}
            </div>
          </div>

          <footer className="bg-surface-2 p-3 border-t border-border flex items-center justify-between">
            <div className="flex items-center space-x-2">
               <Terminal size={10} className="text-primary"/>
               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Core-Signal Engine // Online</span>
            </div>
            <div className="flex space-x-1">
               <div className={cn("h-1.5 w-1.5 rounded-full bg-success", socketRef.current?.connected && "animate-pulse")} />
               <div className="h-1.5 w-1.5 rounded-full bg-success" />
               <div className="h-1.5 w-1.5 rounded-full bg-success" />
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
