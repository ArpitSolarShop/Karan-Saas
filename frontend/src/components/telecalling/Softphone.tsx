"use client";

import { useState, useEffect } from "react";
import {
  Phone, PhoneOff, Mic, MicOff, Volume2, VolumeX,
  Keyboard, ChevronDown, Wifi, WifiOff, Loader2,
  Forward, Voicemail
} from "lucide-react";
import { useSoftphone } from "@/hooks/useSoftphone";
import { useAuth } from "@/context/AuthContext";
import { useCallStore } from "@/stores/useCallStore";
import api from "@/lib/api";
import { cn } from "@/lib/utils";

const DIALPAD = [
  ["1", "2", "3"],
  ["4", "5", "6"],
  ["7", "8", "9"],
  ["*", "0", "#"],
];

export function Softphone() {
  const { user } = useAuth();
  const [sipConfig, setSipConfig] = useState<any>(null);
  const [loadingConfig, setLoadingConfig] = useState(true);
  const [number, setNumber] = useState("");
  const [showPad, setShowPad] = useState(false);
  const [speakerMuted, setSpeakerMuted] = useState(false);

  const { call, hangup, mute, state } = useSoftphone(sipConfig);
  const { activeCall, isMuted: callMuted, tickDuration } = useCallStore((s) => ({
    activeCall: s.activeCall,
    isMuted: s.activeCall ? s.activeCall.isMuted : false,
    tickDuration: s.tickDuration
  }));

  // Fetch SIP config from backend on mount
  useEffect(() => {
    if (!user?.id) return;
    api.get(`/telephony/sip-config?agentId=${user.id}`)
      .then(({ data }) => setSipConfig(data))
      .catch(() => setSipConfig(null))
      .finally(() => setLoadingConfig(false));
  }, [user?.id]);

  // Call duration timer
  useEffect(() => {
    let interval: any;
    if (activeCall?.status === 'connected') {
      interval = setInterval(() => {
        tickDuration();
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [activeCall?.status, tickDuration]);

  // Call duration display
  const durationSeconds = activeCall?.durationSeconds ?? 0;
  const mins = String(Math.floor(durationSeconds / 60)).padStart(2, "0");
  const secs = String(durationSeconds % 60).padStart(2, "0");

  const onCall = !!activeCall;
  const registrationStatus = state.status;

  const statusConfig = {
    unregistered: { color: "text-text-muted", icon: <WifiOff size={11} />, label: "Offline" },
    registering:  { color: "text-yellow-400", icon: <Loader2 size={11} className="animate-spin" />, label: "Connecting…" },
    registered:   { color: "text-green-400",  icon: <Wifi size={11} />, label: "Ready" },
    error:        { color: "text-red-400",     icon: <WifiOff size={11} />, label: "Error" },
  }[registrationStatus];

  return (
    <div className="bg-surface border border-border rounded-2xl overflow-hidden w-72 shadow-2xl shadow-black/40">
      <audio id="remoteAudio" hidden playsInline autoPlay />
      {/* Header */}
      <div className="bg-surface-2 px-4 py-3 flex items-center justify-between border-b border-border">
        <div className="flex items-center gap-2">
          <Phone size={13} className="text-primary" />
          <span className="text-[11px] font-black uppercase tracking-widest">Softphone</span>
        </div>
        <div className={cn("flex items-center gap-1.5 text-[10px] font-bold", statusConfig.color)}>
          {statusConfig.icon}
          {statusConfig.label}
        </div>
      </div>

      {/* Active call view */}
      {onCall ? (
        <div className="p-5 space-y-4">
          <div className="text-center">
            <div className="h-14 w-14 rounded-full bg-primary/20 border-2 border-primary/30 flex items-center justify-center mx-auto mb-3">
              <span className="text-primary text-xl font-black">{activeCall.leadName?.[0] ?? "?"}</span>
            </div>
            <p className="font-bold text-sm">{activeCall.leadName || activeCall.phone}</p>
            <p className="text-xs text-text-muted mt-0.5">{activeCall.phone}</p>
            <p className="text-2xl font-black font-mono text-primary mt-2">{mins}:{secs}</p>
            <p className="text-[10px] text-text-muted uppercase tracking-widest">
              {activeCall.status === "ringing" ? "Ringing…" : activeCall.status === "connected" ? "Connected" : activeCall.status}
            </p>
          </div>

          {/* Call controls */}
          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={mute}
              className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition", callMuted ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-surface-2 border-border text-text-muted hover:text-foreground")}
            >
              {callMuted ? <MicOff size={16} /> : <Mic size={16} />}
              <span className="text-[9px] font-bold uppercase">{callMuted ? "Unmute" : "Mute"}</span>
            </button>

            <button
              onClick={() => setSpeakerMuted(!speakerMuted)}
              className={cn("flex flex-col items-center gap-1.5 p-3 rounded-xl border transition", speakerMuted ? "bg-surface-2 border-border text-text-muted" : "bg-surface-2 border-border text-text-muted hover:text-foreground")}
            >
              {speakerMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              <span className="text-[9px] font-bold uppercase">Speaker</span>
            </button>

            <button
              onClick={() => {
                const ext = prompt("Enter target extension or number:");
                if (ext) api.post(`/telephony/transfer`, { callUUID: activeCall.callSid, targetExtension: ext });
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-foreground transition"
            >
              <Forward size={16} />
              <span className="text-[9px] font-bold uppercase">Transfer</span>
            </button>

            <button
              onClick={() => {
                const path = prompt("Enter Voicemail filePath (e.g. /var/lib/freeswitch/vm.wav):");
                if (path) api.post(`/telephony/voicemail/drop`, { callUUID: activeCall.callSid, filePath: path });
              }}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-surface-2 border border-border text-text-muted hover:text-foreground transition col-span-1"
            >
              <Voicemail size={16} />
              <span className="text-[9px] font-bold uppercase">VM Drop</span>
            </button>

            <button
              onClick={hangup}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20 transition col-span-2"
            >
              <PhoneOff size={16} />
              <span className="text-[9px] font-bold uppercase">Hang up</span>
            </button>
          </div>
        </div>
      ) : (
        /* Idle / dial view */
        <div className="p-4 space-y-3">
          {/* Number input */}
          <div className="relative">
            <input
              type="tel"
              value={number}
              onChange={(e) => setNumber(e.target.value)}
              placeholder="+91 XXXXX XXXXX"
              className="w-full bg-surface-2 border border-border rounded-xl px-4 py-3 text-sm text-center font-mono font-bold tracking-widest focus:outline-none focus:border-primary transition"
            />
            <button
              onClick={() => setShowPad(!showPad)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-foreground transition"
            >
              <Keyboard size={14} />
            </button>
          </div>

          {/* Dial pad */}
          {showPad && (
            <div className="grid grid-cols-3 gap-2">
              {DIALPAD.flat().map((digit) => (
                <button
                  key={digit}
                  onClick={() => setNumber((n) => n + digit)}
                  className="bg-surface-2 hover:bg-surface border border-border rounded-xl py-3 text-sm font-bold transition"
                >
                  {digit}
                </button>
              ))}
              <button
                onClick={() => setNumber((n) => n.slice(0, -1))}
                className="bg-surface-2 hover:bg-surface border border-border rounded-xl py-3 text-sm text-text-muted transition col-span-3"
              >
                ⌫
              </button>
            </div>
          )}

          <button
            disabled={!number || registrationStatus !== "registered"}
            onClick={() => call({ toNumber: number, leadId: "", leadName: number })}
            className="w-full py-3 bg-primary hover:bg-primary/90 rounded-xl text-sm font-black text-white flex items-center justify-center gap-2 transition shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Phone size={14} />
            Call {number ? number : "—"}
          </button>

          {registrationStatus === "error" && (
            <p className="text-[10px] text-red-400 text-center">{state.error}</p>
          )}
          {registrationStatus === "unregistered" && !loadingConfig && !sipConfig && (
            <p className="text-[10px] text-text-muted text-center">FreeSWITCH offline — SIM mode active</p>
          )}
        </div>
      )}
    </div>
  );
}
