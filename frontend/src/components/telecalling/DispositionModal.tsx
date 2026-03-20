"use client";

import { useState } from "react";
import { CheckCircle, Phone, Calendar, XCircle, PhoneOff } from "lucide-react";
import api from "@/lib/api";

export type DispositionOption = {
  code: string;
  label: string;
  category: "POSITIVE" | "NEGATIVE" | "NEUTRAL" | "CALLBACK" | "DNC";
  color: string;
  requiresCallback?: boolean;
};

const DISPOSITIONS: DispositionOption[] = [
  { code: "INTERESTED", label: "Interested", category: "POSITIVE", color: "text-green-400 bg-green-500/10 border-green-500/20" },
  { code: "FOLLOW_UP", label: "Follow Up", category: "CALLBACK", color: "text-blue-400 bg-blue-500/10 border-blue-500/20", requiresCallback: true },
  { code: "NOT_INTERESTED", label: "Not Interested", category: "NEGATIVE", color: "text-red-400 bg-red-500/10 border-red-500/20" },
  { code: "BUSY", label: "Busy / Call Back", category: "CALLBACK", color: "text-yellow-400 bg-yellow-500/10 border-yellow-500/20", requiresCallback: true },
  { code: "NO_ANSWER", label: "No Answer", category: "NEUTRAL", color: "text-gray-400 bg-gray-500/10 border-gray-500/20" },
  { code: "VM_LEFT", label: "Voicemail Left", category: "NEUTRAL", color: "text-purple-400 bg-purple-500/10 border-purple-500/20" },
  { code: "CONVERTED", label: "Converted", category: "POSITIVE", color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20" },
  { code: "DNC", label: "Do Not Call", category: "DNC", color: "text-red-600 bg-red-600/10 border-red-600/20" },
  { code: "INVALID", label: "Invalid Number", category: "NEGATIVE", color: "text-orange-400 bg-orange-500/10 border-orange-500/20" },
  { code: "LANGUAGE_BARRIER", label: "Language Barrier", category: "NEUTRAL", color: "text-text-muted bg-surface-2 border-border" },
];

interface Props {
  callId: string;
  leadId: string;
  leadName: string;
  duration: number;
  onClose: () => void;
}

export function DispositionModal({ callId, leadId, leadName, duration, onClose }: Props) {
  const [selected, setSelected] = useState<DispositionOption | null>(null);
  const [notes, setNotes] = useState("");
  const [callbackAt, setCallbackAt] = useState("");
  const [sendWa, setSendWa] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const mins = String(Math.floor(duration / 60)).padStart(2, "0");
  const secs = String(duration % 60).padStart(2, "0");

  async function submit() {
    if (!selected) return;
    setSubmitting(true);
    try {
      // Update call disposition
      await api.patch(`/calls/${callId}`, { disposition: selected.code, notes });

      // Send WhatsApp if checked
      if (sendWa) {
        await api.post('/communications/send', {
          leadId,
          userId: 'SYSTEM',
          type: 'WHATSAPP',
          message: `Hi ${leadName}, thank you for your time on the call...`
        });
      }

      // Update lead status
      const statusMap: Record<string, string> = {
        INTERESTED: "INTERESTED", CONVERTED: "CONVERTED", DNC: "DNC",
        FOLLOW_UP: "FOLLOW_UP", BUSY: "FOLLOW_UP", NOT_INTERESTED: "LOST",
      };
      if (statusMap[selected.code]) {
        await api.patch(`/leads/${leadId}`, { status: statusMap[selected.code] });
      }

      // Schedule callback if needed
      if (selected.requiresCallback && callbackAt) {
        await api.post("/callbacks", { leadId, scheduledAt: callbackAt, notes });
      }

      onClose();
    } catch (err) {
      console.error("[Disposition] Save failed:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg shadow-2xl shadow-black/40">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div>
            <h2 className="text-sm font-black uppercase tracking-widest">Post-Call Disposition</h2>
            <p className="text-xs text-text-muted mt-0.5">
              {leadName} · Call duration {mins}:{secs}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <PhoneOff size={14} className="text-text-muted" />
            <span className="text-xs font-mono text-text-muted">{mins}:{secs}</span>
          </div>
        </div>

        {/* Dispositions grid */}
        <div className="p-6 space-y-4">
          <p className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-3">Select Outcome</p>
          <div className="grid grid-cols-2 gap-2">
            {DISPOSITIONS.map((d) => (
              <button
                key={d.code}
                onClick={() => setSelected(d)}
                className={`px-4 py-2.5 rounded-lg border text-xs font-bold text-left transition-all ${d.color} ${
                  selected?.code === d.code ? "ring-2 ring-primary/40 scale-[1.02]" : "opacity-70 hover:opacity-100"
                }`}
              >
                {d.label}
                {d.requiresCallback && <Calendar size={10} className="inline ml-1 opacity-60" />}
              </button>
            ))}
          </div>

          {/* Callback scheduler (shows when needed) */}
          {selected?.requiresCallback && (
            <div>
              <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted block mb-2">
                <Calendar size={10} className="inline mr-1" /> Schedule Callback
              </label>
              <input
                type="datetime-local"
                value={callbackAt}
                onChange={(e) => setCallbackAt(e.target.value)}
                className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-primary transition"
              />
            </div>
          )}

          {/* Notes */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-widest text-text-muted block mb-2">
              Call Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              placeholder="What was discussed…"
              className="w-full bg-surface-2 border border-border rounded-lg px-4 py-2.5 text-sm resize-none focus:outline-none focus:border-primary transition"
            />
          </div>

          {/* WhatsApp Auto-Send */}
          <div className="flex items-center gap-2 mt-4 bg-surface-2 p-3 rounded-lg border border-border">
             <input 
               type="checkbox" 
               id="sendWa" 
               checked={sendWa} 
               onChange={e => setSendWa(e.target.checked)} 
               className="w-4 h-4 rounded border-border text-primary focus:ring-primary bg-surface"
             />
             <label htmlFor="sendWa" className="text-xs font-bold text-foreground cursor-pointer select-none flex-1">
               Send automated WhatsApp follow-up
             </label>
          </div>
        </div>

        {/* Actions */}
        <div className="px-6 py-4 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 border border-border rounded-lg text-xs font-bold text-text-muted hover:text-foreground hover:bg-surface-2 transition"
          >
            Skip
          </button>
          <button
            onClick={submit}
            disabled={!selected || submitting}
            className="flex-1 py-2.5 bg-primary hover:bg-primary/90 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <><CheckCircle size={13} /> Save & Continue</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
