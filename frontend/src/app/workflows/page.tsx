"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  FileText, Settings, Plus, Trash2, PlayCircle, PauseCircle,
  Copy, ArrowRight, Zap, GitBranch, Bell, Mail
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

interface WorkflowRule {
  id: string;
  name: string;
  trigger: string;
  condition?: any;
  action: string;
  actionParams: any;
  isActive: boolean;
  runCount: number;
  createdAt: string;
}

const TRIGGERS = [
  { value: "LEAD_STATUS_CHANGED", label: "Lead status changes" },
  { value: "LEAD_CREATED", label: "New lead created" },
  { value: "CALL_DISPOSITION", label: "Call disposition set" },
  { value: "DEAL_STAGE_CHANGED", label: "Deal stage changes" },
  { value: "CALLBACK_DUE", label: "Callback due" },
  { value: "LEAD_ASSIGNED", label: "Lead assigned to agent" },
];

const ACTIONS = [
  { value: "SEND_WHATSAPP", label: "Send WhatsApp message", icon: Mail },
  { value: "SEND_EMAIL", label: "Send email", icon: Mail },
  { value: "CREATE_TASK", label: "Create a task", icon: FileText },
  { value: "CREATE_NOTIFICATION", label: "Send notification", icon: Bell },
  { value: "UPDATE_LEAD_STATUS", label: "Update lead status", icon: ArrowRight },
  { value: "ASSIGN_LEAD", label: "Assign lead to agent", icon: ArrowRight },
];

export default function WorkflowsPage() {
  const { data: rules = [], isLoading, mutate } = useSWR<WorkflowRule[]>("/workflows", fetcher);
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ name: "", trigger: "LEAD_STATUS_CHANGED", action: "SEND_WHATSAPP", message: "", status: "" });
  const [creating, setCreating] = useState(false);

  async function create() {
    if (!form.name.trim()) return;
    setCreating(true);
    try {
      await api.post("/workflows", {
        name: form.name,
        trigger: form.trigger,
        action: form.action,
        actionParams: { message: form.message, status: form.status },
        isActive: true,
      });
      mutate();
      setShowCreate(false);
      setForm({ name: "", trigger: "LEAD_STATUS_CHANGED", action: "SEND_WHATSAPP", message: "", status: "" });
    } finally { setCreating(false); }
  }

  async function toggle(id: string, active: boolean) {
    await api.patch(`/workflows/${id}`, { isActive: !active });
    mutate();
  }

  async function remove(id: string) {
    await api.delete(`/workflows/${id}`);
    mutate();
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Workflow <span className="text-primary not-italic">Automation</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            <Zap size={12} className="inline mr-1 text-primary" />
            {rules.filter(r => r.isActive).length} active rules · {rules.reduce((s, r) => s + r.runCount, 0)} total executions
          </p>
        </div>
        <Button onClick={() => setShowCreate(!showCreate)} className="bg-primary text-white flex items-center gap-2" size="sm">
          <Plus size={13} /> New Rule
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="bg-surface border-primary/20">
          <CardContent className="p-5 space-y-4">
            <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Create Automation Rule</p>

            <Input
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              placeholder="Rule name (e.g. 'Send WA on Interested')"
              className="bg-surface-2 border-border"
            />

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1.5">
                  <GitBranch size={10} className="inline mr-1" /> When (Trigger)
                </label>
                <select
                  value={form.trigger}
                  onChange={e => setForm(f => ({ ...f, trigger: e.target.value }))}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {TRIGGERS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                </select>
              </div>
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1.5">
                  <Zap size={10} className="inline mr-1" /> Then (Action)
                </label>
                <select
                  value={form.action}
                  onChange={e => setForm(f => ({ ...f, action: e.target.value }))}
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm"
                >
                  {ACTIONS.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                </select>
              </div>
            </div>

            {(form.action === "SEND_WHATSAPP" || form.action === "SEND_EMAIL" || form.action === "CREATE_NOTIFICATION") && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1.5">Message / Content</label>
                <textarea
                  value={form.message}
                  onChange={e => setForm(f => ({ ...f, message: e.target.value }))}
                  rows={2}
                  placeholder="Use {{lead.name}}, {{lead.phone}}, {{agent.name}} as variables…"
                  className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary"
                />
              </div>
            )}

            {form.action === "UPDATE_LEAD_STATUS" && (
              <div>
                <label className="text-[10px] font-bold uppercase tracking-widest text-text-muted block mb-1.5">New Lead Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">
                  <option value="">Select status…</option>
                  {["INTERESTED", "FOLLOW_UP", "CONVERTED", "LOST", "DNC"].map(s => <option key={s}>{s}</option>)}
                </select>
              </div>
            )}

            <div className="flex gap-2">
              <Button onClick={create} disabled={creating || !form.name.trim()} size="sm" className="bg-primary text-white">
                {creating ? "Creating…" : "Create Rule"}
              </Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" size="sm" className="border-border">Cancel</Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Rules list */}
      <div className="space-y-3">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-20 bg-surface rounded-2xl border border-border animate-pulse" />)
        ) : rules.length === 0 ? (
          <div className="text-center py-20 text-text-muted">
            <Zap size={32} className="mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">No automation rules yet</p>
            <p className="text-xs mt-1">Create your first rule to automate lead follow-ups</p>
          </div>
        ) : (
          rules.map(r => (
            <Card key={r.id} className={cn("bg-surface border-border transition", !r.isActive && "opacity-50")}>
              <CardContent className="p-4 flex items-start justify-between gap-4">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0",
                    r.isActive ? "bg-primary/10 border border-primary/20" : "bg-surface-2 border border-border"
                  )}>
                    <Zap size={14} className={r.isActive ? "text-primary" : "text-text-muted"} />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">{r.name}</p>
                    <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] bg-surface-2 border border-border px-1.5 py-0.5 rounded text-text-muted">
                        {TRIGGERS.find(t => t.value === r.trigger)?.label || r.trigger}
                      </span>
                      <ArrowRight size={9} className="text-text-muted" />
                      <span className="text-[10px] bg-primary/10 border border-primary/20 text-primary px-1.5 py-0.5 rounded">
                        {ACTIONS.find(a => a.value === r.action)?.label || r.action}
                      </span>
                    </div>
                    <p className="text-[10px] text-text-muted mt-1">{r.runCount} executions · created {format(new Date(r.createdAt), "dd MMM yyyy")}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => toggle(r.id, r.isActive)}
                    className={cn("p-1.5 rounded-lg border transition",
                      r.isActive ? "border-green-500/20 text-green-400 hover:bg-green-500/10" : "border-border text-text-muted hover:text-foreground"
                    )}
                    title={r.isActive ? "Pause rule" : "Activate rule"}
                  >
                    {r.isActive ? <PauseCircle size={14} /> : <PlayCircle size={14} />}
                  </button>
                  <button onClick={() => remove(r.id)} className="p-1.5 rounded-lg border border-border text-text-muted hover:text-red-400 transition">
                    <Trash2 size={14} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
