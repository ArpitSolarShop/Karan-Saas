"use client";

import { useState, useCallback } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Plus, DollarSign, Calendar, TrendingUp, User, X, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface Deal {
  id: string;
  name: string;
  value: number;
  currency: string;
  stage: string;
  probability: number;
  expectedCloseDate?: string;
  leadId: string;
  lead?: { name?: string; firstName: string };
  ownerId: string;
  approvalStatus?: "PENDING" | "APPROVED" | "REJECTED";
}

const STAGES = [
  { key: "PROSPECTING", label: "Prospecting", color: "from-slate-500/20 to-slate-400/5" },
  { key: "QUALIFICATION", label: "Qualify", color: "from-blue-500/20 to-blue-400/5" },
  { key: "PROPOSAL", label: "Proposal", color: "from-violet-500/20 to-violet-400/5" },
  { key: "NEGOTIATION", label: "Negotiate", color: "from-amber-500/20 to-amber-400/5" },
  { key: "CLOSED_WON", label: "Won ✓", color: "from-green-500/20 to-green-400/5" },
  { key: "CLOSED_LOST", label: "Lost ✗", color: "from-red-500/20 to-red-400/5" },
];

function fmt(val: number, cur = "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: cur, maximumFractionDigits: 0 }).format(val);
}

