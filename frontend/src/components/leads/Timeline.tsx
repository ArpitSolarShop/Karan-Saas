"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { fetcher } from "@/lib/api";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  GitCommit, 
  User, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCcw,
  ArrowRight,
  Phone,
  Briefcase,
  CheckSquare,
  FileText
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface TimelineProps {
  leadId: string;
}

export default function Timeline({ leadId }: TimelineProps) {
  const { data: logs, isLoading } = useSWR(
    leadId ? `/audit-logs?entityType=Lead&entityId=${leadId}` : null,
    fetcher,
    { refreshInterval: 5000 }
  );

  const sortedLogs = useMemo(() => {
    if (!logs) return [];
    return [...logs].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }, [logs]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-40 gap-2">
        <RefreshCcw className="animate-spin text-primary opacity-50" size={20}/>
        <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Syncing Audit Trail...</span>
      </div>
    );
  }

  if (sortedLogs.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-40 text-center px-8">
        <GitCommit className="text-muted-foreground opacity-20 mb-2" size={32}/>
        <p className="text-[10px] text-muted-foreground uppercase font-black tracking-tighter">Genesis Record Only</p>
        <p className="text-[8px] text-muted-foreground opacity-50 mt-1">No secondary mutations detected in this cycle.</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-full">
      <div className="p-4 space-y-6">
        <div className="relative border-l-2 border-primary/20 ml-3 pl-6 space-y-8 pb-4">
          {sortedLogs.map((log: any, idx: number) => (
            <div key={log.id} className="relative">
              {/* Connector Dot */}
              <div className={cn(
                "absolute -left-[31px] top-1 h-3 w-3 rounded-full border-2 border-[#1a1a2e] z-10",
                idx === 0 ? "bg-primary animate-pulse shadow-[0_0_8px_rgba(var(--primary),0.5)]" : "bg-primary/40"
              )} />

              <div className="flex flex-col gap-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className={cn(
                      "p-1 rounded-md bg-surface-3 border border-border/50",
                      log.action.includes('CALL') && "text-blue-400",
                      log.action.includes('DEAL') && "text-emerald-400",
                      log.action.includes('TASK') && "text-amber-400",
                      log.action.includes('WORKFLOW') && "text-purple-400"
                    )}>
                      {getActionIcon(log.action)}
                    </span>
                    <span className="text-[10px] font-black text-foreground uppercase tracking-tight">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <span className="text-[8px] font-mono text-muted-foreground">
                    {formatDistanceToNow(new Date(log.createdAt))} ago
                  </span>
                </div>

                <div className="flex items-center gap-1.5 text-[9px] text-muted-foreground ml-7 mb-2">
                  <User size={10} className="text-primary/70"/>
                  <span className="font-bold opacity-80">{log.user ? `${log.user.firstName} ${log.user.lastName || ''}` : 'SYSTEM'}</span>
                </div>

                {log.details && (
                  <div className="bg-surface-2 ml-7 p-3 rounded-lg border border-border/40 overflow-hidden shadow-sm">
                    {renderDetails(log)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </ScrollArea>
  );
}

function getActionIcon(action: string) {
  if (action.includes('WORKFLOW')) return <Zap size={10}/>;
  if (action.includes('CALL')) return <Phone size={10}/>;
  if (action.includes('DEAL')) return <Briefcase size={10}/>;
  if (action.includes('TASK')) return <CheckSquare size={10}/>;
  if (action.includes('NOTE')) return <FileText size={10}/>;
  if (action === 'CREATE' || action.includes('CREATED')) return <CheckCircle2 size={10}/>;
  if (action === 'DELETE' || action.includes('DELETED')) return <AlertCircle size={10}/>;
  return <GitCommit size={10}/>;
}

function renderDetails(log: any) {
  const details = log.details || {};
  
  // 1. Workflow Metadata View
  if (details.metadata?.ruleName) {
    return (
      <div className="space-y-1">
        <div className="text-[8px] font-black text-primary/80 uppercase tracking-widest">Automation Triggered</div>
        <div className="text-[10px] text-foreground font-bold">{details.metadata.ruleName}</div>
        <div className="text-[8px] text-muted-foreground flex items-center gap-1">
          {details.metadata.trigger} <ArrowRight size={8}/> {details.metadata.action}
        </div>
      </div>
    );
  }

  // 2. Diff View (Old vs New)
  if (details.oldValues && details.newValues) {
    const changedFields = Object.keys(details.newValues).filter(key => {
      const oldVal = details.oldValues[key];
      const newVal = details.newValues[key];
      // Skip internal fields and unchanged values
      return JSON.stringify(oldVal) !== JSON.stringify(newVal) && 
             !['updatedAt', 'id', 'tenantId', 'createdBy', 'createdAt'].includes(key);
    });

    if (changedFields.length === 0) return <span className="text-[8px] italic opacity-50">State maintained without mutation.</span>;

    return (
      <div className="space-y-2">
        {changedFields.map(field => (
          <div key={field} className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black text-muted-foreground uppercase opacity-70">{field}</span>
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="text-[9px] line-through opacity-40 truncate">{String(details.oldValues[field] === null ? 'null' : details.oldValues[field])}</span>
              <ArrowRight size={8} className="shrink-0 text-primary opacity-50"/>
              <span className="text-[9px] font-bold text-success truncate">{String(details.newValues[field])}</span>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // 3. Status/Creation View
  if (details.newValues) {
    const keys = Object.keys(details.newValues).filter(k => !['id', 'tenantId', 'createdAt', 'updatedAt'].includes(k));
    return (
      <div className="space-y-1">
        <div className="text-[9px] text-muted-foreground font-medium italic">
          Initialized record with {keys.length} core attributes.
        </div>
        {details.newValues.note && (
          <div className="text-[10px] text-foreground mt-1 border-l-2 border-primary/20 pl-2">
            {details.newValues.note}
          </div>
        )}
      </div>
    );
  }

  return null;
}

