"use client";

import { useState, useEffect, useRef } from "react";
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
  Terminal
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface SoftphoneProps {
  onCallEnd?: (duration: number) => void;
  onCallStart?: () => void;
}

export default function Softphone({ onCallStart, onCallEnd }: SoftphoneProps) {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [callStatus, setCallStatus] = useState<"IDLE" | "CONNECTING" | "INCALL" | "HELD">("IDLE");
  const [timer, setTimer] = useState(0);
  const [visible, setVisible] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

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

  const handleDial = () => {
    if (!phoneNumber) return;
    setCallStatus("CONNECTING");
    onCallStart?.();
    
    setTimeout(() => {
      setCallStatus("INCALL");
    }, 2000);
  };

  const handleHangup = () => {
    const finalDuration = timer;
    setCallStatus("IDLE");
    onCallEnd?.(finalDuration);
  };

  const addDigit = (digit: string) => {
    setPhoneNumber((prev) => prev + digit);
  };

  return (
    <>
      {/* Floating Toggle Trigger */}
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

      {/* Main Voice Terminal UI */}
      {visible && (
        <div className="fixed bottom-32 right-10 w-80 bg-surface/95 border border-border shadow-2xl z-[100] flex flex-col font-sans backdrop-blur-xl rounded-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-6 duration-500">
          <header className="bg-surface-2 p-4 flex justify-between items-center border-b border-border">
            <div className="flex items-center space-x-2">
              <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
              <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">Voice Station 01</span>
            </div>
            <Button variant="ghost" size="icon" onClick={() => setVisible(false)} className="h-6 w-6 text-text-muted hover:text-white">
              <X size={14} />
            </Button>
          </header>

          <div className="p-6 space-y-6">
            {/* Call Display Panel */}
            <div className="bg-surface-2 border border-border rounded-xl p-4 flex flex-col items-center justify-center min-h-[100px] shadow-inner relative overflow-hidden">
              <div className="absolute top-0 right-0 p-2 opacity-10">
                 <Signal size={40} className="text-primary" />
              </div>
              
              {callStatus === "IDLE" ? (
                <div className="w-full space-y-1">
                  <p className="text-[8px] font-black text-text-muted uppercase tracking-widest text-center mb-1">Inbound/Outbound Route</p>
                  <input 
                    type="text" 
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    placeholder="DIAL CODE..."
                    className="bg-transparent text-center text-2xl font-black w-full outline-none text-foreground placeholder:text-surface-2"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center space-y-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-primary text-[9px] font-black uppercase tracking-widest animate-pulse">
                      {callStatus === "CONNECTING" ? "LINKING..." : "LIVE SESSION"}
                    </span>
                    <span className="text-text-muted text-[9px] tracking-widest">// HD AUDIO</span>
                  </div>
                  <span className="text-2xl font-black text-foreground tracking-tighter">{phoneNumber || "UNKNOWN ID"}</span>
                  {callStatus === "INCALL" && (
                    <div className="bg-primary/10 text-primary border border-primary/20 px-3 py-0.5 rounded-full text-[10px] font-black tabular-nums">
                      {formatTime(timer)}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Premium Keypad */}
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

            {/* In-Call Controls */}
            {callStatus === "INCALL" && (
              <div className="grid grid-cols-3 gap-4 pb-2">
                 {[
                   { icon: Mic2, label: 'MUTE' },
                   { icon: Volume2, label: 'SPEAKER' },
                   { icon: Hash, label: 'KEYPAD' },
                   { icon: Phone, label: 'HOLD' },
                   { icon: Video, label: 'VIDEO' },
                   { icon: ChevronDown, label: 'MORE' },
                 ].map((ctrl, i) => (
                   <div key={i} className="flex flex-col items-center space-y-1">
                      <Button variant="outline" size="icon" className="h-10 w-10 border-border bg-surface-2 text-text-muted hover:text-primary rounded-full">
                        <ctrl.icon size={16} />
                      </Button>
                      <span className="text-[8px] font-black text-text-muted uppercase tracking-tighter">{ctrl.label}</span>
                   </div>
                 ))}
              </div>
            )}

            {/* Primary Action Button */}
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
               <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Core-SIP Engine // Active</span>
            </div>
            <div className="flex space-x-1">
               <div className="h-1.5 w-1.5 rounded-full bg-success" />
               <div className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
               <div className="h-1.5 w-1.5 rounded-full bg-success" />
            </div>
          </footer>
        </div>
      )}
    </>
  );
}