export default function DealsPage() {
  const { data: deals = [], isLoading } = useSWR<Deal[]>("/deals", fetcher);
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", value: "", stage: "PROSPECTING", probability: 10, leadId: "" });

  const pipeline = STAGES.map(s => {
    const stageDeals = deals.filter(d => d.stage === s.key);
    return {
      ...s,
      deals: stageDeals,
      total: stageDeals.reduce((sum, d) => sum + d.value, 0),
      expected: stageDeals.reduce((sum, d) => sum + (d.value * (d.probability || 0) / 100), 0),
    };
  });

  const totalWonValue = deals.filter(d => d.stage === "CLOSED_WON").reduce((s, d) => s + d.value, 0);
  const totalPipelineValue = deals.filter(d => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).reduce((s, d) => s + d.value, 0);
  const totalExpectedValue = deals.filter(d => !["CLOSED_WON", "CLOSED_LOST"].includes(d.stage)).reduce((s, d) => s + (d.value * (d.probability || 0) / 100), 0);

  async function handleDrop(stage: string) {
    if (!dragging || dragging === stage) return;
    await api.patch(`/deals/${dragging}`, { stage });
    mutate("/deals");
    setDragging(null);
    setDragOver(null);
  }

  async function createDeal() {
    if (!form.name) return;
    await api.post("/deals", { ...form, value: Number(form.value) || 0, tenantId: "dev-tenant-001", ownerId: "dev-user" });
    mutate("/deals");
    setShowCreate(false);
    setForm({ name: "", value: "", stage: "PROSPECTING", probability: 10, leadId: "" });
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-border pb-6 mb-6">
        <div>
          <div className="flex items-center gap-3">
             <h1 className="text-4xl font-black tracking-tighter uppercase italic">
               Deal <span className="text-primary not-italic">Pipeline</span>
             </h1>
             <div className="bg-surface border border-border px-3 py-1.5 rounded-md flex items-center shadow-sm cursor-pointer hover:border-primary/50 transition-colors">
               <span className="text-xs font-bold text-foreground">Standard Sales</span>
               <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="ml-2 text-muted-foreground"><path d="m6 9 6 6 6-6"/></svg>
             </div>
          </div>
          <div className="flex items-center gap-4 mt-2">
            <span className="text-xs text-text-muted flex items-center gap-1">
              <TrendingUp size={11} className="text-green-400" /> Pipeline: {fmt(totalPipelineValue)}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <Zap size={11} className="text-yellow-400" /> Forecast: {fmt(totalExpectedValue)}
            </span>
            <span className="text-xs text-text-muted flex items-center gap-1">
              <DollarSign size={11} className="text-primary" /> Won: {fmt(totalWonValue)}
            </span>
            <span className="text-xs text-text-muted">{deals.length} total deals</span>
          </div>
        </div>
        <Button onClick={() => setShowCreate(true)} className="bg-primary text-white font-black uppercase tracking-widest text-[10px] h-9 px-5">
          <Plus size={12} className="mr-1.5" /> New Deal
        </Button>
      </div>

      {/* Create modal */}
      {showCreate && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <Card className="bg-surface border-border w-full max-w-sm">
            <div className="flex items-center justify-between p-4 border-b border-border">
              <h3 className="font-black uppercase text-sm tracking-widest">New Deal</h3>
              <button onClick={() => setShowCreate(false)} className="text-text-muted hover:text-foreground"><X size={16} /></button>
            </div>
            <CardContent className="p-4 space-y-3">
              <Input placeholder="Deal name*" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} className="bg-surface-2 border-border" />
              <Input type="number" placeholder="Value (₹)" value={form.value} onChange={e => setForm(f => ({ ...f, value: e.target.value }))} className="bg-surface-2 border-border" />
              <select value={form.stage} onChange={e => setForm(f => ({ ...f, stage: e.target.value }))} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">
                {STAGES.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
              <Input type="number" placeholder="Win probability %" value={form.probability} onChange={e => setForm(f => ({ ...f, probability: Number(e.target.value) }))} className="bg-surface-2 border-border" min={0} max={100} />
              <div className="flex gap-2">
                <Button onClick={createDeal} size="sm" className="bg-primary text-white flex-1">Create</Button>
                <Button onClick={() => setShowCreate(false)} variant="ghost" size="sm">Cancel</Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Kanban board */}
      <div className="flex gap-4 overflow-x-auto pb-4" style={{ minHeight: "60vh" }}>
        {pipeline.map(col => (
          <div
            key={col.key}
            className={cn(
              "shrink-0 w-72 rounded-2xl border border-border/50 bg-gradient-to-b p-3 flex flex-col gap-2 transition-all",
              col.color,
              dragOver === col.key && "border-primary shadow-lg shadow-primary/10 scale-[1.01]"
            )}
            onDragOver={e => { e.preventDefault(); setDragOver(col.key); }}
            onDragLeave={() => setDragOver(null)}
            onDrop={() => handleDrop(col.key)}
          >
            {/* Column header */}
            <div className="flex items-center justify-between px-1 mb-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-text-muted">{col.label}</span>
              <div className="flex flex-col items-end gap-0.5">
                <div className="flex items-center gap-1.5">
                  <span className="text-[9px] bg-surface px-1.5 py-0.5 rounded-full border border-border/50 text-text-muted">{col.deals.length}</span>
                  <span className="text-[9px] font-medium text-text-muted">{fmt(col.total)}</span>
                </div>
                <span className="text-[8px] text-text-muted/60 tracking-wider">EXP: {fmt(col.expected)}</span>
              </div>
            </div>

            {/* Cards */}
            {isLoading ? (
              Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="h-20 rounded-xl bg-surface/50 animate-pulse" />
              ))
            ) : col.deals.length === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[10px] text-text-muted/40 py-8">Drop here</div>
            ) : (
              col.deals.map(deal => (
                <div
                  key={deal.id}
                  draggable
                  onDragStart={() => setDragging(deal.id)}
                  onDragEnd={() => { setDragging(null); setDragOver(null); }}
                  className={cn(
                    "bg-surface border border-border rounded-xl p-3 cursor-grab active:cursor-grabbing hover:border-primary/30 transition-all select-none",
                    dragging === deal.id && "opacity-50 scale-95"
                  )}
                >
                  <p className="text-sm font-semibold truncate">{deal.name}</p>
                  
                  {deal.approvalStatus === "PENDING" && (
                    <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-yellow-400/10 border border-yellow-400/20 rounded text-[8px] font-black text-yellow-400 uppercase tracking-widest">
                      Pending Approval
                    </div>
                  )}
                  {deal.approvalStatus === "REJECTED" && (
                    <div className="mt-1 flex items-center gap-1 px-2 py-0.5 bg-red-400/10 border border-red-400/20 rounded text-[8px] font-black text-red-400 uppercase tracking-widest">
                      Needs Revision
                    </div>
                  )}

                  {deal.lead && <p className="text-[10px] text-text-muted mt-2 flex items-center gap-1"><User size={9} /> {deal.lead.name || deal.lead.firstName}</p>}
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm font-black text-primary">{fmt(deal.value, deal.currency)}</span>
                    <span className="text-[9px] bg-surface-2 px-1.5 py-0.5 rounded-full text-text-muted border border-border/50">{deal.probability}%</span>
                  </div>
                  {deal.expectedCloseDate && (
                    <p className="text-[9px] text-text-muted mt-1.5 flex items-center gap-1">
                      <Calendar size={9} /> Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              ))
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
