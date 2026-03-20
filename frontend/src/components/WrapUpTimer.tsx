"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { Phone, Clock, X } from "lucide-react";

interface WrapUpTimerProps {
  onComplete?: () => void;
  onSkip?: () => void;
  duration?: number; // seconds, default 30
}

export function WrapUpTimer({ onComplete, onSkip, duration = 30 }: WrapUpTimerProps) {
  const [remaining, setRemaining] = useState(duration);
  const [disposed, setDisposed] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setRemaining(r => {
        if (r <= 1) {
          clearInterval(intervalRef.current);
          onComplete?.();
          return 0;
        }
        return r - 1;
      });
    }, 1000);
    return () => clearInterval(intervalRef.current);
  }, [onComplete]);

  const pct = ((duration - remaining) / duration) * 100;
  const urgent = remaining <= 10;
  const circumference = 2 * Math.PI * 36;
  const offset = circumference - (circumference * pct) / 100;

  if (disposed) return null;

  return (
    <div className="fixed bottom-24 right-6 z-[100] bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 p-4 w-60">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-1.5">
          <Clock size={12} className={cn(urgent ? "text-red-400 animate-pulse" : "text-amber-400")} />
          <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Wrap-Up Time</span>
        </div>
        <button onClick={() => { setDisposed(true); onSkip?.(); }} className="text-text-muted hover:text-foreground">
          <X size={14} />
        </button>
      </div>

      {/* Ring timer */}
      <div className="flex flex-col items-center gap-2">
        <div className="relative w-20 h-20">
          <svg className="w-20 h-20 -rotate-90" viewBox="0 0 80 80">
            <circle cx="40" cy="40" r="36" fill="none" stroke="currentColor" strokeWidth="6" className="text-surface-2" />
            <circle
              cx="40" cy="40" r="36" fill="none"
              stroke={urgent ? "#ef4444" : "#f59e0b"}
              strokeWidth="6" strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              className="transition-all duration-1000"
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className={cn("text-xl font-black tabular-nums", urgent ? "text-red-400" : "text-amber-400")}>{remaining}</span>
          </div>
        </div>

        <p className="text-xs text-text-muted text-center">Add notes before next call</p>

        <div className="flex gap-2 w-full mt-1">
          <button
            onClick={() => { setDisposed(true); onSkip?.(); }}
            className="flex-1 py-1.5 text-[10px] font-black uppercase border border-border rounded-lg text-text-muted hover:text-foreground transition"
          >
            Skip
          </button>
          <button
            onClick={() => { clearInterval(intervalRef.current); setDisposed(true); onComplete?.(); }}
            className="flex-1 py-1.5 text-[10px] font-black uppercase border border-primary/30 rounded-lg bg-primary/10 text-primary hover:bg-primary/20 transition"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
