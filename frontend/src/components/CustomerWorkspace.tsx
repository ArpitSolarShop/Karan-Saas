"use client";

import { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { 
  Phone, 
  Video, 
  MoreVertical, 
  X, 
  Send, 
  Plus, 
  Paperclip, 
  MessageSquare, 
  Mail, 
  MessageCircle,
  CheckCheck,
  Database
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CustomerWorkspaceProps {
  isOpen: boolean;
  onClose: () => void;
  activeLead: any;
  onCall?: () => void;
}

export default function CustomerWorkspace({ isOpen, onClose, activeLead, onCall }: CustomerWorkspaceProps) {
  const [channelTab, setChannelTab] = useState<"whatsapp" | "sms" | "email" | "quotes">("whatsapp");
  const [message, setMessage] = useState("");
  const [resolvedLeadId, setResolvedLeadId] = useState<string | null>(null);
  const [score, setScore] = useState(activeLead?.score || 0);
  const effectiveLeadId = resolvedLeadId || activeLead?.id;

  useEffect(() => {
    setResolvedLeadId(null);
    setScore(activeLead?.score || 0);
  }, [activeLead?.id, activeLead?.score]);

  const { data: activities } = useSWR(effectiveLeadId ? `/activities/lead/${effectiveLeadId}` : null, fetcher);
  const { data: quotes, isLoading: quotesLoading } = useSWR(effectiveLeadId ? `/quotes/lead/${effectiveLeadId}` : null, fetcher);

  const updateScore = async (newScore: number) => {
    setScore(newScore);
    if (!effectiveLeadId) return;
    try {
      await api.patch(`/leads/${effectiveLeadId}`, { score: newScore });
      mutate(`/sheets/sheet-001/rows`); // refresh grid if open
    } catch (err) { console.error("Failed to update score", err); }
  };

  const handleSendMessage = async () => {
    if (!message || !activeLead) return;
    try {
      const response = await api.post('/communications/send', {
        leadId: activeLead.id,
        userId: 'SYSTEM',
        type: channelTab.toUpperCase(),
        message: message
      });
      
      const newLeadId = response.data.leadId;
      if (newLeadId && newLeadId !== effectiveLeadId) {
        setResolvedLeadId(newLeadId);
      }

      setMessage("");
      mutate(`/activities/lead/${newLeadId || effectiveLeadId}`);
    } catch (err) {
      console.error("Failed to send message:", err);
    }
  };

  if (!isOpen || !activeLead) return null;

  return (
    <div className="fixed top-0 right-0 w-[500px] h-screen bg-surface border-l border-border z-[100] flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      {/* Premium Header */}
      <header className="px-6 py-4 bg-surface border-b border-border flex items-center justify-between shrink-0">
        <div className="flex items-center space-x-4">
          <Avatar className="h-10 w-10 border border-border">
            <AvatarImage src={`https://avatar.vercel.sh/${activeLead.name || 'user'}.png`} />
            <AvatarFallback className="bg-primary/20 text-primary font-bold">
              {(activeLead.name || "U").charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="text-sm font-black text-foreground uppercase tracking-tight">
              {activeLead.name || activeLead.firstName || "Unknown Entity"}
            </h2>
            <div className="flex items-center space-x-2">
              <span className="h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
              <span className="text-[10px] text-text-muted font-bold uppercase tracking-widest">
                {activeLead.status || "IDLE"} // SYNCED
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="icon" onClick={onCall} className="text-text-muted hover:text-primary">
            <Phone size={18} />
          </Button>
          <Button variant="ghost" size="icon" className="text-text-muted hover:text-primary">
            <Video size={18} />
          </Button>
          <Separator orientation="vertical" className="h-4 bg-border mx-2" />
          <Button variant="ghost" size="icon" onClick={onClose} className="text-text-muted hover:text-foreground bg-surface-2 rounded-full h-8 w-8">
            <X size={18} />
          </Button>
        </div>
      </header>

      {/* Lead Score Editor */}
      <div className="px-6 py-3 bg-surface-2 border-b border-border flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">Lead Score</span>
        <div className="flex items-center gap-3">
           <input 
             type="range" 
             min="0" 
             max="100" 
             value={score} 
             onChange={e => setScore(parseInt(e.target.value))}
             onMouseUp={e => updateScore(parseInt((e.target as HTMLInputElement).value))}
             onTouchEnd={e => updateScore(parseInt((e.target as HTMLInputElement).value))}
             className="w-32 h-1 bg-border rounded-lg appearance-none cursor-pointer accent-primary"
           />
           <span className="text-xs font-black tabular-nums min-w-[30px] text-right text-primary">{score}</span>
        </div>
      </div>

      {/* Message Ledger / Quotes */}
      <ScrollArea className="flex-grow bg-[#09090B] px-6 py-4">
         {/* Tabs for Activity / Quotes */}
         <div className="flex items-center gap-4 mb-6 border-b border-border pb-2">
            <button
               onClick={() => setChannelTab("whatsapp" as any)}
               className={cn("text-xs font-black uppercase tracking-widest pb-2 -mb-[9px] border-b-2 transition-all", 
                  ["whatsapp", "sms", "email"].includes(channelTab) ? "text-primary border-primary" : "text-text-muted border-transparent hover:text-foreground"
               )}
            >
               Activity
            </button>
            <button
               onClick={() => setChannelTab("quotes" as any)}
               className={cn("text-xs font-black uppercase tracking-widest pb-2 -mb-[9px] border-b-2 transition-all", 
                  channelTab === "quotes" ? "text-primary border-primary" : "text-text-muted border-transparent hover:text-foreground"
               )}
            >
               Quotes
            </button>
         </div>

         {channelTab === "quotes" ? (
            <div className="space-y-4">
               {quotesLoading ? (
                  <p className="text-[10px] text-text-muted uppercase text-center py-8 font-mono animate-pulse">Loading Quotes...</p>
               ) : quotes?.length === 0 ? (
                  <p className="text-[10px] text-text-muted uppercase tracking-[0.2em] text-center py-8">No Quotes Generated</p>
               ) : (
                  quotes?.map((q: any) => (
                     <div key={q.id} className="bg-surface-2 border border-border p-4 rounded-xl shadow-md space-y-3">
                        <div className="flex justify-between items-start">
                           <div>
                              <p className="text-xs font-black uppercase tracking-tight text-primary">Quote {q.version}</p>
                              <p className="text-[9px] font-mono text-text-muted">{new Date(q.createdAt).toLocaleDateString()}</p>
                           </div>
                           <span className="text-[9px] font-bold uppercase tracking-widest bg-surface border border-border px-2 py-0.5 rounded-full">{q.status}</span>
                        </div>
                        <div className="flex justify-between items-end">
                           <p className="text-sm font-black tabular-nums">₹{q.totalValue.toLocaleString()}</p>
                           <Button 
                              size="sm" 
                              variant="outline"
                              className="h-7 text-[9px] uppercase font-black tracking-widest border-primary/50 text-primary hover:bg-primary hover:text-white"
                              onClick={() => {
                                 window.open(`${api.defaults.baseURL || 'http://localhost:3001'}/quotes/${q.id}/pdf`, '_blank');
                              }}
                           >
                              Download PDF
                           </Button>
                        </div>
                     </div>
                  ))
               )}
            </div>
         ) : (
           <div className="flex flex-col space-y-6">
              <div className="flex justify-center">
                <span className="bg-surface-2 text-text-muted text-[9px] font-black py-1 px-4 rounded-full border border-border uppercase tracking-[0.2em] shadow-sm">
                  Session Start // {new Date().toLocaleDateString()}
                </span>
              </div>
              
              {activities
                ?.filter((a: any) => ['WHATSAPP', 'SMS', 'EMAIL'].includes(a.type))
                .sort((a: any, b: any) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime())
                .map((msg: any) => {
                  const isOutgoing = msg.userId === 'SYSTEM';
                  return (
                    <div key={msg.id} className={cn("flex flex-col max-w-[80%]", isOutgoing ? 'self-end items-end' : 'self-start items-start')}>
                      <div className={cn(
                        "group relative px-4 py-3 min-w-[140px] rounded-2xl shadow-md",
                        isOutgoing 
                          ? 'bg-primary text-white rounded-tr-none' 
                          : 'bg-surface-2 text-foreground border border-border rounded-tl-none'
                      )}>
                        {/* Channel Tag */}
                        <div className={cn("flex items-center space-x-1 mb-1.5", isOutgoing ? 'text-white/60' : 'text-text-muted')}>
                          {msg.type === 'WHATSAPP' && <MessageCircle size={10} />}
                          {msg.type === 'EMAIL' && <Mail size={10} />}
                          {msg.type === 'SMS' && <MessageSquare size={10} />}
                          <span className="text-[8px] font-black uppercase tracking-widest">{msg.type}</span>
                        </div>
                        
                        <p className="text-xs font-medium leading-relaxed whitespace-pre-wrap break-words">
                          {msg.description.replace(/^Sent (WHATSAPP|SMS|EMAIL): /, '')}
                        </p>
                        
                        <div className={cn(
                          "flex items-center space-x-1 mt-2 justify-end",
                          isOutgoing ? 'text-white/60' : 'text-text-muted'
                        )}>
                          <span className="text-[8px] font-bold">
                            {new Date(msg.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </span>
                          {isOutgoing && <CheckCheck size={10} className="text-white" />}
                        </div>
                      </div>
                    </div>
                  );
              })}
           </div>
         )}
      </ScrollArea>

      {/* Omni-Channel Input Terminal */}
      {channelTab !== "quotes" && (
        <footer className="shrink-0 bg-surface border-t border-border p-6 space-y-4">
           <div className="flex items-center space-x-2">
            {["whatsapp", "sms", "email"].map((t) => (
              <Button
                key={t}
                variant={channelTab === t ? "default" : "outline"}
                size="sm"
                onClick={() => setChannelTab(t as any)}
                className={cn(
                  "text-[9px] font-black uppercase tracking-widest h-7 px-3",
                  channelTab === t ? "bg-primary text-white" : "border-border text-text-muted"
                )}
              >
                {t}
              </Button>
            ))}
         </div>

         <div className="relative bg-surface-2 border border-border rounded-xl focus-within:ring-1 focus-within:ring-primary transition-all p-3 flex items-end">
            <Button variant="ghost" size="icon" className="h-8 w-8 text-text-muted shrink-0 mr-1">
              <Plus size={20} />
            </Button>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Send ${channelTab} message...`}
              className="flex-grow bg-transparent text-xs font-medium outline-none border-0 resize-none h-8 max-h-32 mb-1.5 text-foreground placeholder:text-text-muted"
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <Button 
              size="icon"
              disabled={!message.trim()}
              onClick={handleSendMessage}
              className={cn(
                "h-9 w-9 rounded-xl shrink-0 ml-2 transition-all shadow-lg shadow-primary/20",
                message.trim() ? "bg-primary text-white scale-100" : "bg-muted text-text-muted scale-95"
              )}
            >
              <Send size={18} />
            </Button>
         </div>
         
         <div className="flex justify-between items-center text-[8px] font-bold text-text-muted uppercase tracking-[0.2em] px-1">
            <span>Core Comm Engaged</span>
            <span className="flex items-center gap-1">
              <Database size={8}/> Latency: 14ms
            </span>
         </div>
      </footer>
      )}
    </div>
  );
}
