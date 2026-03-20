"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ShieldOff, Plus, Trash2, Search, Phone, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Suppression {
  id: string;
  phoneE164: string;
  type: string;
  reason?: string;
  addedAt: string;
  addedBy?: string;
}

export default function DncManagerPage() {
  const { data: suppressions = [], isLoading } = useSWR<Suppression[]>("/notifications/suppressions", fetcher);
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [type, setType] = useState("DNC");
  const [adding, setAdding] = useState(false);
  const [search, setSearch] = useState("");
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState<null | { isDnc: boolean; phone: string }>(null);

  const filtered = suppressions.filter(s =>
    search === "" || s.phoneE164.includes(search) || (s.reason || "").toLowerCase().includes(search.toLowerCase())
  );

  async function add() {
    if (!phone.trim()) return;
    setAdding(true);
    try {
      await api.post("/notifications/suppressions", { phoneE164: phone.trim(), type, reason });
      mutate("/notifications/suppressions");
      setPhone(""); setReason("");
    } finally { setAdding(false); }
  }

  async function remove(id: string) {
    await api.delete(`/notifications/suppressions/${id}`);
    mutate("/notifications/suppressions");
  }

  async function checkDnc() {
    if (!phone.trim()) return;
    setChecking(true);
    try {
      const res = await api.get(`/notifications/dnc-check?phone=${encodeURIComponent(phone.trim())}`);
      const isDnc = res?.data?.isDnc ?? res?.isDnc ?? false;
      setCheckResult({ isDnc, phone: phone.trim() });
    } finally { setChecking(false); }
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            DNC <span className="text-red-400 not-italic">Manager</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">
            <ShieldOff size={12} className="inline mr-1 text-red-400" />
            {suppressions.length} numbers on Do Not Call list
          </p>
        </div>
      </div>

      {/* Add + Check */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="bg-surface border-border">
          <CardContent className="p-4 space-y-3">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted">Add to DNC</h3>
            <Input
              placeholder="+91XXXXXXXXXX (E.164 format)"
              value={phone}
              onChange={e => setPhone(e.target.value)}
              className="bg-surface-2 border-border font-mono"
            />
            <Input
              placeholder="Reason (optional)"
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="bg-surface-2 border-border"
            />
            <select value={type} onChange={e => setType(e.target.value)} className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm">
              <option value="DNC">DNC (Do Not Call)</option>
              <option value="COMPLAINT">Complaint</option>
              <option value="OPT_OUT">Opt Out</option>
              <option value="DISCONNECTED">Disconnected</option>
            </select>
            <div className="flex gap-2">
              <Button onClick={add} disabled={adding || !phone.trim()} size="sm" className="bg-red-500/80 hover:bg-red-500 text-white flex-1">
                <Plus size={12} className="mr-1" /> {adding ? "Adding…" : "Add Number"}
              </Button>
              <Button onClick={checkDnc} disabled={checking || !phone.trim()} variant="outline" size="sm" className="border-border">
                <Search size={12} className="mr-1" /> Check
              </Button>
            </div>
            {checkResult && (
              <div className={cn("text-xs font-medium p-2 rounded-lg border flex items-center gap-2",
                checkResult.isDnc ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-green-500/10 border-green-500/20 text-green-400"
              )}>
                <AlertCircle size={13} />
                {checkResult.phone} is {checkResult.isDnc ? "ON the DNC list ⚠️" : "NOT on the DNC list ✓"}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-surface border-border">
          <CardContent className="p-4">
            <h3 className="text-[11px] font-black uppercase tracking-widest text-text-muted mb-3">Stats</h3>
            <div className="space-y-2">
              {[
                { label: "Total DNC", val: suppressions.filter(s => s.type === "DNC").length, color: "text-red-400" },
                { label: "Opt-Outs", val: suppressions.filter(s => s.type === "OPT_OUT").length, color: "text-amber-400" },
                { label: "Complaints", val: suppressions.filter(s => s.type === "COMPLAINT").length, color: "text-orange-400" },
                { label: "Disconnected", val: suppressions.filter(s => s.type === "DISCONNECTED").length, color: "text-text-muted" },
              ].map(stat => (
                <div key={stat.label} className="flex items-center justify-between">
                  <span className="text-xs text-text-muted">{stat.label}</span>
                  <span className={cn("text-sm font-black", stat.color)}>{stat.val}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by phone or reason…"
          className="pl-8 bg-surface border-border"
        />
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-surface-2/50 border-b border-border">
            <tr>
              {["Phone", "Type", "Reason", "Added", "Actions"].map(h => (
                <th key={h} className="text-left px-4 py-3 text-[10px] font-black uppercase tracking-widest text-text-muted">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b border-border/30">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <td key={j} className="px-4 py-3"><div className="h-4 bg-surface-2 rounded animate-pulse" /></td>
                  ))}
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-10 text-text-muted text-sm"><ShieldOff size={20} className="mx-auto mb-2 opacity-30" />No entries found</td></tr>
            ) : (
              filtered.map(s => (
                <tr key={s.id} className="border-b border-border/30 hover:bg-surface-2/20 transition-colors">
                  <td className="px-4 py-3 font-mono text-[12px] flex items-center gap-2">
                    <Phone size={12} className="text-text-muted" /> {s.phoneE164}
                  </td>
                  <td className="px-4 py-3">
                    <span className={cn("text-[9px] font-black uppercase px-2 py-0.5 rounded-full border",
                      s.type === "DNC" ? "bg-red-500/10 text-red-400 border-red-500/20" :
                      s.type === "COMPLAINT" ? "bg-orange-500/10 text-orange-400 border-orange-500/20" :
                      "bg-surface-2 text-text-muted border-border"
                    )}>{s.type}</span>
                  </td>
                  <td className="px-4 py-3 text-[11px] text-text-muted">{s.reason || "—"}</td>
                  <td className="px-4 py-3 text-[11px] text-text-muted">{format(new Date(s.addedAt), "dd MMM yyyy")}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => remove(s.id)} className="p-1.5 text-text-muted hover:text-red-400 transition"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
