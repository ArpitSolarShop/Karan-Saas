"use client";

import { Play, Settings2, GitCommit, Bot, Send, Ticket, Clock, CreditCard, Award, ArrowRight, KanbanSquare, Building2, Workflow } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export default function ChainsPage() {
  const [isSimulating, setIsSimulating] = useState(false);

  // Hardcoded Macro Chains for Presentation
  const macroChains = [
    {
      id: 'agentic',
      title: 'The Agentic Sales Chain',
      description: 'Fully automated lead progression utilizing AI Scoring and WhatsApp.',
      steps: [
        { icon: <Bot className="h-5 w-5" />, label: 'AI Score > 80' },
        { icon: <Send className="h-5 w-5" />, label: 'Send WhatsApp' },
        { icon: <KanbanSquare className="h-5 w-5" />, label: 'Move Deal Stage' },
        { icon: <Award className="h-5 w-5" />, label: '+50 Gamification Pts' },
      ],
      color: 'blue'
    },
    {
      id: 'support',
      title: 'The Zero-Drop Support Chain',
      description: 'Customer portal ticket triggers deep internal escalation.',
      steps: [
        { icon: <Ticket className="h-5 w-5" />, label: 'Portal Ticket Open' },
        { icon: <Clock className="h-5 w-5" />, label: 'SLA Warning (1hr)' },
        { icon: <Settings2 className="h-5 w-5" />, label: 'Ping Manager Slack' },
      ],
      color: 'rose'
    },
    {
      id: 'q2c',
      title: 'Quote-to-Cash Engine',
      description: 'The core commercial pipeline connecting 4 disparate modules.',
      steps: [
        { icon: <CheckCircle2 className="h-5 w-5" />, label: 'Quote Approved' },
        { icon: <CreditCard className="h-5 w-5" />, label: 'Gen Invoice & Pay' },
        { icon: <Award className="h-5 w-5" />, label: 'Pay Agent Commission' },
      ],
      color: 'emerald'
    },
    {
      id: 'partner',
      title: 'Partner Network Distribution',
      description: 'Multi-company scoping and franchise routing.',
      steps: [
        { icon: <Building2 className="h-5 w-5" />, label: 'Global Lead Arrives' },
        { icon: <MapPin className="h-5 w-5" />, label: 'Geo-Map Routing' },
        { icon: <Building2 className="h-5 w-5" />, label: 'Assign to Franchise' },
      ],
      color: 'amber'
    }
  ];

  const triggerSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => setIsSimulating(false), 2000);
  };

  return (
    <div className="flex-1 space-y-4 p-8 pt-6 relative overflow-hidden bg-background">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Workflow className="h-8 w-8 text-primary" />
            Macro Chains
          </h2>
          <p className="text-muted-foreground mt-1">
            Pre-configured autonomous multi-module routing capabilities.
          </p>
        </div>
        <Button 
          onClick={triggerSimulation}
          disabled={isSimulating}
          className={"shadow-lg transition-all " + (isSimulating ? "bg-muted-foreground" : "bg-primary text-primary-foreground hover:shadow-primary/25")}
        >
          {isSimulating ? <Settings2 className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} 
          Run Simulation Demo
        </Button>
      </div>

      <div className="grid grid-cols-1 mt-6 gap-8">
        {macroChains.map((chain) => (
          <Card key={chain.id} className="bg-surface border-border overflow-hidden relative">
            <div className={"absolute top-0 left-0 w-2 h-full bg-" + chain.color + "-500"} />
            <CardHeader className="pl-8 pb-2">
              <CardTitle className="text-xl">{chain.title}</CardTitle>
              <CardDescription>{chain.description}</CardDescription>
            </CardHeader>
            <CardContent className="pl-8 pt-4">
              <div className="flex items-center gap-4 overflow-x-auto pb-4">
                {chain.steps.map((step, idx) => (
                  <div key={idx} className="flex items-center group">
                    <div className={"flex flex-col items-center justify-center p-4 h-24 w-40 rounded-lg bg-surface-2 border border-border shadow-sm group-hover:border-" + chain.color + "-500/50 group-hover:bg-" + chain.color + "-500/5 transition-all"}>
                      <div className={"text-" + chain.color + "-500 mb-2"}>{Object.assign({}, step.icon, { type: step.icon.type, props: { ...step.icon.props, className: isSimulating ? 'h-5 w-5 animate-pulse' : 'h-5 w-5' } })}</div>
                      <div className="text-xs font-semibold text-center leading-tight">{step.label}</div>
                    </div>
                    {idx < chain.steps.length - 1 && (
                      <div className="px-4 text-muted-foreground/30">
                        <ArrowRight className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Temporary mocks for missing imports in this isolation
const CheckCircle2 = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>;
const MapPin = (props: any) => <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>;
