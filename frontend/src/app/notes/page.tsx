"use client";

import { useState } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import {
  FileText, Plus, Search, Trash2, Link as LinkIcon, Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface Note {
  id: string;
  content: string;
  leadId?: string;
  dealId?: string;
  lead?: { name?: string; firstName?: string; phone: string };
  deal?: { name: string };
  createdAt: string;
  updatedAt: string;
}

export default function NotesPage() {
  const { data: notes = [], isLoading, mutate } = useSWR<Note[]>("/notes", fetcher);
  const [search, setSearch] = useState("");
  const [content, setContent] = useState("");
  const [creating, setCreating] = useState(false);
  const [showCreate, setShowCreate] = useState(false);

  const filtered = notes.filter(n =>
    search === "" || n.content.toLowerCase().includes(search.toLowerCase()) ||
    (n.lead?.name || n.lead?.firstName || "").toLowerCase().includes(search.toLowerCase())
  );

  async function create() {
    if (!content.trim()) return;
    setCreating(true);
    try {
      await api.post("/notes", { content });
      mutate();
      setContent(""); setShowCreate(false);
    } finally { setCreating(false); }
  }

  async function remove(id: string) {
    await api.delete(`/notes/${id}`);
    mutate();
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-6 pb-16 space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 border-b border-border pb-6">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic">
            Notes <span className="text-primary not-italic">Global</span>
          </h1>
          <p className="text-sm text-text-muted mt-1">{notes.length} notes across all leads and deals</p>
        </div>
        <Button
          onClick={() => setShowCreate(!showCreate)}
          className="bg-primary text-white flex items-center gap-2"
          size="sm"
        >
          <Plus size={13} /> New Note
        </Button>
      </div>

      {/* Create form */}
      {showCreate && (
        <Card className="bg-surface border-primary/20">
          <CardContent className="p-4 space-y-3">
            <p className="text-[10px] uppercase tracking-widest text-text-muted font-black">New Note</p>
            <textarea
              value={content}
              onChange={e => setContent(e.target.value)}
              rows={3}
              placeholder="Write your note…"
              className="w-full bg-surface-2 border border-border rounded-lg px-3 py-2 text-sm resize-none focus:outline-none focus:border-primary transition"
            />
            <div className="flex gap-2">
              <Button onClick={create} disabled={creating || !content.trim()} size="sm" className="bg-primary text-white">
                {creating ? "Saving…" : "Save Note"}
              </Button>
              <Button onClick={() => setShowCreate(false)} variant="outline" size="sm" className="border-border">
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search */}
      <div className="relative">
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
        <Input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="pl-8 bg-surface border-border"
        />
      </div>

      {/* Notes grid */}
      {isLoading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-32 bg-surface-2 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-20 text-text-muted">
          <FileText size={32} className="mx-auto mb-3 opacity-20" />
          <p className="text-sm">No notes found</p>
          <p className="text-xs mt-1">Create your first note or search differently</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(n => (
            <Card key={n.id} className="bg-surface border-border hover:border-primary/20 transition group">
              <CardContent className="p-4 space-y-3">
                <p className="text-sm leading-relaxed">{n.content.length > 200 ? n.content.slice(0, 200) + "…" : n.content}</p>

                {/* Context (lead/deal) */}
                {(n.lead || n.deal) && (
                  <div className="flex items-center gap-1.5">
                    <LinkIcon size={10} className="text-text-muted" />
                    <span className="text-[10px] text-text-muted">
                      {n.lead ? `Lead: ${n.lead.name || n.lead.firstName}` : `Deal: ${n.deal?.name}`}
                    </span>
                  </div>
                )}

                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1 text-[10px] text-text-muted">
                    <Calendar size={9} />
                    {format(new Date(n.createdAt), "dd MMM yyyy")}
                  </div>
                  <button
                    onClick={() => remove(n.id)}
                    className="opacity-0 group-hover:opacity-100 text-text-muted hover:text-red-400 transition p-1 rounded"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
