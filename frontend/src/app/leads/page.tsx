"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import useSWR, { mutate } from "swr";
import { io } from "socket.io-client";
import { fetcher } from "@/lib/api";
import api from "@/lib/api";
import Softphone from "@/components/Softphone";
import AIOverlay from "@/components/AIOverlay";
import CustomerWorkspace from "@/components/CustomerWorkspace";
import AddLeadDialog from "@/components/AddLeadDialog";
import { List } from 'react-window';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { Search, Plus, Upload, Phone, Cpu, Database, Activity, Terminal } from "lucide-react";

const VirtualList = List as any;
const SHEET_ID = "sheet-001";
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

export default function LeadsTerminal() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const { data: sheet } = useSWR(`/sheets/${SHEET_ID}`, fetcher);
  const { data: rawRows } = useSWR(`/sheets/${SHEET_ID}/rows`, fetcher);

  const [activeCell, setActiveCell] = useState("B1");
  const [formulaValue, setFormulaValue] = useState("");
  const [isGridFocused, setIsGridFocused] = useState(false);
  const [editingCell, setEditingCell] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const [callActive, setCallActive] = useState(false);
  const [activeLead, setActiveLead] = useState<any>(null);
  const [isCommDrawerOpen, setIsCommDrawerOpen] = useState(false);
  const [isAIOverlayOpen, setIsAIOverlayOpen] = useState(false);
  const [isAddLeadDialogOpen, setIsAddLeadDialogOpen] = useState(false);
  
  const [tickerMsgs, setTickerMsgs] = useState([
    "[SYSTEM] ALPHA CRM TERMINAL INITIALIZED.",
    "[DATA] SYNCING LIVE ORDER BOOK...",
  ]);
  const [flashCells, setFlashCells] = useState<Record<string, boolean>>({});

  const gridContainerRef = useRef<HTMLDivElement>(null);
  const highlightRef = useRef<HTMLDivElement>(null);
  const cellInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const COLUMNS = useMemo(() => sheet?.columns?.map((_: any, i: number) => String.fromCharCode(65 + i)) || [], [sheet]);
  const COLUMN_MAP = useMemo(() => sheet?.columns?.reduce((acc: any, col: any, i: number) => {
    acc[String.fromCharCode(65 + i)] = col.key;
    return acc;
  }, {}) || {}, [sheet]);
  const HEADERS = useMemo(() => sheet?.columns?.map((col: any) => col.name) || [], [sheet]);

  const rows = useMemo(() => {
    if (!rawRows) return [];
    let filtered = [...rawRows];
    if (searchTerm) {
      filtered = filtered.filter((r: any) => 
        JSON.stringify(r.data).toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    if (statusFilter !== "ALL") {
      filtered = filtered.filter((r: any) => r.data?.status === statusFilter);
    }
    return filtered.sort((a: any, b: any) => a.rowIndex - b.rowIndex);
  }, [rawRows, searchTerm, statusFilter]);

  useEffect(() => {
    const socket = io(`${API_URL}/leads`);
    socket.on("sheetUpdated", () => {
      mutate(`/sheets/${SHEET_ID}`);
      mutate(`/sheets/${SHEET_ID}/rows`);
    });
    socket.on("rowUpdated", (data) => {
      mutate(`/sheets/${SHEET_ID}/rows`);
      if (data && data.rowIndex) {
        setFlashCells(prev => ({ ...prev, [data.rowIndex]: true }));
        setTimeout(() => setFlashCells(prev => ({ ...prev, [data.rowIndex]: false })), 500);
        setTickerMsgs(prev => [`[${new Date().toLocaleTimeString()}] RECORD ${data.rowIndex} UPDATED.`, ...prev.slice(0, 4)]);
      }
    });

    const interval = setInterval(() => {
      const msgs = [
        "[OP] AGENT 402 INBOUND CALL CONNECT...",
        "[SYS] QUEUE DEPTH OPTIMAL.",
        "[OP] DEAL MARKED AS CONVERTED (VAL: ++)",
        "[SYS] LATENCY: 12ms TO CORE.",
      ];
      setTickerMsgs(prev => {
        const next = msgs[Math.floor(Math.random() * msgs.length)];
        return [`[${new Date().toLocaleTimeString()}] ${next}`, ...prev.slice(0, 3)];
      });
    }, 8000);

    return () => { 
      socket.disconnect(); 
      clearInterval(interval);
    };
  }, []);

  const selectCell = useCallback((cellId: string) => {
    setActiveCell(cellId);
    const col = cellId.charAt(0);
    const rowIdx = parseInt(cellId.substring(1)) - 1;
    const field = COLUMN_MAP[col];
    const rowData = rows[rowIdx]?.data || {};
    setFormulaValue(String(rowData[field] || ""));
    
    requestAnimationFrame(() => {
      const cell = document.getElementById(`cell-${cellId}`);
      if (cell && highlightRef.current) {
        highlightRef.current.style.width = `${cell.offsetWidth + 4}px`;
        highlightRef.current.style.height = `${cell.offsetHeight + 4}px`;
        highlightRef.current.style.left = `${cell.offsetLeft - 2}px`;
        highlightRef.current.style.top = `${cell.offsetTop - 2}px`;
        
        if (rows[rowIdx]) {
          setActiveLead({ ...rows[rowIdx].data, id: rows[rowIdx].id });
          setIsCommDrawerOpen(true);
        }
      }
    });
  }, [rows, COLUMN_MAP]);

  const startEditing = useCallback((cellId: string, initialChar?: string) => {
    const col = cellId.charAt(0);
    const rowIdx = parseInt(cellId.substring(1)) - 1;
    const field = COLUMN_MAP[col];
    const rowData = rows[rowIdx]?.data || {};
    const startValue = initialChar !== undefined ? initialChar : String(rowData[field] || '');
    setEditingCell(cellId);
    setEditValue(startValue);
    setFormulaValue(startValue);
    setTimeout(() => cellInputRef.current?.focus(), 0);
  }, [rows, COLUMN_MAP]);

  const commitEdit = useCallback(async () => {
    if (!editingCell) return;
    const col = editingCell.charAt(0);
    const rowIdx = parseInt(editingCell.substring(1)) - 1;
    const field = COLUMN_MAP[col];
    const row = rows[rowIdx];
    setEditingCell(null);
    if (row) {
      try {
        await api.patch(`/rows/${row.id}/cell`, { column: field, value: editValue });
        mutate(`/sheets/${SHEET_ID}/rows`);
      } catch (error) { console.error('Commit failed:', error); }
    }
  }, [editingCell, editValue, rows, COLUMN_MAP]);

  const moveActiveCell = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    const col = activeCell.charAt(0);
    const row = parseInt(activeCell.substring(1));
    let newCol = col;
    let newRow = row;
    const colIndex = COLUMNS.indexOf(col);
    const maxRows = rows.length || 100;
    if (direction === 'UP' && row > 1) newRow--;
    if (direction === 'DOWN' && row < maxRows) newRow++;
    if (direction === 'LEFT' && colIndex > 0) newCol = COLUMNS[colIndex - 1];
    if (direction === 'RIGHT' && colIndex < COLUMNS.length - 1) newCol = COLUMNS[colIndex + 1];
    selectCell(`${newCol}${newRow}`);
  }, [activeCell, COLUMNS, rows.length, selectCell]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isGridFocused) return;
      if (editingCell) {
        if (e.key === 'Escape') { e.preventDefault(); setEditingCell(null); }
        if (e.key === 'Enter') { e.preventDefault(); commitEdit(); moveActiveCell('DOWN'); }
        return;
      }
      if (["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Tab", "Enter"].includes(e.key)) {
        e.preventDefault();
        if (e.key === "ArrowUp") moveActiveCell('UP');
        if (e.key === "ArrowDown") moveActiveCell('DOWN');
        if (e.key === "ArrowLeft") moveActiveCell('LEFT');
        if (e.key === "ArrowRight") moveActiveCell('RIGHT');
        if (e.key === "Enter") moveActiveCell('DOWN');
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isGridFocused, editingCell, commitEdit, moveActiveCell]);

  const handleCallLead = () => {
    if (activeLead) {
      setCallActive(true);
    }
  };

  const Row = ({ index, style }: { index: number; style: React.CSSProperties }) => {
    const row = rows[index];
    const rNum = row?.rowIndex || index + 1;
    const isFlashing = flashCells[rNum];

    return (
      <div style={style} className={cn("flex border-b border-border group transition-colors", isFlashing && "bg-primary/20")}>
        <div className="sticky left-0 z-20 w-[30px] flex items-center justify-center text-[8px] font-black shrink-0 h-full select-none bg-surface-2 border-r border-border text-text-muted">
          {rNum}
        </div>
        <div className="flex relative items-center">
          {COLUMNS.map((col: string) => {
            const cellId = `${col}${rNum}`;
            const field = COLUMN_MAP[col];
            const val = row?.data?.[field] || "";
            const isEditing = editingCell === cellId;
            return (
              <div 
                key={cellId} id={`cell-${cellId}`}
                onDoubleClick={() => startEditing(cellId)}
                onClick={() => selectCell(cellId)}
                className={cn(
                  "w-[160px] border-r border-border px-2 flex items-center text-[10px] font-mono cursor-cell shrink-0 h-full transition-colors",
                  isEditing ? "bg-background ring-1 ring-primary z-40" : "bg-surface group-hover:bg-surface-2"
                )}
              >
                {isEditing ? (
                  <input 
                    ref={cellInputRef} 
                    value={editValue} 
                    onChange={(e) => { setEditValue(e.target.value); setFormulaValue(e.target.value); }}
                    onBlur={commitEdit}
                    autoFocus
                    className="absolute inset-0 w-full h-full px-2 outline-none font-mono bg-background text-foreground text-[10px]"
                  />
                ) : (
                  <span className="truncate">{val}</span>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div 
      ref={gridContainerRef}
      onFocus={() => setIsGridFocused(true)}
      onBlur={() => setIsGridFocused(false)}
      tabIndex={0}
      className="flex flex-col h-screen bg-bg text-text font-sans selection:bg-primary selection:text-white outline-none overflow-hidden"
    >
      <div className="h-6 bg-surface-2 border-b border-border flex items-center px-4 overflow-hidden shrink-0">
         <div className="flex space-x-8 text-[9px] font-mono text-text-muted font-bold whitespace-nowrap">
            <span className="text-primary flex items-center gap-1"><Activity size={10}/> LIVE FEED:</span>
            {tickerMsgs.map((msg, i) => (
              <span key={i} className={i === 0 ? "text-success" : ""}>{msg}</span>
            ))}
         </div>
      </div>

      <header className="flex shrink-0 items-center justify-between px-6 py-3 bg-surface border-b border-border z-50">
        <div className="flex items-center space-x-8">
           <div>
             <h1 className="text-xl font-black tracking-tighter uppercase leading-none text-foreground flex items-center gap-2">
               <Cpu size={20} className="text-primary"/> Alpha CRM
             </h1>
             <p className="text-[8px] font-mono text-text-muted uppercase tracking-[0.2em] mt-1">Terminal T-01 // Hyper-Scale</p>
           </div>
           
           <div className="flex items-center bg-surface-2 border border-border rounded-md px-3 py-1.5 focus-within:ring-1 focus-within:ring-primary group transition-all">
              <Search size={14} className="text-text-muted group-focus-within:text-primary mr-2" />
              <input 
                type="text" 
                placeholder="REGISTRY QUERY..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="bg-transparent text-[10px] font-mono uppercase tracking-widest outline-none w-64 placeholder:text-text-muted"
              />
           </div>
        </div>

        <div className="flex items-center space-x-4">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-surface-2 border-border text-[9px] font-mono h-8">
              <SelectValue placeholder="FILTER RECORDS" />
            </SelectTrigger>
            <SelectContent className="bg-surface border-border">
              <SelectItem value="ALL">ALL RECORDS</SelectItem>
              <SelectItem value="NEW">NEW</SelectItem>
              <SelectItem value="CONTACTED">CONTACTED</SelectItem>
              <SelectItem value="INTERESTED">INTERESTED</SelectItem>
            </SelectContent>
          </Select>

          <Separator orientation="vertical" className="h-4 bg-border" />

          <input type="file" ref={fileInputRef} onChange={(e) => {}} accept=".csv,.json" className="hidden" />
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} className="text-[9px] font-mono font-bold uppercase tracking-widest border-border hover:bg-surface-2 h-8">
            <Upload size={12} className="mr-2" /> Import
          </Button>
          <Button size="sm" onClick={() => setIsAddLeadDialogOpen(true)} className="bg-primary hover:bg-primary-dark text-white text-[9px] font-black uppercase tracking-widest h-8 px-4">
            <Plus size={12} className="mr-2" /> New Entity
          </Button>
        </div>
      </header>

      <main className="flex flex-grow overflow-hidden">
        <aside className="w-56 bg-surface border-r border-border flex flex-col shrink-0">
           <ScrollArea className="flex-1">
             <div className="p-4 space-y-6">
                <section>
                  <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest border-b border-border pb-2 mb-3 flex items-center gap-2">
                    <Phone size={10}/> Active Floor
                  </h3>
                  <div className="space-y-3">
                     {[
                       { id: 402, status: 'ON CALL', time: '12m 04s', caller: 'Lead #4092' },
                       { id: 408, status: 'WRAP UP', time: '0m 45s', caller: '-' },
                       { id: 412, status: 'IDLE', time: '3m 12s', caller: '-' },
                     ].map(agent => (
                       <Card key={agent.id} className="bg-surface-2 border-border p-2 rounded">
                          <div className="flex justify-between items-center">
                             <span className="text-[9px] font-bold font-mono">A-{agent.id}</span>
                             <span className={cn("text-[8px] font-black px-1.5 py-0.5 rounded", 
                               agent.status === 'ON CALL' ? 'bg-success/20 text-success' : 'bg-surface text-text-muted'
                             )}>{agent.status}</span>
                          </div>
                          <div className="text-text-muted text-[8px] flex justify-between mt-2 font-mono italic">
                             <span>{agent.caller}</span>
                             <span>{agent.time}</span>
                          </div>
                       </Card>
                     ))}
                  </div>
                </section>

                <section>
                  <h3 className="text-[9px] font-black text-text-muted uppercase tracking-widest border-b border-border pb-2 mb-3 flex items-center gap-2">
                    <Database size={10}/> Core Metrics
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    <Card className="bg-surface-2 border-border p-2 text-center">
                       <div className="text-[8px] text-text-muted mb-1 font-black">Q-DEPTH</div>
                       <div className="text-xs font-bold text-foreground">14</div>
                    </Card>
                    <Card className="bg-surface-2 border-border p-2 text-center border-success/30">
                       <div className="text-[8px] text-text-muted mb-1 font-black">SLA</div>
                       <div className="text-xs font-bold text-success">98.2%</div>
                    </Card>
                  </div>
                </section>
             </div>
           </ScrollArea>
           
           <div className="p-4 bg-surface-2 border-t border-border">
              <div className="flex items-center gap-2 mb-2">
                <div className="h-2 w-2 rounded-full bg-success animate-pulse" />
                <span className="text-[8px] font-bold text-text-muted uppercase">Core Sync: Active</span>
              </div>
              <div className="h-1 w-full bg-surface rounded-full overflow-hidden">
                <div className="h-full bg-primary w-2/3" />
              </div>
           </div>
        </aside>

        <div className="flex-grow flex flex-col overflow-hidden bg-background">
          <div className="flex border-b border-border bg-surface-2 items-center h-8 shrink-0">
            <div className="w-12 h-full flex items-center justify-center font-mono font-bold text-white text-[9px] bg-primary shrink-0 tracking-widest select-none">
              <Terminal size={10} className="mr-1"/>{activeCell}
            </div>
            <Separator orientation="vertical" className="h-full bg-border" />
            <input 
              type="text" 
              value={formulaValue}
              onChange={(e) => setFormulaValue(e.target.value)}
              className="flex-grow bg-transparent outline-none px-4 text-[10px] font-mono font-bold text-foreground"
              placeholder="READY TO COMMIT..."
            />
          </div>

          <ScrollArea className="flex-grow relative border-l border-border">
            <div className="flex sticky top-0 z-40 bg-surface-2 border-b border-border">
              <div className="w-[30px] h-8 border-r border-border shrink-0" />
              <div className="flex">
                {HEADERS.map((h: string, i: number) => (
                  <div key={i} className="w-[160px] h-8 border-r border-border flex items-center px-3 shrink-0 group hover:bg-surface transition-colors cursor-pointer select-none">
                    <span className="text-[8px] font-black text-text-muted mr-3 group-hover:text-primary transition-colors">{COLUMNS[i]}</span> 
                    <span className="text-[9px] font-black uppercase tracking-widest text-foreground">{h}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative min-h-full">
               <div ref={highlightRef} className="absolute border-[2px] border-primary z-30 pointer-events-none transition-all duration-75 ease-out shadow-[0_0_8px_rgba(99,102,241,0.4)]" style={{ width: 0, height: 0, left: -100, top: -100, display: activeCell ? 'block' : 'none' }} />
               <VirtualList
                  defaultHeight={1000}
                  rowCount={rows.length}
                  rowHeight={28}
                  className="no-scrollbar"
                  rowComponent={Row as any}
                  rowProps={{}}
               />
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </main>

      <Softphone onCallStart={() => setCallActive(true)} onCallEnd={() => setCallActive(false)} />
      {isAIOverlayOpen && (
        <AIOverlay 
          activeLead={activeLead} 
          callActive={callActive} 
          onClose={() => setIsAIOverlayOpen(false)} 
        />
      )}
      <CustomerWorkspace 
        isOpen={isCommDrawerOpen} 
        onClose={() => setIsCommDrawerOpen(false)} 
        activeLead={activeLead} 
        onCall={handleCallLead}
      />

      <AddLeadDialog 
        isOpen={isAddLeadDialogOpen}
        onClose={() => setIsAddLeadDialogOpen(false)}
        onSuccess={() => mutate(`/sheets/${SHEET_ID}/rows`)}
        columns={sheet?.columns || []}
        sheetId={SHEET_ID}
      />
    </div>
  );
}
