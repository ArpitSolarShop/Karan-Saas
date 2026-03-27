"use client";

import { useState, useRef } from "react";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { Voicemail, Upload, Play, Loader2, CheckCircle } from "lucide-react";

interface Props {
  callUUID: string;
  className?: string;
}

export function VoicemailDropButton({ callUUID, className }: Props) {
  const [uploading, setUploading] = useState(false);
  const [dropping, setDropping] = useState(false);
  const [dropped, setDropped] = useState(false);
  const [uploadedPath, setUploadedPath] = useState<string | null>(null);
  const [showPanel, setShowPanel] = useState(false);
  const [presets, setPresets] = useState<{ name: string; path: string }[]>([]);
  const fileRef = useRef<HTMLInputElement>(null);

  // Upload a new voicemail WAV
  async function upload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await api.post("/telephony/voicemail/upload", form, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const path = res.data?.path || (res as any).path;
      setUploadedPath(path);
      setPresets((p: { name: string; path: string }[]) => [...p, { name: file.name.replace(/\.wav$/i, ""), path }]);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  // Drop the voicemail into the call
  async function drop(path: string) {
    setDropping(true);
    try {
      await api.post("/telephony/voicemail/drop", { callUUID, filePath: path });
      setDropped(true);
      setShowPanel(false);
      setTimeout(() => setDropped(false), 3000);
    } finally {
      setDropping(false);
    }
  }

  if (dropped) {
    return (
      <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500/10 border border-green-500/20 text-green-400 text-[10px] font-bold", className)}>
        <CheckCircle size={12} /> Voicemail Dropped
      </div>
    );
  }

  return (
    <div className={cn("relative", className)}>
      <button
        onClick={() => setShowPanel(!showPanel)}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/10 border border-violet-500/20 text-violet-400 hover:bg-violet-500/20 transition text-[10px] font-bold"
      >
        <Voicemail size={12} /> VM Drop
      </button>

      {showPanel && (
        <div className="absolute bottom-full mb-2 right-0 w-64 bg-surface border border-border rounded-2xl shadow-2xl shadow-black/40 p-3 space-y-2 z-50">
          <p className="text-[10px] font-black uppercase tracking-widest text-text-muted">Drop Voicemail</p>

          {/* Presets */}
          {presets.map(p => (
            <button
              key={p.path}
              onClick={() => drop(p.path)}
              disabled={dropping}
              className="w-full flex items-center justify-between px-2.5 py-2 rounded-xl bg-surface-2 hover:bg-surface-2/80 border border-border transition text-xs"
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <Play size={11} className="text-violet-400 shrink-0" />
                <span className="truncate">{p.name}</span>
              </div>
              {dropping ? <Loader2 size={11} className="animate-spin text-text-muted" /> : <span className="text-[10px] text-primary font-bold">Drop</span>}
            </button>
          ))}

          {presets.length === 0 && (
            <p className="text-[10px] text-text-muted text-center py-2">No voices uploaded yet</p>
          )}

          {/* Upload */}
          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border border-dashed border-border text-[10px] text-text-muted hover:text-foreground hover:border-primary/30 transition"
          >
            {uploading ? <Loader2 size={11} className="animate-spin" /> : <Upload size={11} />}
            {uploading ? "Uploading…" : "Upload WAV file"}
          </button>
          <input ref={fileRef} type="file" accept=".wav,.mp3" onChange={upload} className="hidden" />
        </div>
      )}
    </div>
  );
}
