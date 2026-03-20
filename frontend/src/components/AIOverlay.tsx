"use client";

import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import { 
  X, 
  GripVertical, 
  BrainCircuit, 
  Mic2, 
  MessageSquare, 
  TrendingUp, 
  TrendingDown, 
  Zap,
  Terminal
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface AIOverlayProps {
  activeLead?: { name: string; phone: string } | null;
  callActive: boolean;
  onClose?: () => void;
}

export default function AIOverlay({ activeLead, callActive, onClose }: AIOverlayProps) {
  const [transcription, setTranscription] = useState<string[]>([]);
  const [sentiment, setSentiment] = useState<"POSITIVE" | "NEGATIVE" | "NEUTRAL">("NEUTRAL");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [script, setScript] = useState<string | null>(null);
  const [position, setPosition] = useState({ x: 200, y: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ offsetX: number, offsetY: number } | null>(null);

  useEffect(() => {
    if (callActive) {
      setScript("PROMPT: 'Hello, I'm calling from Alpha CRM. I noticed your interest in our hyper-scale solutions. Do you have a moment?'");
      const interval = setInterval(() => {
        const phrases = [
          "Yes, I'm looking for a CRM solution.",
          "We have about 50 agents currently.",
          "Our main pain point is data silos.",
          "How does your pricing look for enterprise?",
          "Can we integrate with our existing setup?",
        ];
        const randomPhrase = phrases[Math.floor(Math.random() * phrases.length)];
        setTranscription(prev => [...prev, randomPhrase].slice(-4));
        
        if (randomPhrase.includes("pricing")) setSentiment("NEUTRAL");
        if (randomPhrase.includes("pain point")) setSentiment("NEGATIVE");
        if (randomPhrase.includes("CRM solution")) setSentiment("POSITIVE");

        setSuggestions([
          "Explain Hybrid JSONB storage",
          "Offer POC deploy",
          "Mention Whisper-V3 inference",
        ]);
      }, 4000);
      return () => clearInterval(interval);
    } else {
      setTranscription([]);
      setSentiment("NEUTRAL");
      setSuggestions([]);
      setScript(null);
    }
  }, [callActive]);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    const rect = (e.currentTarget as HTMLElement).parentElement?.getBoundingClientRect();
    if (rect) {
      dragRef.current = {
        offsetX: e.clientX - rect.left,
        offsetY: e.clientY - rect.top,
      };
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (isDragging && dragRef.current) {
        setPosition({
          x: e.clientX - dragRef.current.offsetX,
          y: e.clientY - dragRef.current.offsetY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsDragging(false);
      dragRef.current = null;
    };

    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  if (!callActive && !activeLead) return null;

  return (
    <div 
      style={{ left: `${position.x}px`, top: `${position.y}px` }}
      className={cn(
        "fixed w-80 bg-surface/95 text-foreground border border-border shadow-2xl z-[90] font-sans flex flex-col backdrop-blur-xl select-none transition-all rounded-xl overflow-hidden",
        isDragging ? 'shadow-primary/20 scale-[1.02] border-primary/50' : 'shadow-black/50',
        isDragging ? 'cursor-grabbing' : ''
      )}
    >
      {/* Draggable Header */}
      <div 
        onMouseDown={handleMouseDown}
        className="p-3 bg-surface-2/50 border-b border-border flex justify-between items-center cursor-grab active:cursor-grabbing hover:bg-surface-2 transition-colors"
      >
        <div className="flex items-center space-x-2">
          <BrainCircuit size={16} className="text-primary animate-pulse" />
          <span className="text-[10px] font-black tracking-[0.2em] uppercase text-text-muted">AI CO-PILOT // V3</span>
        </div>
        <div className="flex items-center space-x-2">
           <Button variant="ghost" size="icon" onClick={onClose} className="h-6 w-6 text-text-muted hover:text-white hover:bg-white/10">
             <X size={14} />
           </Button>
        </div>
      </div>

      <div className="p-4 space-y-4 max-h-[70vh] overflow-y-auto">
        {/* Dynamic Talk Track */}
        {script && (
          <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-1 opacity-20">
               <Zap size={24} className="text-primary" />
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-1">Talk-Track Script</p>
            <p className="text-[11px] font-medium leading-relaxed italic text-foreground/90">
              {script}
            </p>
          </div>
        )}

        {/* Real-time Transcription */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
              <Mic2 size={10}/> Transcription
            </p>
            <span className="text-[8px] bg-success/20 text-success px-1.5 py-0.5 rounded font-black">LIVE</span>
          </div>
          <div className="bg-background/50 p-3 rounded-lg border border-border min-h-[100px] flex flex-col justify-end">
            {transcription.length === 0 ? (
              <span className="text-text-muted text-[10px] italic font-mono uppercase tracking-widest opacity-50">LISTENING FOR INBOUND...</span>
            ) : (
              transcription.map((line, i) => (
                <div key={i} className="text-[11px] mb-2 leading-relaxed animate-in fade-in slide-in-from-left-2 transition-all flex gap-3">
                  <span className="text-primary font-black text-[9px] shrink-0 mt-0.5 uppercase tracking-tighter">LEAD:</span>
                  <span className="text-foreground/80 font-medium">{line}</span>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Analytics Section */}
        <div className="grid grid-cols-2 gap-2">
           <div className="bg-surface-2 p-3 rounded-lg border border-border flex flex-col justify-center items-center text-center">
               <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Sentiment</p>
               <div className="flex items-center gap-2">
                  {sentiment === 'POSITIVE' && <TrendingUp size={14} className="text-success" />}
                  {sentiment === 'NEGATIVE' && <TrendingDown size={14} className="text-destructive" />}
                  <span className={cn(
                    "text-xs font-black uppercase tracking-tighter",
                    sentiment === 'POSITIVE' ? 'text-success' : sentiment === 'NEGATIVE' ? 'text-destructive' : 'text-text-muted'
                  )}>{sentiment}</span>
               </div>
           </div>
           
           <div className="bg-surface-2 p-3 rounded-lg border border-border flex flex-col justify-center items-center text-center">
               <p className="text-[8px] font-black text-text-muted uppercase tracking-widest mb-1">Probability</p>
               <span className="text-xs font-black text-foreground">84% // HIGH</span>
           </div>
        </div>

        {/* Generative Suggestions */}
        <div className="space-y-2">
          <p className="text-[9px] font-black text-text-muted uppercase tracking-widest flex items-center gap-1">
            <Zap size={10}/> AI Context Suggestions
          </p>
          <div className="flex flex-col gap-1.5">
             {suggestions.map((s, i) => (
                <button key={i} className="w-full text-left bg-surface-2 hover:bg-primary/10 border border-border hover:border-primary/30 p-2 rounded-md text-[9px] font-bold text-foreground transition-all flex items-center gap-2 group">
                    <span className="h-1 w-1 rounded-full bg-primary group-hover:scale-150 transition-transform" />
                    {s}
                </button>
             ))}
             {suggestions.length === 0 && <span className="text-text-muted text-[10px] font-mono">WAITING FOR CONTEXT...</span>}
          </div>
        </div>
      </div>

      <div className="p-2.5 bg-surface-2/80 border-t border-border flex items-center justify-between text-[8px] text-text-muted font-bold tracking-widest uppercase">
        <div className="flex items-center gap-2">
           <Terminal size={10} className="text-primary"/> 
           <span>Neural Core Active</span>
        </div>
        <span>124ms Latency</span>
      </div>
    </div>
  );
}
