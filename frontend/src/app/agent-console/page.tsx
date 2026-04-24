"use client";

import { useState, useEffect, useCallback } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { 
  Users, 
  Phone, 
  MessageSquare, 
  History, 
  FileText, 
  Star, 
  Clock, 
  CheckCircle2, 
  AlertCircle,
  Play,
  Pause,
  StopCircle,
  ChevronRight,
  Terminal,
  Cpu,
  Database,
  Activity,
  User,
  MapPin,
  Mail,
  Building,
  Calendar,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Softphone } from "@/components/telecalling/Softphone";
import { useCallStore } from "@/stores/useCallStore";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/context/AuthContext";

export default function AgentConsole() {
  const { user } = useAuth();
  const [activeCall, setActiveCall] = useState<any>(null);
  const [callDuration, setCallDuration] = useState(0);
  const [scriptStep, setScriptStep] = useState("1");
  const [agentStatus, setAgentStatus] = useState<"AVAILABLE" | "ON_CALL" | "WRAP_UP" | "BREAK">("AVAILABLE");

  // Sync agent status with the global call store
  const storeActiveCall = useCallStore((s) => s.activeCall);
  useEffect(() => {
    if (storeActiveCall && storeActiveCall.status === 'connected') {
      setActiveCall({ startTime: Date.now() });
      setAgentStatus("ON_CALL");
    } else if (!storeActiveCall && activeCall) {
      setActiveCall(null);
      setAgentStatus("WRAP_UP");
    }
  }, [storeActiveCall]);

  // Synthetic data for demo if no active lead
  const currentLead = activeCall?.lead || {
    firstName: "John",
    lastName: "Doe",
    phone: "+1 (555) 012-3456",
    email: "john.doe@enterprise.com",
    company: "Global Tech Solutions",
    position: "Senior Procurement Manager",
    location: "San Francisco, CA",
    lastContact: "2 days ago",
    status: "INTERESTED"
  };

  const SCRIPT = {
    "1": {
      text: "Hello, am I speaking with {{firstName}} {{lastName}} from {{company}}?",
      options: [
        { label: "Yes, speaking", next: "2", variant: "default" },
        { label: "Wrong person", next: "wrong", variant: "outline" },
        { label: "Not available", next: "not-available", variant: "secondary" }
      ]
    },
    "2": {
      text: "Great! My name is {{agentName}} and I'm calling about our new enterprise CRM automation tools. Do you have 2 minutes to chat?",
      options: [
        { label: "Yes, tell me more", next: "3", variant: "default" },
        { label: "Busy right now", next: "callback", variant: "outline" },
        { label: "Not interested", next: "objection", variant: "secondary" }
      ]
    },
    "3": {
      text: "Excellent. We've helped companies like {{company}} reduce their manual data entry by 40%. Would you like to schedule a deep-dive demo next Tuesday?",
      options: [
        { label: "Schedule Demo", next: "close", variant: "default" },
        { label: "Send email info", next: "follow-up", variant: "outline" }
      ]
    },
    "close": {
      text: "Perfect! I've sent the invite to {{email}}. Is there anything else you'd like to ask before we wrap up?",
      options: [{ label: "End Successfully", next: "1", action: "end", variant: "default" }]
    }
  };

  const currentStep = (SCRIPT as any)[scriptStep] || SCRIPT["1"];

  const replacePlaceholders = (text: string) => {
    return text
      .replace("{{firstName}}", currentLead.firstName)
      .replace("{{lastName}}", currentLead.lastName)
      .replace("{{company}}", currentLead.company)
      .replace("{{email}}", currentLead.email)
      .replace("{{agentName}}", user?.firstName || "Agent");
  };

  return (
    <div className="flex flex-col h-screen bg-bg text-text font-sans overflow-hidden">
      {/* Top Banner // Stats */}
      <header className="h-14 bg-surface border-b border-border flex items-center justify-between px-6 shrink-0 z-50">
        <div className="flex items-center space-x-6">
           <div>
             <h1 className="text-lg font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-2">
               <Cpu size={18} className="text-primary"/> Agent Portal
             </h1>
             <p className="text-[8px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Console ID: {user?.id?.substring(0,8)} // SECURE-STATION</p>
           </div>
           
           <div className="flex items-center bg-surface-2 border border-border rounded-md px-3 py-1 cursor-pointer hover:bg-surface-2/50 transition-colors">
              <div className={cn("h-2 w-2 rounded-full mr-2 animate-pulse", 
                agentStatus === 'AVAILABLE' ? 'bg-success' : 
                agentStatus === 'ON_CALL' ? 'bg-primary' : 'bg-destructive'
              )} />
              <span className="text-[10px] font-black uppercase tracking-widest text-foreground">{agentStatus}</span>
           </div>
        </div>

        <div className="flex items-center space-x-12">
            <div className="flex space-x-8 h-full items-center">
                 <div className="text-center">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Calls Handled</p>
                    <p className="text-sm font-black text-foreground">24</p>
                 </div>
                 <div className="text-center border-l border-border pl-8">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Avg Talk Time</p>
                    <p className="text-sm font-black text-foreground">04:12</p>
                 </div>
                 <div className="text-center border-l border-border pl-8">
                    <p className="text-[8px] font-black text-text-muted uppercase tracking-widest">Conversion</p>
                    <p className="text-sm font-black text-success">15.8%</p>
                 </div>
            </div>
            
            <div className="flex gap-2">
               <Button size="sm" variant="outline" className="text-[9px] font-black uppercase tracking-widest border-border h-8">
                  <StopCircle size={12} className="mr-2 text-destructive"/> End Session
               </Button>
            </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left column: Lead Profile */}
        <aside className="w-80 bg-surface border-r border-border flex flex-col shrink-0 overflow-hidden">
           <div className="p-6 border-b border-border bg-surface-2/30">
              <div className="h-16 w-16 bg-primary/10 rounded-2xl border border-primary/20 flex items-center justify-center mb-4">
                 <User size={32} className="text-primary"/>
              </div>
              <h2 className="text-xl font-black tracking-tight text-foreground">{currentLead.firstName} {currentLead.lastName}</h2>
              <p className="text-[10px] font-black text-primary uppercase tracking-[0.1em]">{currentLead.position}</p>
              
              <div className="mt-4 flex gap-2">
                 <Badge variant="outline" className="bg-surface-2 border-border text-[9px] font-bold">{currentLead.status}</Badge>
                 <Badge variant="outline" className="bg-surface-2 border-border text-[9px] font-bold">VIP</Badge>
              </div>
           </div>

           <ScrollArea className="flex-1 px-6 py-6">
              <div className="space-y-6">
                 <section>
                    <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                       <MapPin size={10}/> Contact Intelligence
                    </h3>
                    <div className="space-y-3">
                       <div className="bg-surface-2 border border-border p-3 rounded-xl">
                          <label className="text-[8px] font-bold text-text-muted uppercase mb-1 block">Primary Phone</label>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-mono font-bold text-foreground">{currentLead.phone}</span>
                             <Phone size={12} className="text-primary"/>
                          </div>
                       </div>
                       <div className="bg-surface-2 border border-border p-3 rounded-xl">
                          <label className="text-[8px] font-bold text-text-muted uppercase mb-1 block">Corporate Email</label>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-mono font-bold text-foreground">{currentLead.email}</span>
                             <Mail size={12} className="text-text-muted"/>
                          </div>
                       </div>
                       <div className="bg-surface-2 border border-border p-3 rounded-xl">
                          <label className="text-[8px] font-bold text-text-muted uppercase mb-1 block">Organization</label>
                          <div className="flex justify-between items-center">
                             <span className="text-xs font-mono font-bold text-foreground">{currentLead.company}</span>
                             <Building size={12} className="text-text-muted"/>
                          </div>
                       </div>
                    </div>
                 </section>

                 <section>
                    <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                       <History size={10}/> Interaction Log
                    </h3>
                    <div className="space-y-3 relative before:absolute before:left-[11px] before:top-2 before:bottom-0 before:w-[1px] before:bg-border">
                       {[
                         { date: "Yesterday, 2:40 PM", type: "CALL", result: "NO ANSWER", icon: Phone },
                         { date: "Aug 12, 10:15 AM", type: "EMAIL", result: "OPENED", icon: Mail },
                         { date: "Aug 10, 4:22 PM", type: "SYSTEM", result: "LEAD CREATED", icon: Database },
                       ].map((item, i) => (
                         <div key={i} className="flex gap-4 relative">
                            <div className="h-[22px] w-[22px] rounded-full bg-surface-2 border border-border flex items-center justify-center shrink-0 z-10">
                               <item.icon size={10} className="text-text-muted"/>
                            </div>
                            <div>
                               <p className="text-[10px] font-bold text-foreground">{item.result}</p>
                               <p className="text-[8px] text-text-muted uppercase tracking-tighter">{item.date} // {item.type}</p>
                            </div>
                         </div>
                       ))}
                    </div>
                 </section>
              </div>
           </ScrollArea>
        </aside>

        {/* Center column: Dynamic Scripting & Actions */}
        <div className="flex-1 flex flex-col bg-background relative overflow-hidden">
           {/* Terminal Background Decor */}
           <div className="absolute inset-0 opacity-[0.03] pointer-events-none p-12 overflow-hidden flex flex-col font-mono text-[10px] select-none">
              {Array.from({length: 40}).map((_, i) => (
                <div key={i}>0x{i.toString(16).padStart(4, '0')} ACCESSING VOIP_CORE_v2.0... OK</div>
              ))}
           </div>

           <div className="h-10 bg-surface-2/50 border-b border-border flex items-center px-6 shrink-0 justify-between">
              <div className="flex gap-4">
                 <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-primary" />
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Dialer Session: #CAM-001</span>
                 </div>
                 <div className="flex items-center gap-2">
                    <span className="text-[9px] font-black uppercase tracking-widest text-text-muted">Mode: Power Dial</span>
                 </div>
              </div>
              <div className="flex items-center gap-1">
                 <Activity size={10} className="text-success mr-2"/>
                 <span className="text-[9px] font-mono text-success">ENCRYPTED BRIDGE ACTIVE</span>
              </div>
           </div>

           <div className="flex-1 p-12 flex flex-col justify-center max-w-3xl mx-auto w-full relative">
              <div className="mb-12">
                 <div className="flex items-center gap-3 mb-6">
                    <Terminal size={20} className="text-primary"/>
                    <h3 className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Interactive Script Protocol</h3>
                 </div>
                 
                 <div className="bg-surface p-8 rounded-3xl border border-border shadow-2xl relative">
                    <div className="absolute -top-3 -left-3 bg-primary text-white text-[10px] font-black h-8 w-8 flex items-center justify-center rounded-xl shadow-lg shadow-primary/20">
                       {scriptStep}
                    </div>
                    <p className="text-2xl font-black text-foreground leading-[1.4] tracking-tight">
                       {replacePlaceholders(currentStep.text)}
                    </p>
                 </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                 {currentStep.options.map((opt: any, i: number) => (
                   <Button 
                    key={i} 
                    variant={opt.variant} 
                    onClick={() => {
                      if (opt.action === "end") {
                        setScriptStep("1");
                        setAgentStatus("WRAP_UP");
                      } else {
                        setScriptStep(opt.next);
                      }
                    }}
                    className={cn(
                      "h-16 text-xs font-black uppercase tracking-[0.2em] rounded-2xl transition-all hover:scale-[1.02] active:scale-[0.98]",
                      opt.variant === "default" && "shadow-lg shadow-primary/20"
                    )}
                   >
                     {opt.label} <ChevronRight size={14} className="ml-2"/>
                   </Button>
                 ))}
              </div>
           </div>

           {/* Call Progress Strip */}
           <div className="h-16 bg-surface border-t border-border flex items-center px-8 shrink-0 justify-between">
              <div className="flex items-center gap-6">
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Call Status</span>
                    <span className="text-xs font-bold text-foreground">In Session</span>
                 </div>
                 <div className="h-8 w-[1px] bg-border" />
                 <div className="flex flex-col">
                    <span className="text-[8px] font-black text-text-muted uppercase tracking-widest">Duration</span>
                    <span className="text-xs font-mono font-bold text-primary">02:34</span>
                 </div>
              </div>

              <div className="flex gap-4">
                 <Button variant="outline" className="border-border rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest">
                    <Pause size={14} className="mr-2"/> Hold
                 </Button>
                 <Button variant="outline" className="border-border rounded-xl px-6 h-10 text-[10px] font-black uppercase tracking-widest">
                    <MessageSquare size={14} className="mr-2"/> Chat
                 </Button>
              </div>
           </div>
        </div>

        {/* Right column: Action Sidebar (Disposition) */}
        <aside className="w-84 bg-surface border-l border-border flex flex-col shrink-0">
           <Tabs defaultValue="disposition" className="flex flex-col h-full">
              <TabsList className="bg-surface border-b border-border h-12 rounded-none p-0 flex">
                 <TabsTrigger value="disposition" className="flex-1 rounded-none data-[state=active]:bg-surface-2 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none text-[9px] font-black uppercase tracking-[0.2em] h-full">Disposition</TabsTrigger>
                 <TabsTrigger value="history" className="flex-1 rounded-none data-[state=active]:bg-surface-2 data-[state=active]:border-b-2 data-[state=active]:border-primary transition-none text-[9px] font-black uppercase tracking-[0.2em] h-full">Context</TabsTrigger>
              </TabsList>
              
              <TabsContent value="disposition" className="flex-1 m-0 p-6 flex flex-col outline-none">
                 <div className="space-y-6">
                    <section>
                       <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4">Select Call Result</h3>
                       <div className="grid grid-cols-2 gap-2">
                          {["Connected", "Interested", "Follow Up", "Not Interested", "Wrong Number", "No Answer"].map(res => (
                            <Button key={res} variant="outline" className="h-12 border-border bg-surface-2 text-[9px] font-bold uppercase hover:border-primary hover:text-primary transition-all">
                               {res}
                            </Button>
                          ))}
                       </div>
                    </section>

                    <section>
                       <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-4 flex justify-between">
                          Notes <span>Shift+Enter to Save</span>
                       </h3>
                       <textarea 
                          className="w-full bg-surface-2 border border-border rounded-2xl p-4 text-xs text-foreground outline-none focus:ring-1 focus:ring-primary min-h-[160px] resize-none"
                          placeholder="Log call context here..."
                       />
                    </section>

                    <section className="bg-surface-2 border border-border rounded-2xl p-4">
                       <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3 flex items-center gap-2">
                          <AlertCircle size={10}/> Follow-up Reminder
                       </h3>
                       <div className="flex gap-2">
                          <Button variant="outline" size="sm" className="flex-1 border-border text-[9px] font-bold">In 1 Hour</Button>
                          <Button variant="outline" size="sm" className="flex-1 border-border text-[9px] font-bold">Tomorrow</Button>
                       </div>
                    </section>

                    <Button className="w-full h-14 bg-primary hover:bg-primary-dark text-white text-xs font-black uppercase tracking-[0.3em] rounded-2xl shadow-lg shadow-primary/20">
                       Submit Outcome
                    </Button>
                 </div>
              </TabsContent>

              <TabsContent value="history" className="flex-1 m-0 p-6 outline-none">
                 <div className="space-y-4">
                    <Card className="bg-surface-2 border-border p-4 rounded-2xl overflow-hidden relative">
                       <div className="absolute top-0 right-0 p-2 opacity-10">
                          <Database size={30} className="text-primary"/>
                       </div>
                       <h4 className="text-[10px] font-black text-foreground mb-1 uppercase tracking-widest">Enrichment Data</h4>
                       <p className="text-[11px] text-text-muted leading-relaxed uppercase font-mono italic">
                          Target segment: Financial Services<br/>
                          Recent News: Announced Series C funding last month ($45M).<br/>
                          Tech Stack: Salesforce, AWS, Slack.
                       </p>
                    </Card>

                    <section>
                       <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest mb-3">Custom Fields</h3>
                       <div className="space-y-2">
                          {[
                            { k: "Revenue", v: "$10M - $50M" },
                            { k: "Employees", v: "250 - 500" },
                            { k: "Priority", v: "High" },
                          ].map(f => (
                            <div key={f.k} className="flex justify-between items-center py-2 border-b border-border">
                               <span className="text-[9px] font-bold text-text-muted uppercase tracking-tighter">{f.k}</span>
                               <span className="text-[10px] font-mono font-bold text-foreground">{f.v}</span>
                            </div>
                          ))}
                       </div>
                    </section>
                 </div>
              </TabsContent>
           </Tabs>
        </aside>
      </main>

      <div className="fixed bottom-6 right-6 z-[100]">
        <Softphone />
      </div>
    </div>
  );
}
