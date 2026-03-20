"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { PhoneForwarded, X, ArrowRight, Phone } from "lucide-react";

interface User {
  id: string;
  firstName: string;
  lastName?: string;
  extension?: string;
  agentStatus: string;
}

interface Props {
  callUUID: string;
  onClose: () => void;
  onTransferred?: () => void;
}

export function CallTransferModal({ callUUID, onClose, onTransferred }: Props) {
  const { data: agents = [] } = useSWR<User[]>("/auth/users", fetcher);
  const [search, setSearch] = useState("");
  const [transferring, setTransferring] = useState(false);
  const [type, setType] = useState<"WARM" | "COLD">("WARM");

  const available = agents.filter(
    a =>
      a.agentStatus === "AVAILABLE" &&
      a.extension &&
      (search === "" ||
        `${a.firstName} ${a.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
        (a.extension || "").includes(search))
  );

  async function transfer(agent: User) {
    if (!agent.extension) return;
    setTransferring(true);
    try {
      await api.post("/telephony/transfer", {
        callUUID,
        targetExtension: agent.extension,
        type,
      });
      onTransferred?.();
      onClose();
    } catch (err) {
      console.error("[Transfer] Failed:", err);
    } finally {
      setTransferring(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[200] flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-sm shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PhoneForwarded size={14} className="text-primary" />
            <h2 className="text-xs font-black uppercase tracking-widest">Transfer Call</h2>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-foreground transition"><X size={14} /></button>
        </div>

        <div className="p-4 space-y-3">
          {/* Transfer type */}
          <div className="flex gap-2">
            {(["WARM", "COLD"] as const).map(t => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={cn(
                  "flex-1 py-1.5 text-[10px] font-black uppercase tracking-widest rounded-lg border transition",
                  type === t ? "bg-primary/10 border-primary/30 text-primary" : "border-border text-text-muted hover:text-foreground"
                )}
              >
                {t === "WARM" ? "🤝 Warm" : "🔀 Cold"} Transfer
              </button>
            ))}
          </div>

          {/* Type hint */}
          <p className="text-[10px] text-text-muted">
            {type === "WARM" ? "You stay on line — introduce the customer before dropping." : "Customer is immediately transferred. You leave the call."}
          </p>

          {/* Search */}
          <input
            placeholder="Search agent or extension…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-primary transition"
          />

          {/* Agent list */}
          <div className="space-y-1.5 max-h-52 overflow-y-auto">
            {available.length === 0 ? (
              <p className="text-xs text-text-muted text-center py-4">No available agents right now</p>
            ) : (
              available.map(a => (
                <button
                  key={a.id}
                  onClick={() => transfer(a)}
                  disabled={transferring}
                  className="w-full flex items-center justify-between p-2.5 rounded-xl bg-surface-2/50 hover:bg-surface-2 border border-border/50 hover:border-primary/30 transition group"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-green-500/10 border border-green-500/20 flex items-center justify-center text-green-400 text-[10px] font-black">
                      {a.firstName[0]}
                    </div>
                    <div className="text-left">
                      <p className="text-xs font-semibold">{a.firstName} {a.lastName}</p>
                      <p className="text-[10px] text-text-muted font-mono">Ext: {a.extension}</p>
                    </div>
                  </div>
                  <ArrowRight size={12} className="text-text-muted group-hover:text-primary transition" />
                </button>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
