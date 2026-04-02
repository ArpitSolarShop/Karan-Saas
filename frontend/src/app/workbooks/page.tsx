"use client";

import { useState } from "react";
import useSWR, { mutate } from "swr";
import Link from "next/link";
import api from "@/lib/api";
import { Table, Plus, ExternalLink, Loader2, FileSpreadsheet } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function WorkbooksHub() {
  const { data: workbooks, error, isLoading } = useSWR("/workbooks", () => api.get("/workbooks").then(res => res.data));
  const [isCreating, setIsCreating] = useState(false);

  const handleCreateWorkbook = async () => {
    const name = prompt("Enter workbook name:");
    if (!name) return;
    setIsCreating(true);
    try {
      const { data: wb } = await api.post("/workbooks", { name });
      // Create an initial sheet
      await api.post(`/workbooks/${wb.id}/sheets`, { name: "Sheet 1" });
      mutate("/workbooks");
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  if (error) return <div className="p-6 text-red-500">Failed to load workbooks.</div>;

  return (
    <div className="p-8 max-w-7xl mx-auto flex flex-col h-full overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-foreground flex items-center gap-2">
            <FileSpreadsheet className="text-primary" /> Workbooks Hub
          </h1>
          <p className="text-sm text-text-muted mt-1">
            Dynamic progressive databases and spreadsheets.
          </p>
        </div>
        <button
          onClick={handleCreateWorkbook}
          disabled={isCreating}
          className="bg-primary text-white hover:bg-primary/90 px-4 py-2 rounded-lg font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition"
        >
          {isCreating ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />} 
          New Workbook
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {workbooks?.map((wb: any) => (
          <div key={wb.id} className="bg-surface border border-border rounded-xl p-6 shadow-sm hover:border-primary/50 transition relative group">
            <h3 className="text-lg font-bold text-foreground mb-1">{wb.name}</h3>
            <p className="text-xs text-text-muted mb-4">
              Created {formatDistanceToNow(new Date(wb.createdAt))} ago
            </p>
            
            <div className="space-y-2 mt-4 pt-4 border-t border-border">
              <h4 className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-3">Sheets</h4>
              {wb.sheets?.length === 0 && <span className="text-xs text-text-muted italic">No sheets yet.</span>}
              {wb.sheets?.map((sheet: any) => (
                <Link
                  key={sheet.id}
                  href={`/workbooks/${sheet.id}`}
                  className="flex items-center justify-between bg-surface-2 hover:bg-primary/10 p-2 rounded-md text-sm transition group/sheet"
                >
                  <div className="flex items-center gap-2 text-foreground font-medium">
                    <Table size={14} className="text-primary" />
                    {sheet.name}
                  </div>
                  <ExternalLink size={14} className="text-text-muted opacity-0 group-hover/sheet:opacity-100 transition" />
                </Link>
              ))}
            </div>
            
            <button 
              onClick={async () => {
                const name = prompt("Enter sheet name:");
                if (name) {
                  await api.post(`/workbooks/${wb.id}/sheets`, { name });
                  mutate("/workbooks");
                }
              }}
              className="absolute top-4 right-4 text-xs font-bold text-primary hover:bg-primary/10 px-2 py-1 rounded-md transition opacity-0 group-hover:opacity-100"
            >
              + ADD SHEET
            </button>
          </div>
        ))}

        {workbooks?.length === 0 && (
          <div className="col-span-full py-20 text-center border-2 border-dashed border-border rounded-xl">
            <Table size={40} className="mx-auto text-text-muted opacity-50 mb-3" />
            <h3 className="text-lg font-bold text-foreground">No workbooks found</h3>
            <p className="text-sm text-text-muted mt-1">Create your first workbook to get started.</p>
          </div>
        )}
      </div>
    </div>
  );
}
