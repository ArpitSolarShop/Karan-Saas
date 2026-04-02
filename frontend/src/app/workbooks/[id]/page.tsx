"use client";

import { useEffect, useState, useRef, ReactNode, CSSProperties } from "react";
import useSWR, { mutate } from "swr";
import api from "@/lib/api";
import { VariableSizeGrid as Grid } from "react-window";
import { Plus, ArrowLeft, Loader2, Save, Filter, Download } from "lucide-react";
import Link from "next/link";
import { useRealtimeSocket } from "@/hooks/useRealtimeSocket";
import { toast } from "@/components/ui/use-toast";

// Configs
const ROW_HEIGHT = 40;
const HEADER_HEIGHT = 44;
const DEFAULT_COLUMN_WIDTH = 150;

/**
 * ---------------------------------------------------------
 * Inline Cell Editor Component
 * ---------------------------------------------------------
 */
function CellEditor({ 
  initialValue, 
  onSave, 
  onCancel,
  dataType 
}: { 
  initialValue: any; 
  onSave: (val: any) => Promise<void>; 
  onCancel: () => void;
  dataType: string;
}) {
  const [val, setVal] = useState(initialValue || "");
  const [saving, setSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    // Select all text if it's text/number
    if (inputRef.current && (dataType === "TEXT" || dataType === "NUMBER" || dataType === "DECIMAL")) {
      inputRef.current.select();
    }
  }, [dataType]);

  const handleCommit = async () => {
    if (val === initialValue) {
      onCancel();
      return;
    }
    setSaving(true);
    try {
      await onSave(val);
    } catch (err: any) {
      // Revert happens at the parent level, but let's show toast here if failed
      toast({
        title: "DNC or Duplicate Blocked",
        description: err.response?.data?.message || err.message,
        variant: "destructive"
      });
    } finally {
      setSaving(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleCommit();
    if (e.key === "Escape") onCancel();
    if (e.key === "Tab") {
      e.preventDefault();
      handleCommit();
      // Complex grids move focus here, for now MVP just saves
    }
  };

  return (
    <div className={`w-full h-full flex items-center ${saving ? "opacity-50 pointer-events-none" : ""}`}>
      <input
        ref={inputRef}
        type={dataType === "NUMBER" ? "number" : "text"}
        className="w-full h-full px-2 outline-none border-2 border-primary focus:ring-0 bg-surface shadow-lg text-sm text-foreground"
        value={val}
        onChange={(e) => setVal(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleCommit}
        disabled={saving}
      />
    </div>
  );
}

/**
 * ---------------------------------------------------------
 * Main Spreadsheet Page View
 * ---------------------------------------------------------
 */
export default function SpreadsheetView({ params }: { params: { id: string } }) {
  const sheetId = params.id;
  const socket = useRealtimeSocket();

  // Fetch sheet metadata (columns, views)
  const { data: sheet, isLoading: sheetLoading } = useSWR(`/sheets/${sheetId}`, () => 
    api.get(`/sheets/${sheetId}`).then(res => res.data)
  );

  // Fetch rows
  const { data: rowsData, isLoading: rowsLoading } = useSWR(`/sheets/${sheetId}/rows`, () => 
    api.get(`/sheets/${sheetId}/rows`).then(res => res.data)
  );

  const [rows, setRows] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  
  const [editingCell, setEditingCell] = useState<{ rowId: string, colKey: string } | null>(null);
  const [addingRow, setAddingRow] = useState(false);

  // Sync state when data loads
  useEffect(() => {
    if (rowsData) setRows(rowsData);
  }, [rowsData]);

  useEffect(() => {
    if (sheet) setColumns(sheet.columns || []);
  }, [sheet]);

  // WebSocket Bindings
  useEffect(() => {
    if (!socket) return;
    
    const onRowUpdated = (updatedRow: any) => {
      if (updatedRow.sheetId !== sheetId) return;
      setRows(prev => {
        const idx = prev.findIndex(r => r.id === updatedRow.id);
        if (idx !== -1) {
          const newRows = [...prev];
          newRows[idx] = updatedRow; // Update in place
          return newRows;
        }
        return [...prev, updatedRow]; // New row appended
      });
    };

    const onSheetUpdated = (data: { sheetId: string }) => {
      if (data.sheetId === sheetId) {
        // Just re-fetch columns
        mutate(`/sheets/${sheetId}`);
      }
    };

    socket.on("rowUpdated", onRowUpdated);
    socket.on("sheetUpdated", onSheetUpdated);

    return () => {
      socket.off("rowUpdated", onRowUpdated);
      socket.off("sheetUpdated", onSheetUpdated);
    };
  }, [socket, sheetId]);

  const handleAddColumn = async () => {
    const name = prompt("Enter new column name:");
    if (!name) return;
    const key = name.toLowerCase().replace(/\s+/g, '_');
    await api.post(`/sheets/${sheetId}/columns`, { key, name, dataType: "TEXT" });
    mutate(`/sheets/${sheetId}`);
  };

  const handleSaveCell = async (rowId: string, colKey: string, newValue: any) => {
    const originalRows = [...rows];
    setEditingCell(null);

    // Optimistic update
    setRows(prev => prev.map(r => r.id === rowId ? { ...r, data: { ...r.data, [colKey]: newValue } } : r));

    try {
      if (rowId === "NEW") {
        // It's a new row insertion triggered by inline adding
        await api.post(`/sheets/${sheetId}/rows`, { [colKey]: newValue });
      } else {
        await api.patch(`/rows/${rowId}/cell`, { column: colKey, value: newValue });
      }
    } catch (error: any) {
      // Revert pessimistic on error (DNC/Duplicate blocking hits this)
      setRows(originalRows);
      
      const msg = error.response?.data?.message || "Failed to save.";
      toast({
        title: "Update Failed",
        description: msg,
        variant: "destructive"
      });
      // Play a little error sound if we had one
    }
  };

  const handleAddRowClick = async () => {
    setAddingRow(true);
    try {
      await api.post(`/sheets/${sheetId}/rows`, { });
    } catch (e: any) {
      toast({
        title: "Error adding row",
        description: e.message,
        variant: "destructive"
      });
    } finally {
      setAddingRow(false);
    }
  };

  if (sheetLoading || rowsLoading) {
    return (
      <div className="flex h-full items-center justify-center text-text-muted">
        <Loader2 className="animate-spin h-8 w-8" />
      </div>
    );
  }

  // Virtualized Grid Renderer function
  const Cell = ({ columnIndex, rowIndex, style }: { columnIndex: number, rowIndex: number, style: CSSProperties }) => {
    const col = columns[columnIndex];
    const row = rows[rowIndex];

    if (!col) return null;

    // Header Row implementation in generic grid is tricky, we'll put header outside grid or shift indices.
    // simpler: Let's assume indices match precisely.
    const isEditing = editingCell?.rowId === row.id && editingCell?.colKey === col.key;
    const cellValue = row.data[col.key] || "";

    return (
      <div 
        style={style} 
        className={`border-b border-r border-border bg-surface-2 hover:bg-surface flex flex-col justify-center px-3 truncate text-sm transition-colors text-foreground ${isEditing ? 'p-0 z-10' : ''}`}
        onClick={() => !isEditing && setEditingCell({ rowId: row.id, colKey: col.key })}
      >
        {isEditing ? (
          <CellEditor 
            initialValue={cellValue} 
            dataType={col.dataType}
            onSave={(val) => handleSaveCell(row.id, col.key, val)}
            onCancel={() => setEditingCell(null)}
          />
        ) : (
          <span className="truncate">{cellValue}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full bg-background overflow-hidden relative">
      {/* TOOLBAR */}
      <div className="h-14 border-b border-border bg-surface shrink-0 flex items-center justify-between px-4">
        <div className="flex items-center gap-4">
          <Link href="/workbooks" className="p-2 hover:bg-surface-2 rounded-md transition text-text-muted">
            <ArrowLeft size={16} />
          </Link>
          <div className="flex items-center gap-2">
            <div className="h-6 w-6 rounded-md bg-primary/20 flex items-center justify-center text-primary">
              <Table size={14} />
            </div>
            <h1 className="text-sm font-bold uppercase tracking-wider">{sheet?.name || "Loading..."}</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="h-8 px-3 rounded-md border border-border bg-surface-2 hover:bg-surface flex items-center gap-2 text-xs font-bold text-text-muted">
            <Filter size={14} /> Filter
          </button>
          <button className="h-8 px-3 rounded-md border border-border bg-surface-2 hover:bg-surface flex items-center gap-2 text-xs font-bold text-text-muted">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* SPREADSHEET CANVAS */}
      <div className="flex-1 w-full h-full overflow-auto relative bg-surface-2 p-4">
        <div className="bg-background border border-border shadow-xl rounded-lg overflow-hidden flex flex-col h-full w-full">
          
          {/* HEADER ROW */}
          <div className="flex bg-surface border-b border-border shadow-sm z-10 relative">
            <div className="w-[50px] shrink-0 border-r border-border bg-surface-2 flex items-center justify-center text-text-muted text-xs font-bold font-mono">
              #
            </div>
            {columns.map(col => (
              <div 
                key={col.id} 
                className="shrink-0 flex items-center justify-between px-3 font-bold text-[11px] text-text-muted uppercase tracking-wider border-r border-border hover:bg-surface-2 transition"
                style={{ width: col.width || DEFAULT_COLUMN_WIDTH, height: HEADER_HEIGHT }}
              >
                <span>{col.name}</span>
              </div>
            ))}
            <button 
              onClick={handleAddColumn}
              className="w-[100px] shrink-0 flex items-center justify-center gap-1 text-[11px] font-bold text-primary hover:bg-primary/10 transition h-[44px]"
            >
              <Plus size={14} /> COLUMN
            </button>
          </div>

          {/* VIRTUALIZED DATA GRID */}
          <div className="flex-1 w-full relative flex">
             {/* Sticky Row Numbers */}
            <div className="w-[50px] shrink-0 border-r border-border bg-surface-2 flex flex-col pt-0 z-10">
              {rows.map((row, idx) => (
                <div key={row.id} className="w-full flex items-center justify-center text-text-muted text-[10px] font-mono border-b border-border" style={{ height: ROW_HEIGHT }}>
                  {idx + 1}
                </div>
              ))}
              <div className="w-full flex items-center justify-center text-text-muted border-b border-border hover:bg-green-500/10 cursor-pointer transition" style={{ height: ROW_HEIGHT }}>
                <Plus size={14} className="text-green-500" onClick={handleAddRowClick} />
              </div>
            </div>

            {/* Virtualized Body */}
            {columns.length > 0 && rows.length > 0 ? (
              <div className="flex-1 h-full max-h-full overflow-hidden">
                <Grid
                  columnCount={columns.length}
                  columnWidth={index => columns[index].width || DEFAULT_COLUMN_WIDTH}
                  height={1200} // This should ideally be autoSizer height, but putting a large number for MVP wrapper scrolling
                  rowCount={rows.length}
                  rowHeight={() => ROW_HEIGHT}
                  width={3000} // AutoSizer width
                  itemData={{ rows, columns }}
                  className="scrollbar-thin scrollbar-thumb-border scrollbar-track-transparent"
                >
                  {Cell}
                </Grid>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-text-muted p-10">
                {columns.length === 0 ? "Add your first column to start." : "Click the + button to add a row."}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
